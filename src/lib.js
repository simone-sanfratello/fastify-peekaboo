const crypto = require('crypto')

const lib = {
  METHOD: {
    ALL: '*',
    GET: 'get',
    HEAD: 'head',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    OPTIONS: 'options',
    PATCH: 'patch'
  },

  STORAGE: {
    MEMORY: 'memory',
    FILE: 'file',
    REDIS: 'redis'
  },

  hash: function (input) {
    return crypto.createHmac('sha256', '')
      .update(input)
      .digest('hex')
  }

}

module.exports = lib
