'use strict'

import debug from 'debug'
import React from 'react'
import { render } from 'react-dom'
import { Router, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import multi from 'redux-multi'
import thunk from 'redux-thunk'
import ReduxPromise from 'redux-promise'

import routes from './routes'
import reducers from './reducers'

// Include all our app-wide style classes
require('./styles/core-globals.scss')
// The custom icon set Amber made for us
// To update icons, see /src/assets/fonts/zorroa-icons/how-to-update.txt
require('./assets/fonts/zorroa-icons/style.css')

// We can require the custom fonts if we want to serve the font files separately.
// The reason to do that would be to allow caching of the font files.
// As it stands, this file is imported in core-globals.scss, and the fonts get
// put in the app js bundle.
// require('./assets/fonts/zorroa-icons/style.css')

const log = debug('application:bootstrap')

log('creating state container')
const middleware = [thunk, multi, ReduxPromise]
// Add support in DEBUG builds for Redux DevTools
// In Chrome, you only need the extension: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
// Redux DevTools site: http://extension.remotedev.io/
// This code modified using Redux DevTools setup instructions here:
// http://extension.remotedev.io/#usage (1.2 Advanced store setup)
const composeEnhancers = (DEBUG && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose
const store = createStore(reducers, /* preloadedState, */ composeEnhancers(
  applyMiddleware(...middleware)
))

log('creating application node')
const applicationNode = (
  <Provider store={store}>
    <Router history={browserHistory} routes={routes} />
  </Provider>
)

log('creating dom node')
const domNode = document.createElement('div')
domNode.id = 'application'
document.body.appendChild(domNode)

log('rendering application to DOM')
render(applicationNode, domNode, () => {
  log('finished mounting application')
})
