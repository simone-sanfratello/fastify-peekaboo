const crypto = require('crypto')
const stream = require('stream')
const stringify = require('fast-json-stable-stringify')

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
    /**
     * on matching all or function, hash the whole part
     */
    select: function (request, rule, part) {
      if (rule[part] === true) {
        return request[part]
      }
      // on function, if return true or false, get the whole part
      // else, use the return value
      if (typeof rule[part] === 'function') {
        const data = rule[part](request[part])
        return data === true ? request[part] : data
      }
      const hashing = {}
      for (const key in rule[part]) {
        hashing[key] = request[part][key]
      }
      return hashing
    },
    /**
     * hash `request` by `rule` matching
     * @param {fastify.Request} request
     * @param {rule} rule
     */
    request: function (request, rule) {
      const hashing = {
        method: request.method,
        route: request.raw.url
      }

      // nb on purpuse copy/paste code for performance reason
      if (rule.headers) {
        hashing.headers = lib.hash.select(request, rule, 'headers')
      }
      if (rule.query) {
        hashing.query = lib.hash.select(request, rule, 'query')
      }
      if (rule.body && lib.isPlainObject(request.body)) {
        hashing.body = lib.hash.select(request, rule, 'body')
      }

      return crypto.createHmac('sha256', '')
        .update(stringify(hashing))
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
        if (lib.isPlainObject(response.body)) {
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
        .update(stringify(hashing))
        .digest('hex')
    }
  },

  isStream: function (object) {
    // ? ['DuplexWrapper', 'ReadStream'].includes(object.__proto__.constructor.name)
    return object.pipe && object.unpipe
  },

  isPlainObject: function (object) {
    return typeof object === 'object' && object.constructor == Object
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
      return request.raw.url
    }
  }

}

module.exports = lib
