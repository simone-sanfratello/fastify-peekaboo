const url = require('url')

const matcher = {
  request: function (request, rule) {
    const route = new url.URL('http://a.b' + request.raw.url).pathname

    if (!matcher.list(request.method.toLowerCase(), rule.methods) ||
      !matcher.string(route, rule.route)) {
      return false
    }

    if (rule.headers && !matcher.object(request.headers, rule.headers)) {
      return false
    }

    if (rule.query && !matcher.object(request.query, rule.query)) {
      return false
    }

    if (rule.body && !matcher.object(request.body, rule.body)) {
      return false
    }
    return true
  },

  response: function (response, rule) {
    if (!rule) {
      return true
    }
    if (rule.status && !matcher.number(response.status, rule.status)) {
      return false
    }
    if (rule.headers && !matcher.object(response.headers, rule.headers)) {
      return false
    }
    if (rule.body && !matcher.object(response.body, rule.body)) {
      return false
    }
    return true
  },

  string: function (string, match) {
    const typeOf = typeof match
    if (typeOf === 'boolean') {
      return (match && string !== undefined) || (!match && string === undefined)
    }
    if (typeOf === 'string') {
      return string === match
    }
    if (typeOf === 'function') {
      return !!match(string)
    }
    if (match instanceof RegExp) {
      return match.test(string)
    }
    return false
  },

  number: function (number, match) {
    if (number === undefined) {
      return false
    }
    const typeOf = typeof match
    if (typeOf === 'boolean') {
      return match
    }
    if (typeOf === 'string' || typeOf === 'number') {
      // eslint-disable-next-line
      return number == match
    }
    if (typeOf === 'function') {
      return !!match(number)
    }
    if (match instanceof RegExp) {
      return match.test(number.toString())
    }
    return false
  },

  list: function (value, match) {
    if (match === '*' || match === true) {
      return true
    }
    if (match === false) {
      return false
    }
    const typeOf = typeof match
    if (typeOf === 'function') {
      return !!match(value)
    }
    if (typeOf === 'string') {
      return match === value
    }
    return match.includes(value)
  },

  object: function (object, match) {
    if (match === true) {
      return true
    }
    if (match === false) {
      return false
    }
    if (typeof match === 'function') {
      return !!match(object)
    }
    for (const key in match) {
      if (!matcher.string(object[key], match[key])) {
        return false
      }
    }
    return true
  }

}

module.exports = matcher
