const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

// use tollo? varation: cache-by, method, storage

tap.test('cache request: cache-by: url, method: all',
  async (_test) => {
    _test.plan(1)

    // ...

    _test.pass()
  })

tap.test('cache request: cache-by: url, method: get',
  async (_test) => {
    _test.plan(1)

    // ...

    _test.pass()
  })

tap.test('cache request: cache-by: url, method: get',
  async (_test) => {
    _test.plan(1)

    // ...

    _test.pass()
  })

tap.test('cache request: cache-by: querystring, method: get',
  async (_test) => {
    _test.plan(1)

    // ...

    _test.pass()
  })

tap.test('cache request: cache-by: cookies, method: get',
  async (_test) => {
    _test.plan(1)

    // ...

    _test.pass()
  })

tap.test('cache request: cache-by: body, method: post',
  async (_test) => {
    _test.plan(1)

    // ...

    _test.pass()
  })

tap.test('cache request: cache-by: header[auth-bearer], method: get',
  async (_test) => {
    _test.plan(1)

    // ...

    _test.pass()
  })

tap.test('cache request: cache-by: custom mix#1, method: get',
  async (_test) => {
    _test.plan(1)

    // ...

    _test.pass()
  })

tap.test('cache request: cache-by: custom mix#2, method: get',
  async (_test) => {
    _test.plan(1)

    // ...

    _test.pass()
  })

tap.test('cache request: cache-by: custom mix#3, method: get',
  async (_test) => {
    _test.plan(1)

    // ...

    _test.pass()
  })

// ... serve cached on matching requests
// ... serve not-cached on not-matching request

// ... expire responses, request expired, serve new, cache again
