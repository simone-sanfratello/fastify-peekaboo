const tap = require('tap')

const peekaboo = require('../src/plugin')
const helper = require('./helper')

tap.test('peekaboo match by custom rule',
  async (_test) => {
    _test.plan(1)

    const _fastify = helper.init(peekaboo, {
      xheader: true,
      match: {
        [peekaboo.MATCH.CUSTOM]: (request) => {
          return true
        }
      }
    })

    _fastify.get('/home', async (request, response) => {
      response.send('hey there')
    })

    try {
      const _response = await helper.request(_fastify, {
        url: '/home',
        method: 'get'
      })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
    } catch (error) {
      _test.threw(error)
    }

    _fastify.close()
    _test.pass()
  })

  /*
tap.test('peekaboo match by method, url and querystring',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify.register(peekaboo, {
      xheader: true,
      match: {
        [peekaboo.MATCH.METHOD]: [peekaboo.METHOD.GET],
        [peekaboo.MATCH.URL]: '/home'
      }
    })

    _fastify.get('/home', async (request, response) => {
      response.send('hey there')
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port
      const _url = `http://127.0.0.1:${_port}/home`
      await got(_url)
      const _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
*/