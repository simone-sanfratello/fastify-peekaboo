# fastify-peekaboo

[![NPM Version](http://img.shields.io/npm/v/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![NPM Downloads](https://img.shields.io/npm/dm/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/braceslab/fastify-peekaboo.svg?branch=master)](https://travis-ci.org/braceslab/fastify-peekaboo)

fastify plugin for response caching

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

const _fastify = fastify()
_fastify.register(peekaboo, {
  matches: [
    {
      request: {
        methods: 'get',
        route: '/home'
      }
    }
  ]
})

_fastify.get('/home', async (request, response) => {
  const _home = '...elaborate home content'
  response.send(_home)
})

await _fastify.listen(80)
```

First call to `/home` will execute the handler and after will be served the same content from cache

#### working with streams

## Settings

Cache is based on matching resquest and response

### match schema

```js
{
  match: {
    request: Request,
    response: Response
  },
  storage: Storage,
  expire: number,
  xheader: boolean,
  log: boolean
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

#### match.log

type: `boolean`   
default: `true`  
enable log messages, using fastify logger

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


## Documentation

See [documentation](./doc/README.md) for further informations and examples.

---

## Changelog

- **v. 0.1.0-alpha** [ 2018-12-27 ] alpha   

---

## TODO

- [ ] logs and verbosity (use fastify log system?)
- [ ] match route with fastify syntax
- [ ] use tollo to run test
  - [ ] use random data from `faker` and|or `casual`
- [ ] jsdoc
- [ ] what if response is a stream?
- [ ] on file upload?
- [ ] validate options before plug
- [ ] different storage, expire, xheader for each match
- [ ] invalidate cache (by ...?)
- [ ] verbosity (via fastify logger?)
- [ ] expire can be a function(request, response)
- [ ] test edge cases
  - [ ] querystring array or object
- [ ] settings conflict detection 
- [ ] benchmark plugin overhead (autocannon?)
- [ ] pre-packed settings (example graphql caching)
- [ ] real application example: proxy server
- [ ] review https://github.com/fastify/fastify/blob/master/docs/Write-Plugin.md
- [ ] use other kyev supported storage (postgresql, mongo, mysql, sqlite)

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
