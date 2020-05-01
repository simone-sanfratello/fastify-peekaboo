const package_ = require('../package.json')
const plug = require('fastify-plugin')
const Storage = require('./storage')
const lib = require('./lib')
const match = require('./match')
const defaultSettings = require('../settings/default')

const plugin = function (fastify, settings, next) {
  let __settings, __storage

  const __init = function (settings) {
    // @todo validate settings
    __settings = {
      ...defaultSettings,
      ...settings
    }

    const { storage, expire } = settings
    __storage = new Storage({ ...storage, expire }, fastify)
    // request.log.trace({ peekaboo: { init: { __settings } } })
  }

  const preHandler = function (request, response, next) {
    (async () => {
      request.log.trace({ peekaboo: { preHandler: { request: lib.log.request(request) } } })
      if (!__settings) {
        next()
        return
      }
      const _match = match.request(request, __settings.rules)
      if (!_match) {
        next()
        return
      }
      request.log.trace({ peekaboo: { preHandler: { request: lib.log.request(request), message: 'will use cache' } } })
      response.res.peekaboo = _match
      const _cached = await __storage.get(_match.hash)
      if (!_cached) {
        request.log.trace({ peekaboo: { preHandler: { request: lib.log.request(request), message: 'still not cached' } } })
        next()
        return
      }
      request.log.trace({ peekaboo: { preHandler: { request: lib.log.request(request), message: 'serve response from cache' } } })
      if (__settings.xheader) {
        response.header('x-peekaboo', 'from-cache-' + __settings.storage.mode)
      }
      response.res.peekaboo.sent = true
      for (const _name in _cached.headers) {
        if (_name === 'status' || _name === 'transfer-encoding') {
          continue
        }
        response.header(_name, _cached.headers[_name])
      }
      response.code(_cached.code)
      response.send(_cached.body)
    })()
  }

  const onSend = function (request, response, payload, next) {
    (async () => {
      request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: '...' } } })
      if (!response.res.peekaboo) {
        request.log.trace({ peekaboo: { onSend: { request: lib.log.request(request), message: 'response has not to be cached' } } })
        next()
        return
      }

      const _peekaboo = response.res.peekaboo
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
        delete response.res.peekaboo
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
      if (!response.res.peekaboo) {
        // request.log.trace('plugin', 'onResponse', 'response has not to be cached')
        next()
        return
      }

      const _set = {
        code: null,
        headers: {},
        body: await response.res.peekaboo.body
      }

      const _headers = response.res._header
        .split('\r\n')
        .map((header) => {
          const [key, value] = header.split(':')
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

      for (let index = 0; index < _headers.length; index++) {
        const _header = _headers[index]
        _set.headers[_header.key] = _header.value
      }

      if (response.res.peekaboo.stream) {
        // request.log.trace('plugin', 'onResponse', 'response body content-type', _set.headers['content-type'])
        // @todo _set.body = _set.body.toString(charset(_set.headers['content-type']) || 'utf8')
        if (contentTypeText(_set.headers['content-type'])) {
          _set.body = _set.body.toString('utf8')
        }
      }

      if (_set.headers['content-type'].indexOf('json') !== -1) {
        try {
          _set.body = JSON.parse(_set.body)
        } catch (error) {}
      }

      if (match.response(_set, response.res.peekaboo.rule)) {
        await __storage.set(response.res.peekaboo.hash, _set)
      }
      next()
    })()
  }

  /**
   * @todo memoize
   */
  /*
  const charset = function (contentType) {
    if (!contentType || !contentType.indexOf('charset=')) {
      return
    }
    const _index = contentType.indexOf('charset=')
    if (_index < 0) {
      return
    }
    // 8 is charset length
    return contentType.substring(_index + 8)
  }
  */

  __init(settings)
  // fastify.decorateReply('peekaboo', {})
  // fastify.decorate('peekaboo')
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
