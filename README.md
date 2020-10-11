# fastify-peekaboo

[![NPM Version](http://img.shields.io/npm/v/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![NPM Downloads](https://img.shields.io/npm/dm/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
![100% code coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Snyk Security Rate](https://snyk-widget.herokuapp.com/badge/npm/fastify-peekaboo/1.3.0/badge.svg)

fastify plugin for memoize responses by expressive settings.

## Purpose

Use arbitrary cache to serve responses from previous elaboration, matching them by request and response.

- [fastify-peekaboo](#fastify-peekaboo)
  - [Purpose](#purpose)
  - [Installing](#installing)
    - [Quick start](#quick-start)
  - [Storage and dataset](#storage-and-dataset)
    - [Upgrade from v.1 to v.2](#upgrade-from-v1-to-v2)
  - [Settings](#settings)
    - [settings](#settings-1)
      - [settings.rules](#settingsrules)
      - [settings.mode](#settingsmode)
      - [settings.storage](#settingsstorage)
      - [settings.expire](#settingsexpire)
      - [settings.xheader](#settingsxheader)
      - [settings.noinfo](#settingsnoinfo)
    - [Log](#log)
  - [Documentation](#documentation)
  - [Changelog](#changelog)
  - [Roadmap](#roadmap)
    - [v. 2.3](#v-23)
    - [v. 2.4](#v-24)
    - [v. 2.5](#v-25)
  - [License](#license)

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
  mode: 'memoize',
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

## Storage and dataset

`dataset` feature allow to have different caches and switching between them.

Example: create a new dataset and use it

```js
fastify.post('/dataset', async (request, response) => {
  try {
    const id = await _fastify.peekaboo.dataset.create(request.body.name)
    await _fastify.peekaboo.dataset.set(id)
    response.send({ id })
  } catch (error) {
    response.send({ message: error.message })
  }
})
```

See [documentation](./doc/README.md#dataset) for full information and examples.

### Upgrade from v.1 to v.2

If you are using `memory` storage, cache is volatile, no action is required.  
In order to keep cache using `fs` storage, move dir and content from `peekaboo` to `peekaboo/default`; otherwise, a new empty cache is created.

Update API calls for `set.mode` and `get.mode` to `mode.set` and `mode.get`.

## Settings

Cache works by matching request and response.  
If `request` (and `response`) match, `response` is saved by hashing the matching `request`.  
The first rule that match the request is choosen.

### settings

```js
{
  rules: MatchingRule[],
  mode: Mode,
  storage: Storage,
  expire: number,
  xheader: boolean,
  noinfo: boolean
}
```

#### settings.rules

The set of rules that indicate to use cache or not for requests.  
See [matching system](./doc/README.md#matching-system) for details.

#### settings.mode

type: `string`, one of `memoize`, `off`, `collector`, `stock`
default: `memoize`

It set how the cache system behave:

- **memoize**  
  on each request, if the relative cache entry is present serve that, or elaborate and cache on response if it doesn't
- **collector**  
  cache entries but don't use cache for serve responses
- **stock**  
  serve only responses from cache or `404` if the cache entry does not exists
- **off**  
  the plugin is not used at all

You can get/set also at runtime by

```js
fastify.get('/cache/mode', async (request, response) => {
  response.send({ mode: fastify.peekaboo.mode.get() })
})
fastify.get('/cache/mode/:mode', async (request, response) => {
  fastify.peekaboo.mode.set(request.params.mode)
  response.send('set mode ' + request.params.mode)
})
```

#### settings.storage

- `mode`  
  type: `string`  [ `memory` | `fs` ]  
  default: `memory`  
  - `memory` (default) cache use runtime memory
  - `fs` use filesystem, need also `config.path`

- storage `config`  
  type: `object`  

  for `file` mode
  - `path`  
    type: `string`  
    dir path where files will be stored

  ```js
  {
    mode: 'memory'
  }

  {
    mode: 'fs',
    config: { path: '/tmp/peekaboo' }
  }
  ```

See [storage documentation](./doc/README.md#storage) for further information about to access and manipulate entries.

#### settings.expire

type: `number`  
default: `86400000` // 1 day  
cache expiration in ms, optional.

#### settings.xheader

type: `boolean`  
default: `true`  
add on response header `x-peekaboo` and `x-peekaboo-hash` if response comes from cache.

#### settings.noinfo

type: `boolean`  
default: `false`  
do not store info (matching rule, request) for entries, in order to speed up a little bit in write/read cache and save space; info are needed only for cache manipulation.

### Log

Use server log settings

```js
fastify({ logger: true })
```

## Documentation

See [documentation](./doc/README.md) for further information and examples.

---

## Changelog

- **v. 2.2.0** [ 2020-10-11 ]
  - update matching `function` allow cache based on values, [see notes](./doc/README.md#match-by-function-notes)
  - update documentation
  - update deps

- **v. 2.0.0** [ 2020-09-25 ]
  - add `dataset` feature
  - update `mode` public methods

- **v. 1.3.0** [ 2020-07-25 ]
  - stable version
  - update to `fastify v3`
  - update deps

- **v. 1.2.0-beta** [ 2020-06-18 ] beta  
  - move to `beta` stage
  - fix fs storage persistence
  - add `mode` (memoize, off, collector, stock)
  - add storage access for editing: `get`, `list`, `set`, `rm`, `clear`
  - add `info` in stored entries and `settings.noinfo` to skip that
  - add `x-peekaboo-hash` in xheader

- **v. 1.1.0-alpha** [ 2020-05-14 ] alpha  
  - drop `keyv` storage

- **v. 1.0.0-alpha** [ 2020-05-03 ] alpha  
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

### v. 2.3

- [ ] remove `got` in favor of natvie `http` client
- [ ] `response.rewrite` option
- [ ] `request.rewrite` option
- [ ] postgresql storage
- [ ] redis storage

### v. 2.4

- [ ] doc: real world examples
- [ ] benchmark plugin overhead (autocannon?)
  - [ ] benchmark with different storages
- [ ] support binary request/response (upload, download)
- [ ] test edge cases
  - [ ] querystring array or object
- [ ] preset recipes (example graphql caching)
- [ ] CI

### v. 2.5

- [ ] fine grained settings (storage, expiration, xheader ...) for each rule
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
