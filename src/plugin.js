const plug = require('fastify-plugin')
const stringify = require('json-stringify-extended')
const package_ = require('../package.json')
const defaultSettings = require('../settings/default')
const Storage = require('./storage')
const lib = require('./lib')
const match = require('./match')
const validateSettings = require('./validate/settings')

/**
 * it implement the fastify-plugin interface
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
    _storage = new Storage({ ...storage, expire })
  }

  const preHandler = function (request, response, next) {
    (async () => {
      if (_settings.mode === 'off') {
        return next(null)
      }

      request.log.trace({ ns: 'peekaboo', message: 'preHandler', request: lib.log.request(request) })
      request.peekaboo = { storage: _storage }
      const _match = match.request(request, _settings.rules)
      if (!_match || _settings.mode === 'collector') {
        return next()
      }

      request.log.trace({ ns: 'peekaboo', message: 'preHandler - will use cache', request: lib.log.request(request) })
      response.peekaboo = { match: true, ..._match }
      const _cached = await _storage.get(_match.hash)
      if (!_cached) {
        if (_settings.mode === 'warehouse') {
          // @todo settings
          response.code(404)
          response.peekaboo.sent = true
          response.send('PEEKABOO_NOT_IN_WAREHOUSE')
          return
        }
        request.log.trace({ ns: 'peekaboo', message: 'preHandler - still not cached', request: lib.log.request(request) })
        return next()
      }

      request.log.trace({ ns: 'peekaboo', message: 'preHandler - serve response from cache', request: lib.log.request(request) })
      if (_settings.xheader) {
        response.header('x-peekaboo', 'from-cache-' + _settings.storage.mode)
        response.header('x-peekaboo-hash', _match.hash)
      }
      for (const _name in _cached.response.headers) {
        response.header(_name, _cached.response.headers[_name])
      }
      response.code(_cached.response.status)
      response.peekaboo.sent = true
      response.send(_cached.response.body)
    })()
  }

  const onSend = function (request, response, payload, next) {
    (async () => {
      if (['off', 'warehouse'].includes(_settings.mode) || !response.peekaboo.match) {
        request.log.trace({ ns: 'peekaboo', message: 'onSend - response has not to be cached', request: lib.log.request(request) })
        return next()
      }

      const _peekaboo = response.peekaboo
      if (!_peekaboo.sent && _peekaboo.match) {
        request.log.trace({ ns: 'peekaboo', message: 'onSend - response has to be cached', request: lib.log.request(request) })
        if (lib.isStream(payload)) {
          _peekaboo.stream = true
          request.log.trace({ ns: 'peekaboo', message: 'onSend - response is a stream', request: lib.log.request(request) })
          next(null, payload)
          request.log.trace({ ns: 'peekaboo', message: 'onSend - acquiring response stream', request: lib.log.request(request) })
          _peekaboo.body = lib.acquireStream(payload)
          request.log.trace({ ns: 'peekaboo', message: 'onSend - response stream acquired', request: lib.log.request(request) })
          return
        } else {
          _peekaboo.body = payload
          request.log.trace({ ns: 'peekaboo', message: 'onSend - response acquired', request: lib.log.request(request) })
        }
      } else {
        response.peekaboo.sent = true
        request.log.trace({ ns: 'peekaboo', message: 'onSend - response sent from cache', request: lib.log.request(request) })
      }
      request.log.trace({ ns: 'peekaboo', message: 'onSend - done', request: lib.log.request(request) })
      next(null, payload)
    })()
  }

  const onResponse = function (request, response, next) {
    (async () => {
      if (['off', 'warehouse'].includes(_settings.mode) || !response.peekaboo.match || response.peekaboo.sent) {
        request.log.trace({ ns: 'peekaboo', message: 'onResponse - response has not to be cached', request: lib.log.request(request) })
        return next()
      }
      request.log.trace({ ns: 'peekaboo', message: 'onResponse', request: lib.log.request(request) })

      const _entry = {
        response: {
          status: response.statusCode,
          headers: {},
          body: await response.peekaboo.body
        }
      }

      const _headers = response.res._header
        .split('\r\n')
        .map(header => {
          const [key, ...value] = header.split(':')
          return {
            key: key.toLowerCase(),
            value: value ? value.join(':').trim() : ''
          }
        })
        .filter((header) => {
          return !!header.value
        })

      for (let index = 0; index < _headers.length; index++) {
        const _header = _headers[index]
        _entry.response.headers[_header.key] = _header.value
      }

      if (response.peekaboo.stream) {
        // request.log.trace('plugin', 'onResponse', 'response body content-type', _set.headers['content-type'])
        // @todo _set.body = _set.body.toString(charset(_set.headers['content-type']) || 'utf8')
        if (contentTypeText(_entry.response.headers['content-type'])) {
          _entry.response.body = _entry.response.body.toString('utf8')
        }
      }

      if (_entry.response.headers['content-type'].includes('json')) {
        try {
          _entry.response.body = JSON.parse(_entry.response.body)
        } catch (error) {}
      }

      // trim headers @todo function
      delete _entry.response.headers.status
      delete _entry.response.headers.connection
      delete _entry.response.headers['transfer-encoding']

      if (match.response(_entry.response, response.peekaboo.rule)) {
        if (!_settings.noinfo) {
          _entry.request = { todo: '...' }
          _entry.info = {
            rule: stringify(response.peekaboo.rule, stringify.options.compact),
            created: Date.now()
          }
        }
        await _storage.set(response.peekaboo.hash, _entry)
      }

      // @todo "next()" could be moved after "await response.peekaboo.body"
      next()
    })()
  }

  try {
    _init(settings)
  } catch (error) {
    return next(error)
  }

  fastify.decorate('peekaboo', {
    set: {
      mode: function (value) {
        if (!['off', 'lazy', 'collector', 'warehouse'].includes(value)) {
          fastify.log.trace({ ns: 'peekaboo', message: 'invalid mode', mode: value })
          return
        }
        _settings.mode = value
      }
    },
    get: {
      mode: function () {
        return _settings.mode
      }
    }
  })

  fastify.decorateReply('peekaboo', {})
  fastify.decorateRequest('peekaboo', {})
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
