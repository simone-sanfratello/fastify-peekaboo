const fs = require('fs').promises
const path = require('path')

const MemoryStorage = function (options) {
  const _path = options.path

  fs.mkdir(_path, { recursive: true })

  const get = async function (key) {
    try {
      const data = await fs.readFile(path.join(_path, key), 'utf8')
      const content = JSON.parse(data)
      if (content.expire && content.expire < Date.now()) {
        rm(key)
        return
      }
      return content
    } catch (error) {
      console.error(error)
    }
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
    } catch (error) {}
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

  return {
    get,
    set,
    rm,
    list,
    clear
  }
}

module.exports = MemoryStorage
