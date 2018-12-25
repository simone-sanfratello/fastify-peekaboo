### Examples

Init

```js
const fastify = require('fastify')
const peekaboo = require('fastify-peekaboo')

const _fastify = fastify()
_fastify.register(peekaboo, {
  matches: [
    // match
  ]}
)
```

- cache route `/home` (using default settings)
  ```js 
  const match = {
    request: {
      methods: 'get',
      route: '/home'
    }
  }
  ```
  - response using cache after from the second time, same response always
  ```js
  _fastify.get('/home', async (request, response) => {
    response.send('hey there')
  })
  ```

- cache route /session by cookie
  ```js 
  const match = {
    request: {
      methods: '*',
      route: '/session',
      headers: ['cookie']
    }
  }
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

- cache route /content by params even if response is an error
  ```js 
  const match = {
    request: {
      methods: 'get',
      route: '/content/:id',
      params: '*'
    },
    response: {
      headers: {
        status: '*'
      }
    }
  }
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

- cache route /content by querystring but only if response contains "airplane"
  ```js 
  const match = {
    request: {
      methods: '*',
      route: '/contents',
      query: '*'
    },
    response: {
      body: (body) => {
        return body
          .find((content) => {
            return content === 'airplane'
          })
      }
    }
  }
  ```
  - response using cache, different by query string
  ```js 
  _fastify.get('/contents', async (request, response) => {
    // ... retrieve contents
    const _contents = content.query(request.query.page)
    response.send(_contents)
  })
  ```

- cache route /content by body (updating data)  
  !nb. it's very rare to do so, it's just an example
  ```js 
  const match = {
    request: {
      methods: 'put',
      route: '/content/:id',
      body: '*'
    }
  }
  ```
  - response using cache, different by request body
  ```js 
  _fastify.put('/content/:id', async (request, response) => {
    // ... update content
    response.send('well done')
  })
  ```
