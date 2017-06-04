import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { vec3 } from 'gl-matrix'

import Renderer from '../Renderer'
import Hemisphere from '../../models/Hemisphere'
import { random, randomRGB, grayscaleRGB } from '../../services/jsUtil'

export class World extends Component {

  componentWillMount () {
    this.dim = 1000
    const N = 100
    const cells = []
    cells.length = N
    const minDim = this.dim / 16
    const maxDim = 2 * minDim
    for (let i = 0; i < N; ++i) {
      const z = random(minDim, maxDim)
      cells[i] = {
        width: Math.floor(random(minDim, maxDim)),
        height: Math.floor(0.5 * (minDim + maxDim)),
        zIndex: Math.floor(z),
        backgroundColor: randomRGB(192, 230)
      }
    }
    this.cells = cells
  }

  componentDidMount () {
    this.startRender()
  }

  startRender () {
    if (this.renderer) return
    const world = this.refs.World
    if (!world) return
    this.renderer = new Renderer()
    const width = world.clientWidth
    const height = world.clientHeight
    const hemispheres = this.buildHemispheres(width, height)
    const workers = 8
    const raysPerHemi = 16
    this.renderer.render(workers, world, hemispheres, width, height, raysPerHemi, this.progress)
  }

  zIndex = (x, y) => {
    // This is pretty slow, and could probably be optimized using the element tree
    const element = document.elementFromPoint(x, y)
    return element ? element.style.zIndex : 0
  }

  buildHemispheres = (width, height) => {
    const t0 = performance.now()
    const hemispheres = []
    hemispheres.length = width * height
    const N = vec3.create()
    vec3.set(N, 0, 0, 1)
    let i = 0
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const z = this.zIndex(x, y)
        const P = vec3.create()
        vec3.set(P, x, y, z)
        hemispheres[i++] = new Hemisphere(P, N)
      }
    }
    const sec = (performance.now() - t0) / 1000
    console.log('Building ' + hemispheres.length + ' hemis took ' + sec.toLocaleString(undefined, {maximumFractionDigits: 2}))
    return hemispheres
  }

  progress = (pct, msg, image) => {
    pct = Math.round(100 * pct)
    console.log(`${pct}% ${msg}`)
    const ctx = this.refs.canvas.getContext('2d')
    ctx.putImageData(image, 0, 0)
    this.refs.canvas.style.zIndex = 10000
    this.forceUpdate()
  }

  render () {
    const style = {width: this.dim, height: this.dim}
    return (
      <div className="World" style={style}>
        <div className="World-scene" ref="World">
          { this.cells.map((cell, i) => <div key={i} className="World-cell" style={cell}/>) }
        </div>
        <canvas className="World-canvas" ref="canvas" width={this.dim} height={this.dim}/>
      </div>
    )
  }
}

export default connect(state => ({
}), dispatch => ({
  actions: bindActionCreators({
  }, dispatch)
}))(World)
