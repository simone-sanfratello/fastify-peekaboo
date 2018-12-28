const package_ = require('../package.json')
const plug = require('fastify-plugin')
const clone = require('fast-deepclone')
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
      const _options = clone(options.matches[i])
      const _match = clone(defaultSettings.match)
      Object.assign(_match.request, _options.request)
      Object.assign(_match.response, _options.response)
      __options.matches.push(_match)
    }
    const { storage, expire } = {
      ...defaultSettings.storage,
      expire: defaultSettings.expire,
      ...options
    }
    __storage = new Storage({ ...storage, expire })
  }

  const preHandler = async function (request, response) {
    lib.log('plugin', 'preHandler')
    if (!__options) {
      return
    }
    const { hash, match: _match } = match.request(request, __options.matches)
    if (!hash) {
      return
    }
    response.res.peekaboo = { hash, match: _match }
    const _cached = await __storage.get(hash)
    if (_cached) {
      if (__options.xheader) {
        response.header('x-peekaboo', 'from-cache')
      }
      response.res.peekaboo.sent = true
      for (const _name in _cached.headers) {
        response.header(_name, _cached.headers[_name])
      }
      response.code(_cached.code)
      response.send(_cached.body)
    }
  }

  const onSend = async function (request, response, payload) {
    lib.log('plugin', 'onSend')
    if (!response.res.peekaboo) {
      return
    }
    const _peekaboo = response.res.peekaboo
    if (!_peekaboo.sent && _peekaboo.match) {
      _peekaboo.body = payload
    } else {
      delete response.res.peekaboo
    }
    return payload
  }

  const onResponse = async function (response) {
    lib.log('plugin', 'onResponse')
    if (!response.peekaboo) {
      return
    }
    const _set = {
      code: null,
      headers: {},
      body: response.peekaboo.body
    }

    const _headers = response._header
      .split('\r\n')
      .map((header) => {
        const [ key, value ] = header.split(':')
        if (!key.indexOf('HTTP')) {
          _set.headers.status =
          _set.code = parseInt(key.match(/([0-9]{3,3})/)[0])
        }
        return {
          key: key.toLowerCase(),
          value: value ? value.trim() : ''
        }
      })
      .filter((header) => {
        return !!header.value
      })

    for (const _header of _headers) {
      _set.headers[_header.key] = _header.value
    }

    if (_set.headers['content-type'].indexOf('json') !== -1) {
      try {
        _set.body = JSON.parse(_set.body)
      } catch (error) {}
    }

    if (!match.response(_set, response.peekaboo.match)) {
      return
    }
    __storage.set(response.peekaboo.hash, _set)
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
  fastify: '1', // @see package_.devDependencies.fastify,
  name: package_.name
})

Object.assign(module.exports, lib)
