const lib = {
  METHOD: {
    ALL: 'all',
    GET: 'get',
    HEAD: 'head',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    OPTIONS: 'options',
    PATCH: 'patch'
  },

  MATCH: {
    URL: 'url',
    QUERYSTRING: 'qs',
    BODY: 'body',
    COOKIE: 'cookies',
    HEADER: 'header',
    CUSTOM: 'custom'
  },

  STORAGE: {
    MEMORY: 'memory',
    FILE: 'file',
    POSTGRESQL: 'pg',
    REDIS: 'redis'
  }

}

module.exports = lib
