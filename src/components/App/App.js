import React from 'react'
import PropTypes from 'prop-types'
import World from '../World'

const App = (props) => (
  <div className="App">
    <World/>
  </div>
)

App.propTypes = {
  children: PropTypes.node
}

export default App
