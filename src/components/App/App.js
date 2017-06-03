import React, { PropTypes } from 'react'
import World from '../World'

const App = (props) => (
  <div className="App">
    <World/>
  </div>
)

App.propTypes = {
  children: PropTypes.object
}

export default App
