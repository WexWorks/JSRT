export default {
  enableScroll () {
    if (window.removeEventListener) {
      window.removeEventListener('DOMMouseScroll', preventDefault, false)
    }

    window.onmousewheel = document.onmousewheel = null
    window.onwheel = null
    window.ontouchmove = null
    document.onkeydown = null
  },
  disableScroll () {
    if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', preventDefault, false)
    }

    window.onwheel = preventDefault // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault // older browsers, IE
    window.ontouchmove = preventDefault // mobile
    document.onkeydown = preventDefaultForScrollKeys
  },
  parseQueryString (str) {
    var ret = Object.create(null)

    if (typeof str !== 'string') {
      return ret
    }

    str = str.trim().replace(/^(\?|#|&)/, '')

    if (!str) {
      return ret
    }

    str.split('&').forEach((param) => {
      var parts = param.replace(/\+/g, ' ').split('=')
      // Firefox (pre 40) decodes `%3D` to `=`
      // https://github.com/sindresorhus/query-string/pull/37
      var key = parts.shift()
      var val = parts.length > 0 ? parts.join('=') : undefined

      key = decodeURIComponent(key)

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val)

      if (ret[key] === undefined) {
        ret[key] = val
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val)
      } else {
        ret[key] = [ret[key], val]
      }
    })

    return ret
  }
}

function preventDefault (e) {
  e = e || window.event
  if (e.preventDefault) {
    e.preventDefault()
  }

  e.returnValue = false
}

function preventDefaultForScrollKeys (e) {
  const keys = { 37: 1, 38: 1, 39: 1, 40: 1 }

  if (keys[e.keyCode]) {
    preventDefault(e)
    return false
  }
}
