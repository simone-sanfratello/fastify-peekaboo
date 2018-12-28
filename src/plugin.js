const package_ = require('../package.json')
const stream = require('stream')
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

  const preHandler = function (request, response, next) {
    (async () => {
      lib.log.track('plugin', 'preHandler', lib.log.request(request))
      if (!__options) {
        next()
        return
      }
      const { hash, match: _match } = match.request(request, __options.matches)
      if (!hash) {
        next()
        return
      }
      response.res.peekaboo = { hash, match: _match }
      const _cached = await __storage.get(hash)
      if (!_cached) {
        next()
        return
      }
      if (__options.xheader) {
        response.header('x-peekaboo', 'from-cache')
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

  const acquireStream = async function (request, response, payload) {
    let _content = Buffer.alloc(0)
    const _stream = payload.pipe(new stream.PassThrough())
    const done = new Promise((resolve, reject) => {
      _stream.on('data', (chunk) => {
        _content = Buffer.concat([_content, chunk])
      })
      _stream.once('finish', resolve)
      _stream.once('error', reject)
    })
    await done
    return _content
  }

  const onSend = function (request, response, payload, next) {
    (async () => {
      lib.log.track('plugin', 'onSend', lib.log.request(request), '...')
      if (!response.res.peekaboo) {
        lib.log.track('plugin', 'onSend', lib.log.request(request), 'response has not to be cached')
        next()
        return
      }

      const _peekaboo = response.res.peekaboo
      if (!_peekaboo.sent && _peekaboo.match) {
        lib.log.track('plugin', 'onSend', lib.log.request(request), 'response has to be cached')
        if (payload.__proto__.constructor.name === 'DuplexWrapper') {
          _peekaboo.stream = true
          lib.log.track('plugin', 'onSend', lib.log.request(request), 'response is a stream')
          next(null, payload)
          lib.log.track('plugin', 'onSend', lib.log.request(request), 'acquiring response stream')
          _peekaboo.body = acquireStream(request, response, payload)
          lib.log.track('plugin', 'onSend', lib.log.request(request), 'response stream acquired')
          return
        } else {
          _peekaboo.body = payload
          lib.log.track('plugin', 'onSend', lib.log.request(request), 'response acquired')
        }
      } else {
        delete response.res.peekaboo
        lib.log.track('plugin', 'onSend', lib.log.request(request), 'response sent from cache')
      }
      lib.log.track('plugin', 'onSend', lib.log.request(request), 'done')
      next(null, payload)
    })()
  }

  const onResponse = function (response, next) {
    (async () => {
      lib.log.track('plugin', 'onResponse')
      if (!response.peekaboo) {
        lib.log.track('plugin', 'onResponse', 'response has not to be cached')
        next()
        return
      }

      const _set = {
        code: null,
        headers: {},
        body: await response.peekaboo.body
      }

      // lib.log.track('plugin') //, 'body', _set.body)

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

      if (response.peekaboo.stream) {
        lib.log.track('plugin', 'onResponse', 'response body content-type', _set.headers['content-type'])
        // @todo _set.body = _set.body.toString(charset(_set.headers['content-type']) || 'utf8')
        _set.body = _set.body.toString('utf8')
      }

      if (_set.headers['content-type'].indexOf('json') !== -1) {
        try {
          _set.body = JSON.parse(_set.body)
        } catch (error) {}
      }

      if (match.response(_set, response.peekaboo.match)) {
        await __storage.set(response.peekaboo.hash, _set)
      }
      next()
    })()
  }

  /**
   * @todo memoize
   */
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

  __init(options)
  // fastify.decorateReply('peekaboo', {})
  // fastify.decorate('peekaboo')
  fastify.addHook('preHandler', preHandler)
  fastify.addHook('onSend', onSend)
  fastify.addHook('onResponse', onResponse)

  next()
}

module.exports = plug(plugin, {
  fastify: '1',
  name: package_.name
})

Object.assign(module.exports, lib)
