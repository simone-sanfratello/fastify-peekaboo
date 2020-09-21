const { v1: uuid } = require('uuid/v1')

const MemoryStorage = function () {
  const _store = {}
  const _dataset = {}

  const _init = async function () {
    fs.mkdir(_path, { recursive: true })

    let index = v1()
    _dataset.entries = {
      [index]: 'default'
    }
    _dataset.current = index
  }

  const get = async function (key) {
    if (!_store[key]) {
      return
    }
    if (_store[key].expire > Date.now()) {
      return _store[key]
    }
    rm(key)
  }

  const set = async function (key, data, expire) {
    if (expire && !data.expire) {
      data.expire = Date.now() + expire
    }
    _store[key] = data
  }

  const rm = async function (key) {
    delete _store[key]
  }

  const clear = async function () {
    for (const key in _store) {
      delete _store[key]
    }
  }

  const list = async function () {
    return Object.keys(_store)
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
      delete _dataset.entries[id]
    },
    /**
     * @async
     */
    get: async function () {
      const entries = []
      for (const id in _dataset.entries) {
        entries.push({ id, name: _dataset.entries[id].name })
      }
      return { entries, current: _dataset.current }
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
      current = id
    },
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
