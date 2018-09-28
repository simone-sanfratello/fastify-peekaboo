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
    CUSTOM: 0,
    METHOD: 1,
    URL: 2,
    QUERYSTRING: 3,
    BODY: 4,
    COOKIE: 5,
    HEADER: 6
  },

  STORAGE: {
    MEMORY: 'memory',
    FILE: 'file',
    POSTGRESQL: 'pg',
    REDIS: 'redis'
  }

}

module.exports = lib
