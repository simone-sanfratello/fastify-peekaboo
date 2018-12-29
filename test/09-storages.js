const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo storage (file)',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          methods: '*',
          route: '/'
        }],
        expire: 30 * 1000,
        storage: {
          mode: 'fs',
          config: {
            path: '/tmp/peekaboo'
          }
        }
      })

    _fastify.all('/', async (request, response) => {
      response.send('response')
    })

    await _fastify.listen(0)
    _fastify.server.unref()
    const _port = _fastify.server.address().port

    try {
      let _url = `http://127.0.0.1:${_port}/`
      await got(_url)
      let _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'response')
    } catch (error) {
      _test.threw(error)
    }

    _fastify.close()
    _test.pass()
  })

tap.test('peekaboo storage (redis)',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          methods: '*',
          route: '/'
        }],
        expire: 5 * 60 * 1000,
        storage: {
          mode: 'redis',
          config: {
            connection: 'redis://localhost:6379'
          }
        }
      })

    _fastify.all('/', async (request, response) => {
      response.send('response')
    })

    await _fastify.listen(0)
    _fastify.server.unref()
    const _port = _fastify.server.address().port

    try {
      let _url = `http://127.0.0.1:${_port}/`
      let _response = await got(_url)
      _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'response')
    } catch (error) {
      _test.threw(error)
    }

    _fastify.close()
    _test.pass()
  })
