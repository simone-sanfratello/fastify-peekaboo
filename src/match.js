const lib = require('./lib')

const match = {
  /**
   * @todo
   */
  request: function (request, matches) {
    for (let i = 0; i < matches.length; i++) {
    // @todo matching by routes, then by other options
      // ... if match
      return lib.hash(_matching)
    }
    return null
  },
  /**
   * @todo
   * @param {*} response
   * @param {*} match
   */
  response: function (response, match) {

  }
}

module.exports = match
