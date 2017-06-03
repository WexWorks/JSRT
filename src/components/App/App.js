import React, { PropTypes } from 'react'

const App = (props) => (
  <div>
    <div>Hello World</div>
    {props.children}
  </div>
)

App.propTypes = {
  children: PropTypes.object
}

export default App
