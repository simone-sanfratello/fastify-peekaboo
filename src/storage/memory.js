const MemoryStorage = function () {
  const _store = {}

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

  return {
    get,
    set,
    rm,
    list,
    clear
  }
}

module.exports = MemoryStorage
