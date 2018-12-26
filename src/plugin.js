const package_ = require('../package.json')
const plug = require('fastify-plugin')
const Storage = require('./storage')
const lib = require('./lib')
const match = require('./match')
const defaultSettings = require('../settings/default')

const plugin = function (fastify, options, next) {
  let __options, __storage

  const __init = function (options) {
    if (!options || !options.matches) {
      return
    }
    __options = {
      ...defaultSettings,
      ...options,
      matches: []
    }
    delete __options.match
    for (let i = 0; i < options.matches.length; i++) {
      // @todo check request and response
      // @todo check request route, method, body ... valid value/s (nullable null)
      // @todo check response
      __options.matches.push({ ...defaultSettings.match, ...options.matches[i] })
    }
    const { storage, expire } = { ...defaultSettings.storage, ...defaultSettings.expire, ...options }
    __storage = new Storage({ ...storage, expire })
  }

  const preHandler = async function (request, response) {
    if (!__options) {
      return
    }
    if (__options.xheader) {
      response.header('x-peekaboo', '*')
    }
    const { hash, match: _match } = match.request(request, __options.matches)
    if (!hash) {
      return
    }
    response.res.peekaboo = { hash, match: _match }
    const _cached = await __storage.get(hash)
    if (_cached) {
      response.res.peekaboo.sent = true
      let _code
      const _headers = _cached.header
        .split('\n')
        .map((header) => {
          const [ key, value ] = header.split(':')
          if (!key.indexOf('HTTP')) {
            _code = key.match(/([0-9]{3,3})/)[0]
          }
          return {
            key: key.toLowerCase(),
            value
          }
        })
        .filter((header) => {
          return !!header.value
        })
      for (const _header of _headers) {
        response.header(_header.key, _header.value)
      }
      response.code(parseInt(_code))
      response.send(_cached.body)
    }
  }

  const onResponse = async function (response) {
    if (!response.peekaboo) {
      return
    }
    const _set = {
      header: response._header,
      body: response.peekaboo.body
    }
    __storage.set(response.peekaboo.hash, _set)
  }

  const onSend = async function (request, response, payload) {
    if (!response.res.peekaboo) {
      return
    }
    const _peekaboo = response.res.peekaboo
    if (!_peekaboo.sent && _peekaboo.match) {
      if (match.response(response, _peekaboo.match)) {
        _peekaboo.body = payload
      }
    } else {
      delete response.res.peekaboo
    }
    return payload
  }

  __init(options)
  // fastify.decorateReply('peekaboo', {})
  // fastify.decorate('peekaboo')
  fastify.addHook('preHandler', preHandler)
  fastify.addHook('onSend', onSend)
  fastify.addHook('onResponse', onResponse)

  next()
}

module.exports = plug(plugin, {
  fastify: '1.12.0', // @see package_.devDependencies.fastify,
  name: package_.name
})

Object.assign(module.exports, lib)
