import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Renderer from '../Renderer'
import Hemisphere from '../../models/Hemisphere'
import { random, randomRGB } from '../../services/jsUtil'

export class World extends Component {

  componentDidMount () {
    this.startRender()
  }

  componentWillReceiveProps (nextProps) {
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
    this.renderer.render(6, hemispheres, width, height, this.progress)
  }

  zIndex = (x, y) => (Math.random() * 10)

  buildHemispheres = (width, height) => {
    const hemispheres = []
    const N = { x: 0, y: 0, z: 1 }
    const count = 16
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const z = this.zIndex(x, y)
        const P = { x, y, z }
        const hemi = new Hemisphere(P, N, count)
        hemispheres.push(hemi)
      }
    }
    return hemispheres
  }

  progress = (pct, msg, image) => {
    console.log(`${pct}: ${msg}`)
    const ctx = this.refs.World.getContext('2d')
    ctx.putImageData(image, 0, 0)
    this.forceUpdate()
  }

  render () {
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
    return (
      <div className="World">
        { cells.map((cell, i) => (
          <div key={i} className="World-cell"
               style={{
                 width: cell.width,
                 height: cell.height,
                 zIndex: cell.depth,
                 backgroundColor: randomRGB(200)
               }}/>
        ))}
        <canvas className="World-canvas" ref="World"/>
      </div>
    )
  }
}

export default connect(state => ({
}), dispatch => ({
  actions: bindActionCreators({
  }, dispatch)
}))(World)
