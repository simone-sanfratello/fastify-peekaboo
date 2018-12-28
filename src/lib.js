const crypto = require('crypto')
const url = require('url')

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
    FS: 'fs',
    REDIS: 'redis'
  },

  hash: function (request, match) {
    const _request = {
      method: request.req.method,
      route: new url.URL('http://host.url' + request.req.url).pathname
    }
    if (Object.keys(request.params).length) {
      _request.params = request.params
    }
    if (Object.keys(request.query).length) {
      _request.query = request.query
    }
    if (match.headers && Object.keys(match.headers).length) {
      _request.headers = match.headers
    }
    if (request.body) {
      _request.body = request.body
    }
    return crypto.createHmac('sha256', '')
      .update(JSON.stringify(_request))
      .digest('hex')
  },

  instanceOf (object) {
    // eslint-disable-next-line
    return object.__proto__.constructor.name
  },

  log: {
    request: function (request) {
      return request.req.url
    }
  }

}

module.exports = lib
