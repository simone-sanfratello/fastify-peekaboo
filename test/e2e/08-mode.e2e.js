'use strict'

const tap = require('tap')
const fastify = require('fastify')
const helper = require('../helper')

const peekaboo = require('../../src/plugin')

for (const mode of ['memoize', 'off', 'collector', 'stock']) {
  tap.test('peekaboo change mode ' + mode,
    async (_test) => {
      _test.plan(2)
      const _fastify = fastify()
      _fastify.register(peekaboo)

      _fastify.all('/set/:mode', async (request, response) => {
        _fastify.peekaboo.mode.set(request.params.mode)
        response.send(_fastify.peekaboo.mode.get())
      })

      await helper.fastify.start(_fastify)

      try {
        const _response = await helper.request({ url: helper.fastify.url(_fastify, '/set/' + mode) })
        _test.equal(_response.body, mode)
      } catch (error) {
        _test.threw(error)
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    })
}

tap.test('peekaboo works in mode off',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, { mode: 'off' })

    _fastify.all('/something', async (request, response) => {
      response.send('a thing')
    })

    await helper.fastify.start(_fastify)

    try {
      const url = helper.fastify.url(_fastify, '/something')
      await helper.request({ url })
      const _response = await helper.request({ url })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'a thing')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

tap.test('peekaboo works in mode collector',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, { mode: 'collector' })

    _fastify.all('/something', async (request, response) => {
      response.send('a thing')
    })

    await helper.fastify.start(_fastify)

    try {
      const url = helper.fastify.url(_fastify, '/something')
      await helper.request({ url })
      const _response = await helper.request({ url })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'a thing')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

tap.test('peekaboo works in mode stock',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, { mode: 'stock' })

    _fastify.all('/something', async (request, response) => {
      response.send('a thing')
    })

    await helper.fastify.start(_fastify)

    try {
      const url = helper.fastify.url(_fastify, '/something')
      await helper.request({ url })
    } catch (error) {
      _test.equal(error.response.statusCode, 404)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

tap.test('peekaboo change to invalid mode and nothing change',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, { xheader: false, noinfo: true })

    _fastify.all('/set/:mode', async (request, response) => {
      _fastify.peekaboo.mode.set(request.params.mode)
      response.send(_fastify.peekaboo.mode.get())
    })

    await helper.fastify.start(_fastify)

    try {
      const _response = await helper.request({ url: helper.fastify.url(_fastify, '/set/unknown') })
      _test.equal(_response.body, 'memoize')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })
