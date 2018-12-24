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
      if (__options.xheader) {
        response.header('x-peekaboo', '*')
      }
      response.peekaboo.involved = true
      // @todo headers, code from storage
      response.send(_cached)
    }
  }

  const onSend = async function (request, response, payload) {
    if (!response.peekaboo.involved && response.peekaboo.hash) {
      // @todo if match.response(payload, response.header)
      // @todo save body, headers, code
      __storage.set(response.peekaboo.hash, payload)
    }
    return payload
  }

  __init(options)
  fastify.decorateReply('peekaboo', {})
  fastify.decorate('peekaboo')
  fastify.addHook('preHandler', preHandler)
  fastify.addHook('onSend', onSend)

  next()
}

module.exports = plug(plugin, {
  fastify: package_.devDependencies.fastify,
  name: package_.name
})

Object.assign(module.exports, lib)
