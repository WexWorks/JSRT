const HemisphereWorker = require('worker-loader!./HemisphereWorker.js')

import { hemisphereSampleCos } from 'hemisphere-sample'
import { distance } from './HemisphereWorker'
import { vec3 } from 'gl-matrix'
import Hemisphere from '../../models/Hemisphere'

export default class Renderer {
  jobId = 0
  workers = []
  hemispheres = []
  totalRays = 0
  finishedRays = 0
  elementCount = 0

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
      const x = Math.floor(lobe.P[0])
      const y = Math.floor(lobe.P[1])
      const idx = 4 * (y * this.image.width + x)
      const a = 160 * lobe.hits / this.raysPerHemi
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
    const reportInterval = 250000
    const k = Math.round(n / reportInterval)
    const maxHemis = 1024
    const dim = Math.min(maxHemis, n)
    const hemis = this.hemispheres.splice(n - dim, dim)
    const jobId = this.jobId
    const workerId = worker.id
    const job = { hemis, jobId, workerId }
    worker.postMessage(job)
    if (k !== Math.round(this.hemispheres.length / reportInterval)) {
      const pct = this.finishedRays / this.totalRays
      const msg = this.hemispheres.length + ' hemispheres remaining'
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
        const secs = sec.toLocaleString(undefined, {maximumFractionDigits: 2})
        const msg = 'Render took ' + secs + ' seconds, ' + rpss + ' rays/sec'
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
    children.length = element.children.length
    for (let i = 0; i < element.children.length; ++i) {
      const child = element.children.item(i)
      children[i] = this.aabb(child)
    }
    this.elementCount += children.length
    const rect = element.getBoundingClientRect()
    const min = vec3.create()
    const max = vec3.create()
    vec3.set(min, rect.left, rect.top, 0)
    vec3.set(max, rect.right, rect.bottom, element.style.zIndex)
    const color = element.style.backgroundColor
    return { min, max, color, children }
  }

  trace (P, D, element, minD) {
    const { min, max, children } = element
    const d = distance(P, D, min, max)
    if (d !== Infinity && d > 0 && d < P[2]) {
      minD = Math.min(d, minD)
    }
    for (let i = 0; i < children.length; ++i) {
      const k = this.trace(P, D, children[i], minD)
      if (k !== Infinity && k > 0 && k < P[2]) {
        minD = Math.min(k, minD)
      }
    }
    return minD
  }

  zIndex = (x, y, world, P, D) => {
    const maxZ = 10000
    vec3.set(P, x + 0.5, y + 0.5, maxZ)
    const d = this.trace(P, D, world, Infinity)
    return d === Infinity ? 0 : maxZ - d
  }

  buildHemispheres = (width, height, world) => {
    const t0 = performance.now()
    const hemispheres = []
    hemispheres.length = width * height
    const v = vec3.create()
    const N = vec3.create()
    const D = vec3.create()
    vec3.set(D, 0, 0, -1)
    vec3.set(N, 0, 0, 1)
    let i = 0
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const z = this.zIndex(x, y, world, v, D)
        const P = vec3.create()
        vec3.set(P, x + 0.5, y + 0.5, z)
        hemispheres[i++] = new Hemisphere(P, N)
      }
    }
    const sec = (performance.now() - t0) / 1000
    const secs = sec.toLocaleString(undefined, {maximumFractionDigits: 2})
    console.log('Building ' + hemispheres.length + ' hemis took ' + secs + ' seconds')
    return hemispheres
  }

  render (threads, root, width, height, raysPerHemi, progress) {
    this.progress = progress
    const t0 = performance.now()
    const world = this.aabb(root)
    const hemispheres = this.buildHemispheres(width, height, world)
    const sec = (performance.now() - t0) / 1000
    const samples = this.hemisphereSamples(raysPerHemi)
    const totalHemis = hemispheres.length.toLocaleString()
    console.log('Render ' + totalHemis + ' hemis with ' + threads + ' workers, aabb took ' + sec.toLocaleString(undefined, {maximumFractionDigits: 2}) + ' seconds, with ' + this.elementCount + ' elements')
    this.createWorkers(threads, world, samples)
    this.raysPerHemi = raysPerHemi
    this.totalRays = hemispheres.length * raysPerHemi
    this.hemispheres = hemispheres
    this.image = new ImageData(width, height)
    this.startTime = performance.now()
    this.workers.forEach(worker => this.nextJob(worker))
  }
}
