const plug = require('fastify-plugin')
const package_ = require('../package.json')

const DEFAULT_OPTIONS = {
  expire: 60 * 60 * 1000, // 1h
  xtag: false,
  storage: 'memory'
}

const plugin = function (fastify, options, next) {
  const _options = { ...options, ...DEFAULT_OPTIONS }
  const _storage = {} // new storage ...

  const preHandler = async function (request, response) {
    if (_storage[request.raw.url]) {
      if (_options.xtag) {
        // @todo add expire
        response.header('x-peekaboo', 'expire at ... UCT')
      }
      response.send(_storage[request.url])
    }
  }

  const onSend = async function (request, response, payload) {
    // if !_storage[request.url] or expired
    _storage[request.raw.url] = payload
    return payload
  }

  fastify.decorate('peekaboo', () => {
    console.log('peekaboo!')
    console.log('running with options:', _options)
  })
  fastify.addHook('preHandler', preHandler)
  fastify.addHook('onSend', onSend)

  next()
}

module.exports = plug(plugin, {
  fastify: package_.devDependencies.fastify,
  name: package_.name
})
