const fs = require('fs').promises
const path = require('path')

const MemoryStorage = function (options) {
  const _expires = {}
  const _path = options.path

  fs.mkdir(_path, { recursive: true })

  const get = async function (key) {
    if (_expires[key] && _expires[key] < Date.now()) {
      rm(key)
      return
    }
    try {
      const content = await fs.readFile(path.join(_path, key), 'utf8')
      return JSON.parse(content)
    } catch (error) { }
  }

  const set = async function (key, data, expire) {
    _expires[key] = Date.now() + expire
    return fs.writeFile(path.join(_path, key), JSON.stringify(data), 'utf8')
  }

  const rm = async function (key) {
    try {
      fs.unlink(path.join(_path, key))
      delete _expires[key]
    } catch (error) { }
  }

  return {
    get: get,
    set: set,
    rm: rm
  }
}

module.exports = MemoryStorage
