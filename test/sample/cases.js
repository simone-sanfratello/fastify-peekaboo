const peekaboo = require('../../src/plugin')

const cases = {
  routes: [
    {
      url: '/a-very/readable/url',
      method: 'all',
      ouput: 'hey yo, what\'s up dude?'
    },
    {
      url: '/home',
      method: 'get',
      ouput: 'welcome to las vegas'
    },
    {
      url: '/api/v1/user',
      method: 'post',
      ouput: { id: 123 }
    }
  ],

  match: [
    {
      by: {
        [peekaboo.MATCH.URL]: '/a-very/readable/url'
      }
    },
    {
      by: {
        [peekaboo.MATCH.QUERYSTRING]: [ 'filter', 'p1' ]
      }
    },
    {
      by: {
        [peekaboo.MATCH.BODY]: [ 'param0', 'param1' ]
      }
    },
    {
      by: {
        [peekaboo.MATCH.COOKIE]: [ 'Auth-Bearer', 'session-id' ]
      }
    },
    {
      by: {
        [peekaboo.MATCH.HEADER]: [ 'Accept-Language' ]
      }
    },
    {
      by: {
        [peekaboo.MATCH.CUSTOM]: (request) => {
          return request.url.indexOf('/a-static-response')
        }
      }
    },
    {
      by: {
        [peekaboo.MATCH.URL]: '/api/v1.1/users',
        [peekaboo.MATCH.QUERYSTRING]: [ 'name', 'age' ]
      }
    },
    {
      by: {
        [peekaboo.MATCH.URL]: '/api/v1.1/users',
        [peekaboo.MATCH.HEADER]: [ 'Cookie' ]
      }
    }
  ],

  storages: [{
    type: peekaboo.STORAGE.MEMORY
  }],

  requests: [
    {
      url: '/a-very/readable/url',
      method: 'get'
    },
    {
      url: '/a-very/readable/url',
      method: 'put'
    },
    {
      url: '/a-very/readable/url',
      method: 'get',
      headers: {
        'session-id': '123abc'
      }
    },
    {
      url: '/api/v1/user',
      method: 'post',
      body: JSON.stringify({
        param0: 1,
        param1: 2
      }),
      output: {
        code: 404
      }
    },
    {
      url: '/api/v1/user',
      method: 'post',
      body: JSON.stringify({
        param0: 1,
        param1: 2
      }),
      output: {
        code: 200
      }
    },
    {
      url: '/a-very/readable/url',
      method: 'get',
      headers: {
        cookie: 'Auth-Bearer=blabla;'
      }
    }
  ]
}

module.exports = cases
