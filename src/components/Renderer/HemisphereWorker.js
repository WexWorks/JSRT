import { intersection } from 'ray-aabb-intersection'

function traceHemisphere ({ P, N, count }) {
  const Nb = {x: 0, y: 0, z: 0}
  const hits = count * Math.random()
  return { count, hits, Nb }
}

onmessage = function (msg) {
  const job = msg.data
  const lobes = job.hemis.map(hemi => traceHemisphere(hemi))
  const { workerId, jobId, hemis } = job
  postMessage({
    workerId,
    jobId,
    lobes,
    hemis
  })
}
