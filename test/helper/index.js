'use strict'

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test'
}

const got = require('got')
const options = { retry: 0, throwHttpErrors: false }

const helper = {
  fastify: {
    _port: null,
    start: async function (instance) {
      await instance.listen(0)
      instance.server.unref()
      helper.fastify._port = instance.server.address().port
    },
    stop: async function (instance) {
      await instance.close()
    }
  },
  request: async function (request) {
    const url = `http://127.0.0.1:${helper.fastify._port}` + request.path
    console.log(url)
    delete request.path
    return got({ url, ...options, ...request })
  }
}

module.exports = helper
