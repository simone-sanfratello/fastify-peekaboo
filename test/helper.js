const fastify = require('fastify')
const got = require('got')

const helper = {
  init: function (peekaboo, options) {
    const _fastify = fastify()
    _fastify.register(peekaboo, options)
    return _fastify
  },
  request: async function (_fastify, request) {
    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port
      const _request = { ...request }
      delete _request.url
      await got(request.url, {
        baseUrl: `http://127.0.0.1:${_port}`,
        ..._request
      })
      return await got(request.url, {
        baseUrl: `http://127.0.0.1:${_port}`,
        ..._request
      })
    } catch (error) {
      throw error
    }
  }

}

module.exports = helper
