## Matching system

#### MatchRule

```js
{
  request: MatchRequest,
  response?: MatchResponse
}
```

#### MatchRequest

`route` and `methods` are mandatory, while can be any values.

```js
{
  methods: MatchList,
  route: MatchString,
  headers?: MatchObject,
  body?: MatchObject,
  query?: MatchObject
}
```

#### MatchResponse

```js
{
  status?: MatchNumber,
  headers?: MatchObject,
  body?: MatchObject
}
```

#### MatchString

`request.route` and properties of `MatchObject` use a string matching logic and can be matched by:

- `true` or `false`
- string
- regexp
- function

**Examples**

```js
route: true
```

match everything not null

```js
authorization: false
```

match if value is not set (or undefined)

```js
route: '/home'
```

exact match: match if value is `===`

```js
route: /^\/public/
```

use a regexp: everything starts with `/public` in this case

```js
route: (value) => value != '/private'
```

use a function for more logic

#### MatchNumber

Only `response.status` uses this

```js
status: true
```

always

```js
status: false
```

never

```js
status: 200
```

exact match: match if value is `200` but not `201`

```js
status: /^2/
```

use a regexp: `2xx` response status are ok

```js
status: (code) => code > 199 && code < 300
```

use a function for more logic: `2xx` statuses are ok

#### MatchList

Only `request.methods` uses this

```js
methods: true
```

always

```js
methods: '*'
```

always

```js
methods: false
```

never

```js
methods: 'get'
```

exact match: cache only `GET` requests. Allowed values:  
`'get', 'head', 'post', 'put', 'delete', 'options', 'patch'`

```js
methods: ['get', 'head']
```

match methods in the list

```js
methods: (method) => method != 'delete'
```

use a function for more logic: anything but `DELETE`

#### MatchObject

`request.headers`, `request.body`, `request.query`, `response.headers` and `response.body` use the same logic.

```js
request: { body: true }
```

match if body is present; also use the whole body for hashing

```js
request: { body: false }
```

match if body not is present

```js
response: {
  headers: (headers) => {
    return !headers.authorization
  }
}
```

match with a function, in this case only if `response` has no `authorization` header

```js
response: {
  headers: {
    'content-type': /^\/image\//,
    'content-length': (length) => length < 2048
  }
}
```

Match single object entries using a `MatchString` logic.  
All entries must success in order to match the object.  
In this case, match all sent images less than 2k.

---

## Examples

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

- cache `GET /home` (using default settings)

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
      headers: {
        cookie: true
      }
    }
  }]
  ```

- response using cache but different from header/cookie, means that every request is based on cookie

  ```js
  _fastify.get('/session', async (request, response) => {
    // cookie parsing is done by a plugin like fastify-cookie
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
      route: /^\/content/,
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
