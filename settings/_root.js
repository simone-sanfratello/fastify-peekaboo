const log = require('log-segment')
const path = require('path')

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

const settings = {}
settings.log = {
  Server: {
    tag: 'Server',
    log: {
      'Server': {
        color: 'cyan'
      }
    },
    enabled: true
  },
  Data: {
    tag: 'Data',
    log: {
      'Data': {
        color: 'yellow'
      }
    },
    enabled: true
  }
}

settings.url = 'http://localhost'

settings.date = {
  tz: 'Europe/Rome' // @see https://momentjs.com/timezone/docs/#/using-timezones/default-timezone/
}

settings.network = {
  port: 9123
}

module.exports = settings
