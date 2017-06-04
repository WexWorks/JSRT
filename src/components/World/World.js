import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Renderer from '../Renderer'
import Boxes from './Boxes'

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
    const workers = 8
    const raysPerHemi = 64
    this.renderer.render(workers, world, width, height, raysPerHemi, this.progress)
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
          <Boxes width={width} height={height} count={100}/>
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
