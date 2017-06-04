const HemisphereWorker = require('worker-loader!./HemisphereWorker.js')

export default class Renderer {
  jobId = 0
  workers = []
  hemispheres = []
  imageData = null
  totalRays = 0
  finishedRays = 0

  createWorkers = (n) => {
    this.workers.forEach(worker => worker.terminate())
    const workers = []
    for (let i = 0; i < n; ++i) {
      const worker = new HemisphereWorker()
      worker.onmessage = this.jobFinished
      worker.onerror = this.jobError
      worker.id = i
      workers.push(worker)
    }
    this.workers = workers
  }

  renderHemispheres = (hemis, lobes) => {
    const data = this.image.data
    for (let i = 0; i < hemis.length; ++i) {
      const hemi = hemis[i]
      const lobe = lobes[i]
      const idx = 4 * (hemi.P.y * this.image.width + hemi.P.x)
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
    const { hemis, lobes, workerId } = job
    this.renderHemispheres(hemis, lobes)
    this.finishedRays += hemis.length * hemis[0].count
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

  render (threads, hemispheres, width, height, progress) {
    this.progress = progress
    this.startTime = performance.now()
    const totalHemis = hemispheres.length.toLocaleString()
    console.log('Render ' + totalHemis + ' hemis with ' + threads + ' workers')
    this.createWorkers(threads)
    this.totalRays = hemispheres.length * hemispheres[0].count
    this.hemispheres = hemispheres
    this.image = new ImageData(width, height)
    this.workers.forEach(worker => this.nextJob(worker))
  }
}
