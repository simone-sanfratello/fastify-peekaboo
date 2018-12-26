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
    for (const _match of matches) {
      if (!match.method(_match.request.methods, request.req)) {
        continue
      }

      const _matching = {
        method: request.req.method.toLowerCase()
      }

      if (_match.request.route) {
        if (!match.route(_match.request.route, request.req)) {
          continue
        }
        _matching.route = request.req.url
      }

      if (_match.request.headers) {
        const _headers = match.headers(_match.request.headers, request.req)
        if (!_headers) {
          continue
        }
        _matching.headers = _headers
      }

      if (_match.request.body) {
        const _body = match.body(_match.request.body, request.req)
        if (!_body) {
          continue
        }
        _matching.body = _body
      }

      if (_match.request.query) {
        const _query = match.query(_match.request.query, request.req)
        if (!_query) {
          continue
        }
        _matching.query = _query
      }

      return {
        hash: lib.hash(_matching),
        match: _match
      }
    }
    return { match: null, hash: null }
  },

  /**
   * @todo
   * @param {fastify.Response} response
   * @param {*} match
   * @return {bool}
   */
  response: function (response, match) {
    if (!match.response) {
      return true
    }
  },

  /**
   * @param {string|string[]} method
   * @param {fastify.Request} request
   * @return {bool}
   */
  method: function (methods, request) {
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
  route: function (route, request) {
    if (typeof route === 'string') {
      return request.url.indexOf(route) === 0
    }
    if (route instanceof RegExp) {
      return request.url.match(route)
    }
    return route(request.url)
  }
}

module.exports = match
