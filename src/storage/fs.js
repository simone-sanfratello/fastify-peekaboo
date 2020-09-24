const { v1: uuid } = require('uuid')
const fs = require('fs-extra')
const path = require('path')

const FsStorage = function (options) {
  const _basePath = options.path
  const _dataset = {}
  let _indexFile
  let _path
  let _inited

  const _init = async function () {
    _indexFile = path.join(_basePath, 'index.json')
    await fs.ensureDir(_basePath)

    try {
      // try load dataset index
      const index = require(_indexFile)
      _dataset.default = index.default
      _dataset.entries = index.entries
      _dataset.current = index.current
    } catch (error) {
      // create the dataset index file if index is not found or invalid
      _dataset.default = uuid()
      _dataset.entries = {
        [_dataset.default]: 'default'
      }
      _dataset.current = _dataset.default
      await dataset.saveIndex()
    }
    _path = path.join(_basePath, _dataset.current)
    await fs.ensureDir(_path)
  }

  const get = async function (key) {
    try {
      await _inited
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
    try {
      await _inited
      if (expire && !data.expire) {
        data.expire = Date.now() + expire
      }
      return fs.writeFile(path.join(_path, key), JSON.stringify(data), 'utf8')
    } catch (error) { }
  }

  const list = async function () {
    const _entries = []
    try {
      await _inited
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
      await _inited
      fs.unlink(path.join(_path, key))
    } catch (error) { }
  }

  const clear = async function () {
    try {
      await _inited
      const _files = await fs.readdir(_path)
      for (let i = 0; i < _files.length; i++) {
        fs.unlink(path.join(_path, _files[i]))
      }
    } catch (error) { }
  }

  const dataset = {
    /**
     * @async
     * @throws
     */
    saveIndex: function () {
      return fs.writeFile(_indexFile, JSON.stringify(_dataset), 'utf8')
    },
    /**
     * @async
     * @param {string} name
     * @returns {hash} id
     * @throws
     */
    create: async function (name) {
      await _inited
      const id = uuid()
      _dataset.entries[id] = name
      await fs.ensureDir(path.join(_basePath, _dataset.default))
      await dataset.saveIndex()
      return id
    },
    /**
     * @async
     * @param {hash} id
     * @param {string} name
     * @throws
     */
    update: async function (id, name) {
      try {
        await _inited
        if (!_dataset.entries[id]) {
          throw Error('INVALID_DATASET_ID')
        }
        _dataset.entries[id] = name
        await dataset.saveIndex()
      } catch (error) {
        throw error
      }
    },
    /**
     * @async
     * @param {hash} id
     * @throws
     */
    remove: async function (id) {
      try {
        await _inited
        if (!_dataset.entries[id]) {
          throw Error('INVALID_DATASET_ID')
        }
        if (id == _dataset.default) {
          throw Error('INVALID_DATASET_OPERATION_CANT_REMOVE_DEFAULT')
        }
        const entries = _dataset.entries
        delete _dataset.entries[id]
        await dataset.saveIndex()
        if (_dataset.current == id) {
          dataset.set(_dataset.default)
        }
        fs.remove(path.join(_basePath, id))
      } catch (error) {
        throw error
      }
    },
    get: async function () {
      await _inited
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
      await _inited
      if (!_dataset.entries[id]) {
        throw Error('INVALID_DATASET_CURRENT_VALUE')
      }
      _dataset.current = id
      _path = path.join(_basePath, id)
      await dataset.saveIndex()
    }
  }

  _inited = _init()

  return {
    get,
    set,
    rm,
    list,
    clear,
    dataset
  }
}

module.exports = FsStorage
