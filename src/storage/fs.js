const { v1: uuid } = require('uuid/v1')
const fs = require('fs').promises
const path = require('path')

const MemoryStorage = function (options) {
  const _path = options.path
  const _dataset = {}

  const _init = async function () {
    fs.mkdir(_path, { recursive: true })

    // @todo load dataset index
    let index = v1()
    _dataset.entries = {
      [index]: 'default'
    }
    _dataset.current = index
  }

  const get = async function (key) {
    try {
      const data = await fs.readFile(path.join(_path, key), 'utf8')
      const content = JSON.parse(data)
      if (content.expire && content.expire < Date.now()) {
        rm(key)
        return
      }
      return content
    } catch (error) { }
  }

  const set = async function (key, data, expire) {
    if (expire && !data.expire) {
      data.expire = Date.now() + expire
    }
    return fs.writeFile(path.join(_path, key), JSON.stringify(data), 'utf8')
  }

  const list = async function () {
    const _entries = []
    try {
      const _files = await fs.readdir(_path)
      for (let i = 0; i < _files.length; i++) {
        const _file = _files[i]
        _entries.push(path.basename(_file))
      }
    } catch (error) { }
    return _entries
  }

  const rm = async function (key) {
    try {
      fs.unlink(path.join(_path, key))
    } catch (error) { }
  }

  const clear = async function () {
    try {
      const _files = await fs.readdir(_path)
      for (let i = 0; i < _files.length; i++) {
        fs.unlink(path.join(_path, _files[i]))
      }
    } catch (error) { }
  }

  const dataset = {
    create: async function(name) {

    },
    update: async function(id, name) {
      if (!_dataset.entries[id]) {
        throw Error('INVALID_DATASET_ID')
      }

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
      // @todo update meta + rmdir
    },
    get: async function () {
      // @todo wait load
      const entries = []
      for (const id in _dataset.entries) {
        entries.push({ id, name: _dataset.entries[id].name })
      }
      return { entries, current }
    },
    /**
     * @async
     * @param {hash} id
     * @throws error if `id` is not a valid dataset id
     */
    set: async function (value) {
      if (!set[value]) {
        throw Error('INVALID_DATASET_CURRENT_VALUE')
      }
      current = value
      // @todo write meta
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
