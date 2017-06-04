const HemisphereWorker = require('worker-loader!./HemisphereWorker.js')

import { hemisphereSampleCos } from 'hemisphere-sample'
import { vec3 } from 'gl-matrix'

export default class Renderer {
  jobId = 0
  workers = []
  hemispheres = []
  totalRays = 0
  finishedRays = 0

  createWorkers = (n, world, samples) => {
    this.workers.forEach(worker => worker.terminate())
    const workers = []
    for (let i = 0; i < n; ++i) {
      const worker = new HemisphereWorker()
      worker.onmessage = this.jobFinished
      worker.onerror = this.jobError
      worker.id = i
      const job = { world, samples }
      worker.postMessage(job)
      workers.push(worker)
    }
    this.workers = workers
  }

  renderHemispheres = (lobes) => {
    const data = this.image.data
    for (let i = 0; i < lobes.length; ++i) {
      const lobe = lobes[i]
      const idx = 4 * (lobe.P[1] * this.image.width + lobe.P[0])
      const r = 64
      const g = 128
      const b = 96
      const a = 255 * lobe.hits / lobe.count
      data[idx + 0] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = a
    }
  }

  nextJob = (worker) => {
    const n = this.hemispheres.length
    if (!n) {
      worker.done = true
      return
    }
    worker.done = false
    const reportInterval = 100000
    const k = Math.floor(n / reportInterval)
    const maxHemis = 1024
    const dim = Math.min(maxHemis, n)
    const hemis = this.hemispheres.splice(n - dim, dim)
    const jobId = this.jobId
    const workerId = worker.id
    const job = { hemis, jobId, workerId }
    worker.postMessage(job)
    if (k !== Math.floor(this.hemispheres.length / reportInterval)) {
      const pct = this.finishedRays / this.totalRays
      const msg = this.hemispheres.length + ' hemispheres left'
      this.progress(pct, msg, this.image)
      console.log()
    }
  }

  jobFinished = (msg) => {
    const job = msg.data
    if (job.jobId !== this.jobId) return
    const { lobes, workerId } = job
    this.renderHemispheres(lobes)
    this.finishedRays += lobes.length * this.raysPerHemi
    const worker = this.workers[workerId]
    this.nextJob(worker)
    if (!this.hemispheres.length) {
      let finished = true
      for (let i = 0; i < this.workers.length; ++i) {
        if (!this.workers[i].done) {
          finished = false
          break
        }
      }
      if (finished) {
        this.startTime = null
        const t1 = performance.now()
        const sec = (t1 - this.startTime) / 1000
        const rps = this.totalRays / sec
        const rpss = rps.toLocaleString(undefined, {maximumFractionDigits: 2})
        const msg = 'Render took ' + sec + ' seconds, ' + rpss + ' rays/sec'
        this.progress(1, msg, this.image)
        console.log()
      }
    }
  }

  jobError = (msg) => {
    console.log('Error: ' + msg)
  }

  hemisphereSamples (count) {
    const samples = []
    for (let i = 0; i < count; ++i) {
      const N = hemisphereSampleCos(i, count)
      samples.push(N)
    }
    return samples
  }

  aabb = (element) => {
    const children = []
    for (let i = 0; i < element.children.length; ++i) {
      const child = element.children.item(i)
      children.push(this.aabb(child))
    }
    const rect = element.getBoundingClientRect()
    const min = vec3.create()
    const max = vec3.create()
    vec3.set(min, rect.left, rect.top, 0)
    vec3.set(max, rect.right, rect.bottom, element.style.zIndex)
    const color = element.style.backgroundColor
    return { min, max, color, children }
  }

  render (threads, root, hemispheres, width, height, raysPerHemi, progress) {
    this.progress = progress
    this.startTime = performance.now()
    const world = this.aabb(root)
    const samples = this.hemisphereSamples(raysPerHemi)
    const totalHemis = hemispheres.length.toLocaleString()
    console.log('Render ' + totalHemis + ' hemis with ' + threads + ' workers')
    this.createWorkers(threads, world, samples)
    this.raysPerHemi = raysPerHemi
    this.totalRays = hemispheres.length * raysPerHemi
    this.hemispheres = hemispheres
    this.image = new ImageData(width, height)
    this.workers.forEach(worker => this.nextJob(worker))
  }
}
