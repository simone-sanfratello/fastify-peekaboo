# fastify-peekaboo

[![NPM Version](http://img.shields.io/npm/v/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![NPM Downloads](https://img.shields.io/npm/dm/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/braceslab/fastify-peekaboo.svg?branch=master)](https://travis-ci.org/braceslab/fastify-peekaboo)

fastify plugin for memoize response

## Purpose

Use arbitrary cache to serve response from previous elaborations, matching by request and response 

## Installing

````bash
npm i fastify-peekaboo
````

### Quick start

```js
const fastify = require('fastify')
const peekaboo = require('fastify-peekaboo')
const fs = require('fs')

const _fastify = fastify()
_fastify.register(peekaboo, {
  matches: [
    {
      request: {
        methods: '*',
        route: '/'
      }
    }
  ]
})

_fastify.get('/home', async (request, response) => {
  const _home = '...elaborate home content'
  response.send(_home)
})

_fastify.get('/image', async (request, response) => {
  response.send(fs.createReadStream('image.png'))
})

await _fastify.listen(80)
```

First call to `/home` or `/image` will execute the handler; from second time content will be served from cache without re-elaborate.

Cache storage can be `memory` (ram), `fs` or `redis`.

## Settings

Cache works by matching request and response

### match schema

```js
{
  match: {
    request: Request,
    response: Response
  },
  storage: Storage,
  expire: number,
  xheader: boolean
}
```

#### match.request

type: `object`   
(mandatory)  

- `route`   
  type: `string` or `RegExp` `function(route:string):bool`  
  default: `null`  
  route to cache

  examples:
  - `/home` (string)  
  - `$/users` (RegExp)
  - `$/user/[0-9]+^` (RegExp)
  - use cache if function return `true`  
  ```js
  function(route) {
    return route.indexOf('/article') === 0
  }
  ```

- `methods`   
  type: `string` or `string[]`  
  default: `get`  
  (mandatory) match by methods; method can be any of `get`, `post`, `put`, `head`, `delete`, `options`, `patch` or  `*` (all) 

  examples:
  - `*` all methods
  - `get` (default value) cache request made using `get` method
  - [`post`, `put`, `delete`] cache request made using any method in the list

- `headers`   
  type: `string` or `string[]` or `function(headers:object):string[]`   
  default: `undefined`  
  match by headers: will be cached only by matching headers, not by whole headers - otherwise, cache is not efficient: just considering for `user-agent` and `host`, cache is actually single client based (but you can do that if is what you want)

  examples:
  - [`authorization`, `cookie`] match considering only these headers values
  - `authorization` match considering `authorization` header value: if `authorization` contains a token, the response will be de facto private
  - `function` cache if function return an array of headers names that will be used for identify the cache
  ```js
  function(headers) {
    if(headers.authentication) {
      return ['cookie']
    }
  }
  ```

- `query`   
  type: `string` or `string[]` or `function(query:string|object):bool`   
  default: `null`  
  match by query content (if any)

  examples:
  - `*` match considering whole query
  - [`page`, `filter`] match considering these query values
  - `page` match considering only `user` value
  - `function` cache if function return `true`
  ```js
  function(query) {
    return query.indexOf('page') !== 0
  }
  ```

- `body`   
  type: `string` or `string[]` or `function(body:string|object|Buffer):bool`   
  default: `undefined`  
  match by body content (if any)

  examples:
  - `*` match considering whole body
  - [`user`, `id`] match considering these body values, if body contains form data
  - `user` match considering only `user` value
  - `function` cache if function return `true`; `body` can be a `string` or `object` or `Buffer` according to response  
  ```js
  function(body) {
    return body.indexOf('something') !== 0
  }
  ```

#### match.response

type: `object`   
(optional)  

- `headers`   
  type: `object` or `function(headers:object):bool`   
  default: `{status: 200}`  
  match by response headers values

  examples:
  - `{status: 200}` (default value) cache only if response status is 200, so discard error responses
  - `function` cache if function return `true`
  ```js
  function(headers) {
    return headers['cache-control'] !== 'no-cache'
  }
  ```
  ```js
  function(headers) {
    return headers['status'] > 199 && headers['status'] < 300
  }
  ```

- `body`   
  type: `object` or `function(body:string|object):bool`   
  default: `null`  
  match by body content (if any)

  examples:
  - `{user: 'Alice'}` match only for `user` `Alice`
  - using `function`, cache will be used if function return `true`
  ```js
  function(body) {
    return body.indexOf('something') !== 0
  }
  ```

#### match.storage

type: `object`   

- `mode`   
  type: `string`  [ `memory` | `fs` | `redis` ]   
  default: `memory`  
  storage use [keyv](https://github.com/lukechilds/keyv) for cache; it can be:
    - `memory` (default) cache use runtime memory 
    - `fs` use filesystem, need also `config`
    - `redis` use redis, need also `config`

- `config`   
  type: `object`   

  for `file` mode
  - `path`   
    type: `string`   
    path on filesystem where cache files will be stored

  for `redis` mode
  - `connection`   
    type: `string`   
    connection string for redis, example `redis://user:pass@localhost:6379`

#### match.expire

type: `number`  
default: `86400000` // 1 day  
cache expiration in ms

#### match.xheader

type: `boolean`   
default: `true`  
add on response header `x-peekaboo` if response come from cache

### default

Default match: consider each match inherits default settings

```js
{
  match: {
    request: {
      method: 'get'
    },
    response: {
      headers: {
        status: 200
      }
    }
  },
  storage: {
    mode: 'memory',
  },
  expire: 86400000, // 1 day in ms
  xheader: true
}
```

### Log

To enable loggin just enable the `fastify` logging option like

```js
fastify({ logger: true })
```

## Documentation

See [documentation](./doc/README.md) for further informations and examples.

---

## Changelog

- **v. 0.4.0-beta** [ 2019-05-21 ] beta   
  - upgrade to `fastify v.2`
  - fix redis connection close (by fork to keyv redis adapter https://github.com/simone-sanfratello/keyv-redis)

- **v. 0.1.0-alpha** [ 2018-12-27 ] alpha   
  - first release

---

## TODO

**v. 1.0**

- [ ] real world examples
- [ ] use tollo to run test
  - [ ] use random data from `faker` and|or `casual`
- [ ] jsdoc
- [ ] validate options before plug
  - [ ] settings conflict detection
  - [ ] send warnings/errors
- [ ] doc review

**v. 1.1**

- [ ] match route with fastify syntax
- [ ] benchmark plugin overhead (autocannon?)
  - [ ] benchmark with different storages
- [ ] on file upload?
- [ ] test edge cases
  - [ ] querystring array or object

**v. 1.3**
- [ ] pre-packed settings (example graphql caching)
- [ ] CI travis

**v. 1.4**
- [ ] different storage, expire, xheader for each match
- [ ] invalidate cache (by ...?)
- [ ] expire can be a function(request, response)

---

## License

The MIT License (MIT)

Copyright (c) 2018 [braces lab](https://braceslab.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
