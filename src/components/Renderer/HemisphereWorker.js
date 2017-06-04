import { vec3, mat3 } from 'gl-matrix'

const rotateSamples = true

function traceRay (P, D, element) {
  const { min, max, children } = element
  const d = distance(P, D, min, max)
  if (d !== Infinity && d > 0) return true
  for (let i = 0; i < children.length; ++i) {
    if (traceRay(P, D, children[i])) return true
  }
  return false
}

export function distance (P, D, min, max) {
  const dims = P.length
  let lo = -Infinity
  let hi = +Infinity

  for (let i = 0; i < dims; i++) {
    let dimLo = (min[i] - P[i]) / D[i]
    let dimHi = (max[i] - P[i]) / D[i]

    if (dimLo > dimHi) {
      const tmp = dimLo
      dimLo = dimHi
      dimHi = tmp
    }

    if (dimHi < lo || dimLo > hi) {
      return Infinity
    }

    if (dimLo > lo) lo = dimLo
    if (dimHi < hi) hi = dimHi
  }

  return lo > hi ? Infinity : lo
}

// T set to matrix with Z=N for rotating vectors
function buildOrthonormal (T, N, X, Y) {
  vec3.set(X, Math.random(), Math.random(), Math.random())
  vec3.normalize(X, X)
  vec3.cross(X, X, N)
  vec3.cross(X, N, X)
  vec3.normalize(X, X)
  vec3.cross(Y, X, N)
  mat3.set(T,
    X[0], X[1], X[2],
    Y[0], Y[1], Y[2],
    N[0], N[1], N[2],
  )
}

function traceHemisphere ({P, N}, samples, world, v0, v1, T) {
  let hits = 0
  if (rotateSamples) buildOrthonormal(T, N, v0, v1)
  for (let i = 0; i < samples.length; ++i) {
    const sample = samples[i]
    // vec3.set(v0, sample[0], sample[1], sample[2])
    // vec3.normalize(v0, v0)
    rotateSamples && vec3.transformMat3(v0, sample, T) || vec3.set(v0, sample[0], sample[1], sample[2])
    if (traceRay(P, v0, world, v1)) hits++
  }
  const Nb = N
  return { hits, P, Nb }
}

onmessage = function (msg) {
  const job = msg.data
  if (job.world) this.world = job.world
  if (job.samples) this.samples = job.samples
  if (job.hemis) {
    const v0 = vec3.create()
    const v1 = vec3.create()
    const T = mat3.create()
    const lobes = []
    lobes.length = job.hemis.length
    for (let i = 0; i < job.hemis.length; ++i) {
      const hemi = job.hemis[i]
      lobes[i] = traceHemisphere(hemi, this.samples, this.world, v0, v1, T)
    }
    const { workerId, jobId } = job
    postMessage({ workerId, jobId, lobes })
  }
}
