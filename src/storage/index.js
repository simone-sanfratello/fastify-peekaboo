const lib = require('../lib')
const FsStorage = require('./fs')
const MemoryStorage = require('./memory')

/**
 * @param {object} [options]
 * @param {peekaboo.STORAGE} [options.type=lib.STORAGE.MEMORY]
 * @param {number} [options.expire=60000] 1 min
 */
const Storage = function (options) {
  let _storage

  const _init = function (options) {
    if (!options.mode) {
      options.mode = lib.STORAGE.MEMORY
    }
    if (!options.expire) {
      options.expire = 60 * 1000
    }

    switch (options.mode) {
      case lib.STORAGE.FS:
        _storage = new FsStorage({
          path: options.config.path
        })
        break
      case lib.STORAGE.MEMORY:
      default:
        _storage = new MemoryStorage()
    }
  }

  /**
   * @async
   * @param {string} key
   */
  const get = function (key) {
    return _storage.get(key)
  }

  /**
   * @async
   * @param {string} key
   */
  const set = function (key, data) {
    return _storage.set(key, data, options.expire)
  }

  /**
   * @async
   */
  const list = function () {
    return _storage.list()
  }

  /**
   * @async
   * @param {string} key
   */
  const rm = function (key) {
    return _storage.rm(key)
  }

  /**
   * @async
   */
  const clear = function () {
    return _storage.clear()
  }

  _init(options)

  return {
    get,
    set,
    rm,
    list,
    clear
  }
}

module.exports = Storage
