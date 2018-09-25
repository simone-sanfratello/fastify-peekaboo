const Keyv = require('keyv')

const Storage = function (options) {
  let __storage

  const __init = function (options) {
    __storage = new Keyv()
  }

  __init()

  return {
    
  }
}

module.exports = Storage
