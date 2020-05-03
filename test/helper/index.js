'use strict'

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test'
}

const got = require('got')
const options = {} // retry: 0, throwHttpErrors: false }

const helper = {
  fastify: {
    _port: null,
    start: async function (instance) {
      await instance.listen(0)
      instance.server.unref()
    },
    stop: async function (instance) {
      await instance.close()
    },
    url: function (instance, path) {
      return `http://127.0.0.1:${instance.server.address().port}${path}`
    }
  },
  request: async function (request) {
    return got({ ...options, ...request })
  }
}

module.exports = helper
