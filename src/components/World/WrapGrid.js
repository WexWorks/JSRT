import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { random, randomRGB, grayscaleRGB } from '../../services/jsUtil'

export default class WrapGrid extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired
  }

  componentWillMount () {
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
    this.cells = cells
  }

  render () {
    return (
      <div className="WrapGrid">
        { this.cells.map((cell, i) => <div key={i} className="World-cell" style={cell}/>) }
      </div>
    )
  }
}
