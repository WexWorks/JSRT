import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { random, randomRGB, grayscaleRGB } from '../../services/jsUtil'

export default class Boxes extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    frame: PropTypes.number.isRequired
  }

  cells = []
  frame = -1

  componentWillMount () {
    this.updateCells(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.updateCells(nextProps)
  }

  updateCells (props) {
    if (props.frame != this.frame) {
      this.cells = this.buildScatterCells()
      this.frame = props.frame
    }
  }

  buildWrapCells () {
    const { width, height, count } = this.props
    const cells = []
    cells.length = count
    const div = 1.5 * Math.sqrt(count)
    const minW = width / div
    const maxW = 2 * minW
    const minH = height / div
    const maxH = 2 * minH
    for (let i = 0; i < count; ++i) {
      const z = random(minW, maxW)
      cells[i] = {
        width: Math.floor(random(minW, maxW)),
        height: Math.floor(0.5 * (minH + maxH)),
        zIndex: Math.floor(z),
        backgroundColor: randomRGB(192, 230)
      }
    }
    return cells
  }

  buildScatterCells () {
    const { width, height, count } = this.props
    const cells = []
    cells.length = count
    const minW = width / 20
    const maxW = 5 * minW
    const minH = height / 20
    const maxH = 5 * minH
    for (let i = 0; i < count; ++i) {
      const x = random(0, width)
      const y = random(0, height)
      const r = 8 * x / width
      const p = 8 * y / height
      const k = maxW + maxW * Math.sin(r) * Math.cos(p)
      const z = k + random(minW, maxW)
      const w = Math.floor(random(minW, maxW))
      const h = Math.floor(random(minH, maxH))
      cells[i] = {
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        zIndex: Math.floor(z),
        backgroundColor: randomRGB(192, 230)
      }
    }
    return cells
  }

  render () {
    return (
      <div className="ScatterBoxes">
        { this.cells.map((cell, i) => <div key={i} style={{...cell, position: 'absolute'}}/>) }
      </div>
    )
  }
}
