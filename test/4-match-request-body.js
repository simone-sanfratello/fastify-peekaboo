const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by request body (*)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            methods: '*',
            route: '/',
            body: '*'
          }
        }]
      })

    _fastify.post('/update', async (request, response) => {
      if (!request.body.name) {
        response.send({ error: false, id: request.body.id })
      } else {
        response.send({ error: false, name: request.body.name })
      }
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/update`
      await got.post(_url, { body: { id: 11 }, json: true })
      let _response = await got.post(_url, { body: { id: 11 }, json: true })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(_response.body, { error: false, id: 11 })

      _url = `http://127.0.0.1:${_port}/update`
      await got.post(_url, { body: { id: 11, name: 'Alice' }, json: true })
      _response = await got.post(_url, { body: { id: 11, name: 'Alice' }, json: true })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(_response.body, { error: false, name: 'Alice' })

      _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
