const Keyv = require('keyv')

// https://github.com/lukechilds/keyv-test-suite/blob/master/src/api.js

const Storage = function (options) {
  let __storage

  const __init = function (options) {
    __storage = new Keyv()
  }

  /**
   * generate id from request matching by options
   */
  const __id = function(request) {

  }

  const get = async function (request) {
    // match request with options rules
    // generate id from request
    // retrieve from storage
    // return null if any
  }

  const set = async function (request, data) {
    // generate id from request
    // store data by id
  }

  __init()

  return {
    get: get,
    set: set
  }
}

module.exports = Storage
