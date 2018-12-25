const package_ = require('../package.json')
const plug = require('fastify-plugin')
const Storage = require('./storage')
const lib = require('./lib')
const match = require('./match')
const defaultSettings = require('../settings/default')

const plugin = function (fastify, options, next) {
  let __options, __storage

  const __init = function (options) {
    for (let i = 0; i < __options.matches.length; i++) {
      __options.matches[i]({ ...defaultSettings, ...__options.matches[i] })
    }
    const { storage, expire } = options
    __storage = new Storage({ ...storage, expire })
  }

  const preHandler = async function (request, response) {
    const { hash, i } = match.request(request, __options.matches)
    if (!hash) {
      return
    }
    response.peekaboo.hash = hash
    response.peekaboo.match = i
    const _cached = await __storage.get(hash)
    if (_cached) {
      response.peekaboo.sent = true
      if (__options.xheader) {
        response.header('x-peekaboo', '*')
      }
      for (const _header in _cached.headers) {
        response.header(_header, _cached.headers[_header])
      }
      response
        .send(_cached.body)
    }
  }

  const onResponse = async function (request, response) {
    if (!response.peekaboo.sent && response.peekaboo.match) {
      if (match.response(response, response.peekaboo.match)) {
        const _set = {
          headers: {},
          body: response.payload
        }
        for (const _header in response.headers) {
          _set.headers[_header] = response.headers[_header]
        }
        __storage.set(response.peekaboo.hash, _set)
      }
    }
  }

  __init(options)
  fastify.decorateReply('peekaboo', {})
  fastify.decorate('peekaboo')
  fastify.addHook('preHandler', preHandler)
  fastify.addHook('onResponse', onResponse)

  next()
}

module.exports = plug(plugin, {
  fastify: '1.12.0', // @see package_.devDependencies.fastify,
  name: package_.name
})

Object.assign(module.exports, lib)
