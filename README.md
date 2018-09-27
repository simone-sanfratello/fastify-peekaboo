# fastify-peekaboo

[![NPM Version](http://img.shields.io/npm/v/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![NPM Downloads](https://img.shields.io/npm/dm/fastify-peekaboo.svg?style=flat)](https://www.npmjs.org/package/fastify-peekaboo)
[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/braceslab/fastify-peekaboo.svg?branch=master)](https://travis-ci.org/braceslab/fastify-peekaboo)

fastify plugin response caching - **work in progress**

## Purpose

${purpose}

## Installing

````bash
npm i fastify-peekaboo
````

### Quick start

```js
${basic-example}

```

## API

${api}

### options

options.default
any matching request will use this options if there isn't a specific rule for 

## Documentation

See [documentation](./doc/README.md) for further informations.

---

## Changelog

${changelog}

---

## TODO

- [ ] storages
  - [ ] file
  - [ ] redis
  - [ ] postgresql
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
- [ ] use other kyev supported storage (mongo, mysql, sqlite)

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
