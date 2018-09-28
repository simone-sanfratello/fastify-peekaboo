const package_ = require('../package.json')
const plug = require('fastify-plugin')
const Storage = require('./lib/storage')
const lib = require('./lib')

const OPTIONS = {
  default: {
    // match, method
    xheader: false,
    expire: 60 * 60 * 1000, // 1h
    storage: {
      type: lib.STORAGE.memory
    }
  }
}

/**
 * match request by options.match
 */
const match = function (request, options) {
  // @todo efficent way instead of brute force
  for (const _match of options._matches) {
    const _rule = options.match[_match]
    switch (_match) {
      case lib.MATCH.CUSTOM:
        return _rule(request.req)
          ? options._id
          : null
      case lib.MATCH.METHOD:
        if (_rule !== lib.METHOD.ALL && !_rule.includes(request.req.method.toLowerCase())) {
          return null
        }
        break
      case lib.MATCH.URL:
        if (request.req.url !== _rule) {
          return null
        }
      // @todo other cases
    }
  }
  return options._id
}

const plugin = function (fastify, options, next) {
  let __options, __storage

  const __init = function (options) {
    __options = { ...options, ...OPTIONS }
    // @todo validate options:
    // if matches contains CUSTOM > warning all rules will be ignored
    // if method > rule can be ALL or Array
    __options._matches = []
    let _id = 1
    // @todo for options.rules
    for (const i in __options.match) {
      // @todo sort matches by value
      __options._matches.push(parseInt(i))
    }
    __options._id = _id++
    // }
    __storage = new Storage(options)
  }

  const preHandler = async function (request, response) {
    const id = match(request, __options)
    if (!id) {
      return
    }
    response.peekaboo.id = id
    const _cached = await __storage.get(id)
    if (_cached) {
      if (__options.xheader) {
        response.header('x-peekaboo', '*')
      }
      response.peekaboo.involved = true
      response.send(_cached)
    }
  }

  const onSend = async function (request, response, payload) {
    if (!response.peekaboo.involved && response.peekaboo.id) {
      __storage.set(response.peekaboo.id, payload)
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
