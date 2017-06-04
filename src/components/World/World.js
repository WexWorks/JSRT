import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { vec3 } from 'gl-matrix'

import Renderer from '../Renderer'
import WrapGrid from './WrapGrid'
import Hemisphere from '../../models/Hemisphere'

export class World extends Component {

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
    const width = 500
    const height = 500
    const style = {width, height}
    return (
      <div className="World" style={style}>
        <div className="World-scene" ref="World">
          <WrapGrid width={width} height={height} count={100}/>
        </div>
        <canvas className="World-canvas" ref="canvas" width={width} height={height}/>
      </div>
    )
  }
}

export default connect(state => ({
}), dispatch => ({
  actions: bindActionCreators({
  }, dispatch)
}))(World)
