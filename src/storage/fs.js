const { v1: uuid } = require('uuid')
const fs = require('fs').promises
const path = require('path')

const FsStorage = function (options) {
  const _basePath = options.path
  const _dataset = {}
  let _indexFile
  let _defaultDataset
  let _path

  const _init = async function () {
    _defaultDataset = uuid()
    _path = path.join(_basePath, _defaultDataset)
    _indexFile = path.join(_basePath, 'index.json')
    await fs.mkdir(_path, { recursive: true })

    _dataset.entries = {
      [_defaultDataset]: 'default'
    }
    _dataset.current = _defaultDataset
    await dataset.init()
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
    /**
     * load dataset index or create the dataset index file
     * @async
     * @throws
     */
    init: async function () {
      try {
        const index = require(_indexFile)
        dataset.entries = index.entries
        dataset.current = index.current
        return
      } catch (error) {
        // index not found or invalid
      }
      // create a new one
      _inited = dataset.saveIndex()
      await _inited
    },
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
      const id = uuid()
      _dataset.entries[id] = name
      await fs.mkdir(path.join(_basePath, _defaultDataset))
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
      if (!_dataset.entries[id]) {
        throw Error('INVALID_DATASET_ID')
      }
      _dataset.entries[id] = name
      await dataset.saveIndex()
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
      const entries = _dataset.entries
      delete _dataset.entries[id]
      await dataset.saveIndex()
      if (_dataset.current == id) {
        dataset.set(_defaultDataset)
      }
      // launch but don't wait for remove files and dir
      dataset._remove(id, entries)
    },
    _remove: async function (id, entries) {
      const dir = path.join(_basePath, id)
      for (const key in entries) {
        await fs.unlink(path.join(dir, key))
      }
      fs.rmdir(dir)
    },
    get: async function () {
      await _inited
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
      if (!_dataset.entries[id]) {
        throw Error('INVALID_DATASET_CURRENT_VALUE')
      }
      _dataset.current = id
      _path = path.join(_basePath, id)
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

module.exports = FsStorage
