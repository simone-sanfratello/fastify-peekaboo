const plug = require('fastify-plugin')
const package_ = require('../package.json')
const defaultSettings = require('../settings/default')
const Storage = require('./storage')
const lib = require('./lib')
const match = require('./match')
const validateSettings = require('./validate/settings')

/**
 * implement fastify-plugin interface
 * @param {Fastify} fastify instance
 * @param {Settings} settings
 * @param {function} next
 *
 * @throws if settings are invalid
 */
const plugin = function (fastify, settings, next) {
  let _settings, _storage

  const _init = function (settings) {
    _settings = {
      ...defaultSettings,
      ...settings
    }
    validateSettings(_settings)

    const { storage, expire } = settings
    _storage = new Storage({ ...storage, expire }, fastify)
  }

  const preHandler = function (request, response, next) {
    (async () => {
      request.log.trace({ peekaboo: { preHandler: { request: lib.log.request(request) } } })
      const _match = match.request(request, _settings.rules)
      if (!_match) {
        next()
        return
      }
      request.log.trace({ peekaboo: { preHandler: { request: lib.log.request(request), message: 'will use cache' } } })
      response.peekaboo = { match: true, ..._match }
      const _cached = await _storage.get(_match.hash)
      if (!_cached) {
        request.log.trace({ peekaboo: { preHandler: { request: lib.log.request(request), message: 'still not cached' } } })
        next()
        return
      }
      request.log.trace({ peekaboo: { preHandler: { request: lib.log.request(request), message: 'serve response from cache' } } })
      if (_settings.xheader) {
        response.header('x-peekaboo', 'from-cache-' + _settings.storage.mode)
      }
      for (const _name in _cached.headers) {
        response.header(_name, _cached.headers[_name])
      }
      response.code(_cached.status)
      response.peekaboo.sent = true
      response.send(_cached.body)
    })()
  }

  const onSend = function (request, response, payload, next) {
    (async () => {
      request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: '...' } } })
      if (!response.peekaboo.match) {
        request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: 'response has not to be cached' } } })
        next()
        return
      }

      const _peekaboo = response.peekaboo
      if (!_peekaboo.sent && _peekaboo.match) {
        request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: 'response has to be cached' } } })
        if (lib.isStream(payload)) {
          _peekaboo.stream = true
          request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: 'response is a stream' } } })
          next(null, payload)
          request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: 'acquiring response stream' } } })
          _peekaboo.body = lib.acquireStream(payload)
          request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: 'response stream acquired' } } })
          return
        } else {
          _peekaboo.body = payload
          request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: 'response acquired' } } })
        }
      } else {
        response.peekaboo.sent = true
        request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: 'response sent from cache' } } })
      }
      request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: 'done' } } })
      // request.log.trace({ payload })
      next(null, payload)
    })()
  }

  const onResponse = function (request, response, next) {
    (async () => {
      // request.log.trace('plugin', 'onResponse')
      if (!response.peekaboo.match || response.peekaboo.sent) {
        // request.log.trace('plugin', 'onResponse', 'response has not to be cached')
        next()
        return
      }

      const _set = {
        status: response.statusCode,
        headers: {},
        body: await response.peekaboo.body
      }

      const _headers = response.res._header
        .split('\r\n')
        .map((header) => {
          const [key, value] = header.split(':')
          return {
            key: key.toLowerCase(),
            value: value ? value.trim() : ''
          }
        })
        .filter((header) => {
          return !!header.value
        })

      for (let index = 0; index < _headers.length; index++) {
        const _header = _headers[index]
        _set.headers[_header.key] = _header.value
      }

      if (response.peekaboo.stream) {
        // request.log.trace('plugin', 'onResponse', 'response body content-type', _set.headers['content-type'])
        // @todo _set.body = _set.body.toString(charset(_set.headers['content-type']) || 'utf8')
        if (contentTypeText(_set.headers['content-type'])) {
          _set.body = _set.body.toString('utf8')
        }
      }

      if (_set.headers['content-type'].includes('json')) {
        try {
          _set.body = JSON.parse(_set.body)
        } catch (error) {}
      }

      // trim headers @todo function
      delete _set.headers.status
      delete _set.headers.connection
      delete _set.headers['transfer-encoding']

      if (match.response(_set, response.peekaboo.rule)) {
        await _storage.set(response.peekaboo.hash, _set)
      }
      next()
    })()
  }

  try {
    _init(settings)
  } catch (error) {
    next(error)
    return
  }
  fastify.decorateReply('peekaboo', {})
  fastify.addHook('preHandler', preHandler)
  fastify.addHook('onSend', onSend)
  fastify.addHook('onResponse', onResponse)

  next()
}

const contentTypeText = function (contentType) {
  return contentType && contentType.indexOf('text') !== -1
}

module.exports = plug(plugin, {
  fastify: '2',
  name: package_.name
})

Object.assign(module.exports, lib)
