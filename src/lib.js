const crypto = require('crypto')
const stream = require('stream')
const stringify = require('json-stringify-extended')

const lib = {
  METHOD: {
    ALL: '*',
    GET: 'get',
    HEAD: 'head',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    OPTIONS: 'options',
    PATCH: 'patch'
  },

  STORAGE: {
    MEMORY: 'memory',
    FS: 'fs'
  },

  hash: {
    request: function (request, rule) {
      const hashing = {
        method: request.req.method,
        route: request.raw.originalUrl
      }

      for (const part of ['headers', 'body', 'query']) {
        if (rule[part]) {
          // on mathing all or function, hash whole part
          if (rule[part] === true || typeof rule[part] === 'function') {
            hashing[part] = request[part]
            continue
          }

          hashing[part] = {}
          for (const key in rule[part]) {
            hashing[part][key] = request[part][key]
          }
        }
      }
      return crypto.createHmac('sha256', '')
        .update(stringify(hashing, stringify.options.compact))
        .digest('hex')
    },
    response: function (response, rule) {
      if (!rule) {
        return Date.now()
      }
      const hashing = {}

      // nb on purpuse copy/paste code for performance reason
      if (rule.status) {
        hashing.status = response.status
      }
      if (rule.body) {
        if (typeof response.body === 'object') {
          hashing.body = {}
          for (const key in rule.body) {
            hashing.body[key] = response.body[key]
          }
        } else {
          hashing.body = response.body
        }
      }
      if (rule.headers) {
        hashing.headers = {}
        for (const key in rule.headers) {
          hashing.headers[key] = response.headers[key]
        }
      }
      return crypto.createHmac('sha256', '')
        .update(stringify(hashing, stringify.options.compact))
        .digest('hex')
    }
  },

  isStream: function (object) {
    // ? ['DuplexWrapper', 'ReadStream'].includes(object.__proto__.constructor.name)
    return object.pipe && object.unpipe
  },

  acquireStream: async function (source) {
    let _content = Buffer.alloc(0)
    const _stream = source.pipe(new stream.PassThrough())
    const done = new Promise((resolve, reject) => {
      _stream.on('data', (chunk) => {
        _content = Buffer.concat([_content, chunk])
      })
      _stream.once('finish', resolve)
      _stream.once('error', reject)
    })
    await done
    return _content
  },

  log: {
    request: function (request) {
      return request.raw.originalUrl
    }
  }

}

module.exports = lib
