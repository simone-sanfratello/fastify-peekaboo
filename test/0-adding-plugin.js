const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo plugin is loaded',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    await _fastify
      .register(peekaboo)
      .ready()
    _test.pass(_fastify.peekaboo)
  })

tap.test('peekaboo plugin is working (default settings)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify.register(peekaboo, {
      '/home': { method: 'all' }
    })

    const _message = 'hey there'
    _fastify.get('/home', async (request, response) => {
      response.send(_message)
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port
      const _url = `http://127.0.0.1:${_port}/home`
      const _response = await got(_url)
      if (!_response.body === _message) {
        _test.fail()
      }
      const _again = await got(_url)
      if (!_again.body === _message && _again.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
