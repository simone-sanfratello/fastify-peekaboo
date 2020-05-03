# fastify-peekaboo

[![NPM Version](http://img.shields.io/npm/v/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![NPM Downloads](https://img.shields.io/npm/dm/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/braceslab/fastify-peekaboo.svg?branch=master)](https://travis-ci.org/braceslab/fastify-peekaboo)

fastify plugin for memoize responses by expressive settings.

## Purpose

Use arbitrary cache to serve responses from previous elaboration, matching them by request and response.

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
  // default settings: cache good stuff for 1 day
  rules: [{
    request: {
      methods: true,
      route: true
    },
    response: {
      status: (code) => code > 199 && code < 300
    }
  }],
  storage: { mode: 'memory' },
  expire: 86400000, // 1 day in ms
  xheader: true,
  log: false
})

_fastify.get('/home', async (request, response) => {
  const _home = 'welcome!'
  response.send(_home)
})

_fastify.get('/image', async (request, response) => {
  response.send(fs.createReadStream('image.png'))
})

await _fastify.listen(80)
```

First call to `/home` or `/image` will execute the handler; from second time content will be served straight from the cache without running the handlers.

Cache storage can be `memory` (ram), `fs`.

## Settings

Cache works by matching request and response.  
If `request` (and `response`) match, `response` is saved by hashing the matching `request`.  
The first rule that match the request is choosen.

### settings

```js
{
  rules: MatchingRule[],
  storage: Storage,
  expire: number,
  xheader: boolean
}
```

#### settings.rules

The set of rules that indicate to use cache or not for requests.  
See [matching system](./doc/README.md#matching-system) for details.

#### settings.storage

- `mode`  
  type: `string`  [ `memory` | `fs` ]  
  default: `memory`  
  storage use [keyv](https://github.com/lukechilds/keyv) for interface; it can be:
  - `memory` (default) cache use runtime memory
  - `fs` use filesystem, need also `config`

- `config`  
  type: `object`  

  for `file` mode
  - `path`  
    type: `string`  
    path on filesystem where cache files will be stored

  ```js
  {
    mode: 'memory'
  }

  {
    mode: 'fs',
    config: { path: '/tmp/peekaboo' }
  }
  ```

#### settings.expire

type: `number`  
default: `86400000` // 1 day  
cache expiration in ms, optional

#### settings.xheader

type: `boolean`  
default: `true`  
add on response header `x-peekaboo` if response come from cache

### Log

Use server log settings

```js
fastify({ logger: true })
```

## Documentation

See [documentation](./doc/README.md) for further informations and examples.

---

## Changelog

- **v. 1.0**
  - new matching system
  - drop redis storage
  - 100% test coverage
  - validate settings with `superstruct`

- **v. 0.5.0-beta** [ 2020-04-30 ] beta  
  - upgrade dependencies

- **v. 0.4.0-beta** [ 2019-05-21 ] beta  
  - upgrade to `fastify v.2`
  - fix redis connection close (by fork to keyv redis adapter https://github.com/simone-sanfratello/keyv-redis)

- **v. 0.1.0-alpha** [ 2018-12-27 ] alpha  
  - first release

---

## Roadmap

**v. 1.1**

- [ ] postgresql storage?
- [ ] `response.rewrite` option
- [ ] doc: real world examples
- [ ] benchmark plugin overhead (autocannon?)
  - [ ] benchmark with different storages
- [ ] on file upload?
- [ ] test edge cases
  - [ ] querystring array or object

**v. 1.3**

- [ ] settings recipes (example graphql caching)
- [ ] CI

**v. 1.4**

- [ ] different storage, expire, xheader for each match
- [ ] invalidate cache (by ...?)
- [ ] expire can be a function(request, response)

---

## License

The MIT License (MIT)

Copyright (c) 2018-2020 [Simone Sanfratello](https://braceslab.com)

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
