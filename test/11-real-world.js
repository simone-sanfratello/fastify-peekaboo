const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo with streams',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            methods: '*',
            route: '/'
          }
        }]
      })

    _fastify.get('/google', async (request, response) => {
      response.send((await got('https://www.google.com')).body)
      // response.send(got.stream('https://www.google.com'))
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/google`
      await got(_url)
      let _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail('not using cache')
      }

      _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
