const path = require('path')

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .map(p => path.resolve(p))

module.exports = {
  nodePaths,

  // this is the main (/index.html) page
  appHtml: path.resolve('templates/index.tmpl.html'),
  appSrc: path.resolve('src/index.js'),
  appBuild: path.resolve('bin'),
  appNodeModules: path.resolve('node_modules'),

  // this is for the /version.html endpoint, a separate page
  versionHtml: path.resolve('templates/version.hbs')
}
