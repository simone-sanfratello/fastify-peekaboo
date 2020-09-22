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

  const dataset = {
    /**
     * @async
     * @param {string} name
     * @throws
     */
    create: function (name) {
      if (!name) {
        throw Error('INVALID_DATASET_NAME')
      }
      return _storage.dataset.create(name)
    },
    /**
     * @async
     * @param {hash} id
     * @param {string} name
     * @throws
     */
    update: function (id, name) {
      if (!name) {
        throw Error('INVALID_DATASET_NAME')
      }
      return _storage.dataset.update(id, name)
    },
    /**
     * @async
     * @param {hash} id
     * @throws
     */
    remove: function (id) {
      return _storage.dataset.remove(id)
    },
    get: function () {
      return _storage.dataset.get()
    },
    /**
     * @async
     * @param {hash} id
     * @throws
     */
    set: function (id) {
      return _storage.dataset.set(id)
    }
  }

  _init(options)

  return {
    get,
    set,
    rm,
    list,
    clear,
    dataset
  }
}

module.exports = Storage
