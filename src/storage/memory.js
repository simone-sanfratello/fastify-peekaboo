const { v1: uuid } = require('uuid')

const MemoryStorage = function () {
  const _dataset = {}
  const _store = {}

  const _init = async function () {
    _dataset.default = uuid()
    _dataset.entries = {
      [_dataset.default]: 'default'
    }
    _dataset.current = _dataset.default
    _store[_dataset.default] = {}
    _dataset.store = _store[_dataset.default]
  }

  const get = async function (key) {
    if (!_dataset.store[key]) {
      return
    }
    if (_dataset.store[key].expire > Date.now()) {
      return _dataset.store[key]
    }
    rm(key)
  }

  const set = async function (key, data, expire) {
    if (expire && !data.expire) {
      data.expire = Date.now() + expire
    }
    _dataset.store[key] = data
  }

  const rm = async function (key) {
    delete _dataset.store[key]
  }

  const clear = async function () {
    for (const key in _dataset.store) {
      delete _dataset.store[key]
    }
  }

  const list = async function () {
    return Object.keys(_dataset.store)
  }

  const dataset = {
    /**
     * @async
     * @param {string} name
     * @returns {hash} id
     * @throws
     */
    create: async function (name) {
      const id = uuid()
      _dataset.entries[id] = name
      _store[id] = {}
      return id
    },
    /**
     * @async
     * @param {hash} id
     * @param {string} name
     * @throws
     */
    update: async function (id, name) {
      if (!_dataset.entries[id]) {
        throw Error('INVALID_DATASET_ID')
      }
      _dataset.entries[id] = name
    },
    /**
     * @async
     * @param {hash} id
     * @throws
     */
    remove: async function (id) {
      if (!_dataset.entries[id]) {
        throw Error('INVALID_DATASET_ID')
      }
      if (id == _dataset.default) {
        throw Error('INVALID_DATASET_OPERATION_CANT_REMOVE_DEFAULT')
      }
      delete _dataset.entries[id]
      delete _store[id]
      if (_dataset.current == id) {
        dataset.set(_dataset.default)
      }
    },
    /**
     * @async
     */
    get: async function () {
      return {
        entries: { ..._dataset.entries },
        current: _dataset.current,
        default: _dataset.default
      }
    },
    current: function () {
      return _dataset.current
    },
    /**
     * @async
     * @param {hash} id
     * @throws error if `id` is not a valid dataset id
     */
    set: async function (id) {
      if (!_dataset.entries[id]) {
        throw Error('INVALID_DATASET_CURRENT_VALUE')
      }
      _dataset.current = id
      _dataset.store = _store[id]
    }
  }

  _init()

  return {
    get,
    set,
    rm,
    list,
    clear,
    dataset
  }
}

module.exports = MemoryStorage
