const log = require('log-segment')
const settings = require('./_root')

log.set({
  levels: {
    info: {
      marker: '[i]'
    },
    success: {
      marker: '[ok]'
    },
    warning: {
      marker: '[warn]'
    },
    error: {
      marker: '[err]'
    },
    panic: {
      marker: '[panic]'
    }
  }
})

module.exports = settings
