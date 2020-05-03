const Keyv = require('keyv')
const KeyvFile = require('keyv-file')
const uuid = require('uuid').v4
const path = require('path')
const lib = require('./lib')

// https://github.com/lukechilds/keyv-test-suite/blob/master/src/api.js

/**
 *
 * @param {object} [options]
 * @param {peekaboo.STORAGE} [options.type=lib.STORAGE.MEMORY]
 * @param {number} [options.expire=60000] 1 min
 */
const Storage = function (options, fastify) {
  let _storage

  const _init = function (options = {}) {
    if (!options.mode) {
      options.mode = lib.STORAGE.MEMORY
    }
    if (!options.expire) {
      options.expire = 60 * 1000
    }

    switch (options.mode) {
      case lib.STORAGE.FS:
        _storage = new Keyv({
          store: new KeyvFile({
            filename: path.join(options.config.path, uuid())
          })
        })
        break
      case lib.STORAGE.MEMORY:
      default:
        _storage = new Keyv()
    }
  }

  const get = async function (key) {
    return _storage.get(key)
  }

  const set = async function (key, data) {
    return _storage.set(key, data, options.expire)
  }

  _init(options)

  return {
    get: get,
    set: set
  }
}

module.exports = Storage
