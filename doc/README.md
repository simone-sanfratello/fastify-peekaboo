### Examples

Setup and run

```js
const fastify = require('fastify')
const peekaboo = require('fastify-peekaboo')

const _fastify = fastify()
_fastify.register(peekaboo, {
  rules: [
    // list of matches, see below
  ]}
)
```

- cache route `/home` (using default settings)
  ```js 
  const rules = [{
    request: {
      methods: 'get',
      route: '/home'
    }
  }]
  ```
  - response using cache after from the second time, same response always
  ```js
  _fastify.get('/home', async (request, response) => {
    response.send('hey there')
  })
  ```

- cache route /session by cookie
  ```js 
  const rules = [{
    request: {
      methods: '*',
      route: '/session',
      headers: ['cookie']
    }
  }]
  ```
  - response using cache but different from header/cookie, means that every request is based on cookie
  ```js 
  _fastify.get('/session', async (request, response) => {
    // remember to use fastify-cookie plugin for "request.cookies"
    // ... retrieve user
    const _user = user.retrieve(request.cookies.token)
    response.send('welcome ' + _user.name)
  })
  ```

- cache route /content even if response is an error
  ```js 
  const rules = [{
    request: {
      methods: 'get',
      route: '/content/',
    },
    response: {
      headers: {
        status: true
      }
    }
  }]
  ```
  - response using cache either on error too
  ```js 
  _fastify.get('/content/:id', async (request, response) => {
    const _id = parseInt(request.params.id)
    if (isNaN(_id)) {
      response.code(405).send('BAD_REQUEST')
      return
    }
    response.send('your content ...')
  })
  ```