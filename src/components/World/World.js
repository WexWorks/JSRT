import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

export class World extends Component {
  render () {
    return (
      <div className="World">
        <div>Hello World</div>
      </div>
    )
  }
}

export default connect(state => ({
}), dispatch => ({
  actions: bindActionCreators({
  }, dispatch)
}))(World)
