const Keyv = require('keyv')
const KeyvFile = require('keyv-file')
const uuid = require('uuid/v4')
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
  let __storage

  const __init = function (options) {
    if (!options) {
      options = { }
    }
    if (!options.mode) {
      options.mode = lib.STORAGE.MEMORY
    }
    if (!options.expire) {
      options.expire = 60 * 1000
    }

    switch (options.mode) {
      case lib.STORAGE.FS:
        __storage = new Keyv({
          store: new KeyvFile({
            filename: path.join(options.config.path, uuid())
          })
        })
        break
      case lib.STORAGE.REDIS:
        __storage = new Keyv(options.config.connection)
        __storage.on('error', (error) => {
          // @todo logger.error
          console.error(error)
        })
        fastify.addHook('onClose', (instance, done) => {
          // @todo not working
          // @see https://github.com/lukechilds/keyv-redis/issues/12
          __storage.opts.store.closeConnection && __storage.opts.store.closeConnection()
        })
        break
      case lib.STORAGE.MEMORY:
      default:
        __storage = new Keyv()
    }
  }

  const get = async function (key) {
    return __storage.get(key)
  }

  const set = async function (key, data) {
    return __storage.set(key, data, options.expire)
  }

  __init(options)

  return {
    get: get,
    set: set
  }
}

module.exports = Storage
