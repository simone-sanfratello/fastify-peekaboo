# fastify-peekaboo

[![NPM Version](http://img.shields.io/npm/v/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![NPM Downloads](https://img.shields.io/npm/dm/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/braceslab/fastify-peekaboo.svg?branch=master)](https://travis-ci.org/braceslab/fastify-peekaboo)

fastify plugin for response caching

## Purpose

Use arbitrary cache for serve response from previous elaborations, matching by request and response 

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
  expire: number
  xheader: boolean
}
```

#### match.request

Request

#### match.response

Response

#### match.storage

type: `object`   

- `mode`   
  type: `string`  [ `memory` | `file` | `redis` ]   
  storage use [keyv](https://github.com/lukechilds/keyv) for cache; it can be:
    - `memory` (default) cache use runtime memory 
    - `file` use filesystem, need also `config`
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
ms cache expiration (default `86400000` = 1 day)

#### match.xheader

type: `boolean`   
add on response header `x-peekaboo` if response come from cache (default `true`)

### default

Default match: consider each match starts from default settings

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

**v. 1.0** release

---

## TODO

- [ ] settings conflict detection
- [ ] storages
  - [ ] file
  - [ ] redis
- [ ] doc matching 
  - [ ] composable matching (`URL + QUERYSRING`)
- [ ] use tollo to document api
- [ ] use tollo to run test
  - [ ] use random data from `faker` and|or `casual`
- [ ] validate options before plug
- [ ] different options by matching (even different storage)
- [ ] invalidate cache
- [ ] option add x-tag
- [ ] verbosity (via fastify logger?)
- [ ] expire
- [ ] test edge cases
  - [ ] querystring array or object
- [ ] use cases examples
  - [ ] lazyly put everything on `storage`
- [ ] use fs storage via kyev adaptor
- [ ] benchmark with/without (autocannon?)
- [ ] pre-packed settings (example graphql caching)
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
