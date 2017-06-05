import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Renderer from '../Renderer'
import Boxes from './Boxes'

export class World extends Component {
  state = {
    frame: 0,
    renderer: null,
    workers: 8,
    raysPerHemi: 64,
    width: 500,
    height: 500,
    boxes: 100,
    message: ''
  }

  componentDidMount () {
    this.startRender()
  }

  startRender () {
    const world = this.refs.World
    if (!world) return
    const renderer = this.state.renderer || new Renderer()
    const width = world.clientWidth
    const height = world.clientHeight
    const img = new ImageData(width, height)
    this.progress(0, '', img)
    const { workers, raysPerHemi } = this.state
    renderer.render(workers, world, width, height, raysPerHemi, this.progress)
    this.setState({renderer})
  }

  delayStart () {
    clearTimeout(this.restartTimer)
    this.restartTimer = setTimeout(_ => { this.startRender() }, 250)
  }

  retrace = () => {
    this.delayStart()
  }

  progress = (pct, msg, image) => {
    pct = Math.round(100 * pct)
    console.log(`${pct}% ${msg}`)
    const ctx = this.refs.canvas.getContext('2d')
    ctx.putImageData(image, 0, 0)
    this.refs.canvas.style.zIndex = 10000
    this.forceUpdate()
    this.setState({message: msg})
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  nextFrame = () => {
    this.setStatePromise({ frame: this.state.frame + 1 })
      .then(_ => this.delayStart())
  }

  changeSamples = (event) => {
    this.setStatePromise({ raysPerHemi: Number(event.target.value) })
      .then(_ => this.delayStart())
  }

  changeWorkers = (event) => {
    this.setStatePromise({ workers: Number(event.target.value) })
      .then(_ => this.delayStart())
  }

  changeWidth = (event) => {
    this.setStatePromise({ width: Number(event.target.value) })
      .then(_ => this.delayStart())
  }

  changeHeight = (event) => {
    this.setStatePromise({ height: Number(event.target.value) })
      .then(_ => this.delayStart())
  }

  changeBoxes = (event) => {
    this.setStatePromise({ boxes: Number(event.target.value) })
      .then(_ => this.nextFrame())
  }

  render () {
    const { width, height, boxes, raysPerHemi, workers, frame, message } = this.state
    const style = {width, height}
    return (
      <div className="World">
        <div className="World-scene" ref="World" style={style}>
          <Boxes width={width} height={height} count={boxes} frame={frame}/>
        </div>
        <div className="World-controls">
          <div onClick={this.nextFrame} className="World-button">Regenerate</div>
          <div onClick={this.retrace} className="World-button">Retrace</div>
          <div className="World-number">
            <input type="number" min={1} max={999} onChange={this.changeSamples} value={raysPerHemi}/>
            <div>rays / hemisphere</div>
          </div>
          <div className="World-number">
            <input type="number" min={1} max={64} onChange={this.changeWorkers} value={workers}/>
            <div>web workers</div>
          </div>
          <div className="World-number">
            <input type="number" min={1} max={4096} onChange={this.changeWidth} value={width}/>
            <div>Width</div>
          </div>
          <div className="World-number">
            <input type="number" min={1} max={4096} onChange={this.changeHeight} value={height}/>
            <div>Height</div>
          </div>
          <div className="World-number">
            <input type="number" min={1} max={4096} onChange={this.changeBoxes} value={boxes}/>
            <div>Boxes</div>
          </div>
          <div className="World-message">{message}</div>
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
