const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HandlebarsPlugin = require('handlebars-webpack-plugin')
const paths = require('./paths.js')
const childProcess = require('child_process')

function BuildFinishedOutputPlugin (options) {
  this.apply = function (compiler) {
    compiler.plugin('emit', function (compilation, callback) {
      console.log(`\r${new Date().toLocaleString()} build finished`)
      callback()
    })
  }
}

module.exports = function getPlugins (env) {
  const date = new Date()
  const zvVersion = JSON.stringify(require('../package.json').version).replace(/"/g, '').trim()
  const zvCommit = childProcess.execSync('git rev-parse --short HEAD').toString().trim()
  const zvBranch = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  const zvCount = childProcess.execSync('git rev-list HEAD --count').toString().trim()
  const zvDateMs = date.valueOf().toString()
  const zvDateStr = date.toISOString()

  let plugins = [
    new BuildFinishedOutputPlugin({}),
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      hash: true
    }),
    new HandlebarsPlugin({
      entry: paths.versionHtml,
      output: paths.appBuild + '/version.html',
      data: { zvVersion }
    }),

    // These defines act like global vars, but they are string-replaced at build time
    // So they're not actually variables, they're macros,
    // and they may need to be trimmed/quoted to build (especially shell-outs)

    new webpack.DefinePlugin({
      'process.env': {
        BUILD_ENV: process.env.ENV,
        'ROOT_URL': JSON.stringify('http://localhost:3090')
      },
      'DEBUG': (env === 'DEV'),
      'PROD': (env === 'PROD'),
      'PRODLOCAL': (env === 'PRODLOCAL'),
      'zvCommit': `"${zvCommit}"`,
      'zvBranch': `"${zvBranch}"`,
      'zvCount': `"${zvCount}"`,
      'zvDateMs': `"${zvDateMs}"`,
      'zvDateStr': `"${zvDateStr}"`,
      'zvVersion': `"${zvVersion}"`
    })
  ]

  if (env === 'PROD' || env === 'PRODLOCAL') {
    const prodPlugins = [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.AggressiveMergingPlugin({}),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          booleans: true,
          cascade: true,
          comparisons: true,
          conditionals: true,
          dead_code: true,
          drop_console: true,
          drop_debugger: true,
          evaluate: true,
          hoist_funs: true,
          hoist_vars: true,
          if_return: true,
          join_vars: true,
          loops: true,
          negate_iife: true,
          properties: true,
          sequences: true,
          unsafe: false,
          unused: true,
          warnings: false
        },
        mangle: {
          toplevel: true,
          sort: true,
          eval: true,
          properties: true
        },
        output: {
          space_colon: false,
          comments: false
        }
      })
    ]

    plugins = plugins.concat(prodPlugins)
  }

  return plugins
}

  // new CaseSensitivePathsPlugin(),
 // new WatchMissingNodeModulesPlugin(PATHS.appNodeModules)
