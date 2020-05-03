const lib = require('./lib')
const matcher = require('./matcher')

const match = {
  /**
   * @param {fastify.Request} request
   * @return {{rule,has}|undefined}
   */
  request: function (request, rules) {
    for (let index = 0; index < rules.length; index++) {
      const rule = rules[index]
      if (matcher.request(request, rule.request)) {
        return { rule, hash: lib.hash.request(request, rule.request) }
      }
    }
  },

  /**
   * @param {fastify.Request} request
   * @return {hash|undefined}
   */
  response: function (response, rule) {
    if (matcher.response(response, rule.response)) {
      return lib.hash.response(response, rule.response)
    }
  }

}

module.exports = match
