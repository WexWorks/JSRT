import intersection from 'ray-aabb-intersection'
import { vec3, mat3 } from 'gl-matrix'

function traceRay (ray, element, t0) {
  const { min, max, children } = element
  const aabb = [min, max]
  if (intersection(t0, ray.P, ray.D, aabb)) {
    return true
  }
  for (let i = 0; i < children.length; ++i) {
    if (traceRay(ray, children[i])) {
      return true
    }
  }
  return false
}

function buildOrthonormal (T, N, X, Y) {
  vec3.set(X, 1, 0, 0)
  vec3.cross(X, X, N)
  vec3.normalize(X, X)
  vec3.set(Y, 0, 1, 0)
  vec3.cross(Y, Y, N)
  vec3.normalize(Y, Y)
  mat3.set(T,
    X[0], X[1], X[2],
    Y[0], Y[1], Y[2],
    N[0], N[1], N[2],
  )
}

function traceHemisphere ({ P, N, count }, samples, world, v0, v1, T) {
  let hits = 0
  buildOrthonormal(T, N, v0, v1)
  for (let i = 0; i < samples.length; ++i) {
    const sample = samples[i]
    vec3.transformMat3(v0, sample, T)
    const ray = { P, D: v0 }
    if (traceRay(ray, world, v1)) hits++
  }
  const Nb = N
  return { P, count, hits, Nb }
}

onmessage = function (msg) {
  const job = msg.data
  if (job.world) this.world = job.world
  if (job.samples) this.samples = job.samples
  if (job.hemis) {
    const v0 = vec3.create()
    const v1 = vec3.create()
    const T = mat3.create()
    const lobes = job.hemis.map(hemi => traceHemisphere(hemi, this.samples, this.world, v0, v1, T))
    const { workerId, jobId } = job
    postMessage({ workerId, jobId, lobes })
  }
}
