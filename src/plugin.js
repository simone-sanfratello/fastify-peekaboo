const package_ = require('../package.json')
const plug = require('fastify-plugin')
const Storage = require('./lib/storage')

const OPTIONS = {
  default: {
    xtag: false,
    expire: 60 * 60 * 1000, // 1h
    storage: {
      type: 'memory'
    }
  }
}

const plugin = function (fastify, options, next) {
  const _options = { ...options, ...OPTIONS }
  const _storage = new Storage(options)

  const preHandler = async function (request, response) {
    const _cached = await _storage.get(request)
    if (_cached) {
      if (_options.xtag) {
        // @todo ... send expiring timestamp
        response.header('x-peekaboo', 'expire at ... UCT')
      }
      response.peekaboo.fromCache = true
      response.send(_cached)
    }
  }

  const onSend = async function (request, response, payload) {
    if (!response.peekaboo.fromCache) {
      _storage.set(request, payload)
    }
    return payload
  }

  fastify.decorateReply('peekaboo', {})
  fastify.decorate('peekaboo', () => {
    console.log('peekaboo running with options', _options)
  })
  fastify.addHook('preHandler', preHandler)
  fastify.addHook('onSend', onSend)

  next()
}

module.exports = plug(plugin, {
  fastify: package_.devDependencies.fastify,
  name: package_.name
})
