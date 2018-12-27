const url = require('url')
const toolbox = require('a-toolbox')
const lib = require('./lib')

const match = {
  /**
   * @param {fastify.Request} request
   * @return {bool}
   * @todo
   * @todo matching by routes tree on first step, if matches.length > N
   * ! for few matches, a for loop is enough
   */
  request: function (request, matches) {
    for (const _rule of matches) {
      if (!match.requestMethod(_rule.request.methods, request.req)) {
        continue
      }

      const _matching = {}

      if (_rule.request.route) {
        if (!match.requestRoute(_rule.request.route, request.req)) {
          continue
        }
      }

      if (_rule.request.headers) {
        const _headers = match.requestHeaders(_rule.request.headers, request.req)
        if (!_headers) {
          continue
        }
        _matching.headers = _headers
      }

      if (_rule.request.body) {
        const _body = match.requestBody(_rule.request.body, request)
        if (!_body) {
          continue
        }
        _matching.body = _body
      }

      if (_rule.request.query) {
        const _query = match.requestQuery(_rule.request.query, request)
        if (!_query) {
          continue
        }
        _matching.query = _query
      }

      return {
        hash: lib.hash(request, _matching),
        match: _rule
      }
    }
    return { match: null, hash: null }
  },

  /**
   * @param {cache} data {headers, body}
   * @param {object} rule
   * @return {bool}
   */
  response: function (data, rule) {
    if (!rule.response) {
      return true
    }

    if (rule.response.headers && !match.responseHeaders(rule.response.headers, data)) {
      return false
    }

    if (rule.response.body && !match.responseBody(rule.response.body, data)) {
      return false
    }

    return true
  },

  /**
   * @param {string|string[]} method
   * @param {fastify.Request} request
   * @return {bool}
   */
  requestMethod: function (methods, request) {
    if (methods === '*') {
      return true
    }
    const _method = request.method.toLowerCase()
    if (typeof methods === 'string') {
      return methods === _method
    }
    return methods.includes(_method)
  },

  /**
   *
   * @param {string|RegExp|function(route:string):bool} route
   * @param {fastify.Request} request
   * @return {bool}
   */
  requestRoute: function (route, request) {
    const _url = new url.URL('http://host.url' + request.url).pathname
    if (typeof route === 'string') {
      return _url.indexOf(route) === 0
    }
    if (route instanceof RegExp) {
      return _url.match(route)
    }
    return route(_url)
  },

  /**
   * @param {fastify.Request} request
   * @return {bool}
   */
  requestHeaders: function (headers, request) {

  },

  /**
   * @param {string|string[]|function(body:string|object):bool} body
   * @param {fastify.Request} request
   * @return {object|null} body matched or null if don't match
   */
  requestBody: function (body, request) {
    if (body === '*') {
      return request.body || null
    }
    if (body instanceof Array) {
      if (body.length !== Object.keys(request.body).length) {
        return null
      }
      const _body = {}
      let _match
      for (const _name of body) {
        if (toolbox.util.isSet(request.body[_name])) {
          _body[_name] = request.body[_name]
          _match = true
        } else {
          return null
        }
      }
      return _match ? _body : null
    }
    if (typeof body === 'string') {
      if (toolbox.util.isSet(request.body[body])) {
        return { [body]: request.body[body] }
      }
    }
    if (body(request.body)) {
      return request.body
    }
    return null
  },

  /**
   * @param {string|string[]|function(query:string|object):bool} query
   * @param {fastify.Request} request
   * @return {object|null} query matched or null if don't match
   */
  requestQuery: function (query, request) {
    if (query === '*') {
      return request.query || null
    }
    if (query instanceof Array) {
      if (query.length !== Object.keys(request.query).length) {
        return null
      }
      const _query = {}
      let _match
      for (const _name of query) {
        if (toolbox.util.isSet(request.query[_name])) {
          _query[_name] = request.query[_name]
          _match = true
        } else {
          return null
        }
      }
      return _match ? _query : null
    }
    if (typeof query === 'string') {
      if (toolbox.util.isSet(request.query[query])) {
        return { [query]: request.query[query] }
      }
    }
    if (query(request.query)) {
      return request.query
    }
    return null
  },

  /**
   * @param {cache} data {headers, body}
   * @return {bool}
   */
  responseHeaders: function (headers, data) {
    if (typeof headers === 'function') {
      return headers(data.headers)
    }
    for (const _name in headers) {
      if (headers[_name] !== data.headers[_name]) {
        return false
      }
    }
    return true
  },

  /**
   * @param {cache} data {headers, body}
   * @return {bool}
   */
  responseBody: function (body, data) {

  }
}

module.exports = match
