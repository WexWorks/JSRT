import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { vec3 } from 'gl-matrix'

import Renderer from '../Renderer'
import Hemisphere from '../../models/Hemisphere'
import { random, randomRGB } from '../../services/jsUtil'

export class World extends Component {

  componentWillMount () {
    const N = 100
    const cells = []
    const minDim = 500 / 16
    const maxDim = 2 * minDim
    for (let i = 0; i < N; ++i) {
      cells.push({
        width: Math.floor(random(minDim, maxDim)),
        height: Math.floor(0.5 * (minDim + maxDim)),
        depth: random(minDim, maxDim)
      })
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
    const workers = 6
    const raysPerHemi = 16
    this.renderer.render(workers, world, hemispheres, width, height, raysPerHemi, this.progress)
  }

  zIndex = (x, y) => (Math.random() * 10)

  buildHemispheres = (width, height) => {
    const hemispheres = []
    const P = vec3.create()
    const N = vec3.create()
    vec3.set(N, 0, 0, 1)
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const z = this.zIndex(x, y)
        vec3.set(P, x, y, z)
        const hemi = new Hemisphere(P, N)
        hemispheres.push(hemi)
      }
    }
    return hemispheres
  }

  progress = (pct, msg, image) => {
    console.log(`${pct}: ${msg}`)
    const ctx = this.refs.canvas.getContext('2d')
    ctx.putImageData(image, 0, 0)
    this.forceUpdate()
  }

  render () {
    return (
      <div className="World" ref="World">
        { this.cells.map((cell, i) => (
          <div key={i} className="World-cell"
               style={{
                 width: cell.width,
                 height: cell.height,
                 zIndex: cell.depth,
                 backgroundColor: randomRGB(200)
               }}/>
        ))}
        <canvas className="World-canvas" ref="canvas"/>
      </div>
    )
  }
}

export default connect(state => ({
}), dispatch => ({
  actions: bindActionCreators({
  }, dispatch)
}))(World)
