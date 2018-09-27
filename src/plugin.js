const package_ = require('../package.json')
const plug = require('fastify-plugin')
const Storage = require('./lib/storage')
const lib = require('./lib')

const OPTIONS = {
  default: {
    // match, method
    xtag: false,
    expire: 60 * 60 * 1000, // 1h
    storage: {
      type: lib.STORAGE.memory
    }
  }
}

const match = function (request, options) {
  let _key
  // match request by options.match
  // @todo efficent way instead of brute force
  // for(options.match)
  return _key
}

const plugin = function (fastify, options, next) {
  const _options = { ...options, ...OPTIONS }
  const _storage = new Storage(options)

  const preHandler = async function (request, response) {
    const key = match(request, options)
    if (!key) {
      return
    }
    response.peekaboo.key = key
    const _cached = await _storage.get(key)
    if (_cached) {
      if (_options.xtag) {
        response.header('x-peekaboo', '')
      }
      response.peekaboo.involved = true
      response.send(_cached)
    }
  }

  const onSend = async function (request, response, payload) {
    if (!response.peekaboo.involved && response.peekaboo.key) {
      _storage.set(response.peekaboo.key, payload)
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

Object.assign(module.exports, lib)
