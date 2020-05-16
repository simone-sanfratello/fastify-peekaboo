const MemoryStorage = function () {
  const _store = {}
  const _expires = {}

  const get = async function (key) {
    if (_store[key]) {
      if (_expires[key] > Date.now()) {
        return _store[key]
      }
      rm(key)
    }
  }

  const set = async function (key, data, expire) {
    _expires[key] = Date.now() + expire
    _store[key] = data
  }

  const rm = async function (key) {
    delete _store[key]
    delete _expires[key]
  }

  const list = async function () {
    return Object.keys(_store)
  }

  return {
    get,
    set,
    rm,
    list
  }
}

module.exports = MemoryStorage
