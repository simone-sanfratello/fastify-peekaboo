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

      const _matching = {
        method: request.req.method.toLowerCase()
      }

      if (_rule.request.route) {
        if (!match.requestRoute(_rule.request.route, request.req)) {
          continue
        }
        _matching.route = request.req.url
      }

      if (_rule.request.headers) {
        const _headers = match.requestHeaders(_rule.request.headers, request.req)
        if (!_headers) {
          continue
        }
        _matching.headers = _headers
      }

      if (_rule.request.body) {
        const _body = match.requestBody(_rule.request.body, request.req)
        if (!_body) {
          continue
        }
        _matching.body = _body
      }

      if (_rule.request.query) {
        const _query = match.requestQuery(_rule.request.query, request.req)
        if (!_query) {
          continue
        }
        _matching.query = _query
      }

      return {
        hash: lib.hash(_matching),
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
    if (typeof route === 'string') {
      return request.url.indexOf(route) === 0
    }
    if (route instanceof RegExp) {
      return request.url.match(route)
    }
    return route(request.url)
  },

  /**
   * @param {fastify.Request} request
   * @return {bool}
   */
  requestHeaders: function (headers, request) {

  },

  /**
   * @param {fastify.Request} request
   * @return {bool}
   */
  requestBody: function (body, request) {

  },

  /**
   * @param {fastify.Request} request
   * @return {bool}
   */
  requestQuery: function (query, request) {

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
