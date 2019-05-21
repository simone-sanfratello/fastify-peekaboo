const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by response headers (object)',
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
          },
          response: {
            headers: {
              status: 201
            }
          }
        }]
      })

    _fastify.get('/200', async (request, response) => {
      response.code(200).send('200')
    })

    _fastify.get('/201', async (request, response) => {
      response.code(201).send('201')
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/200`
      await got(_url)
      let _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      _url = `http://127.0.0.1:${_port}/201`
      await got(_url)
      _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by response headers (function)',
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
          },
          response: {
            headers: function (headers) {
              return !!headers['set-cookie']
            }
          }
        }]
      })

    _fastify.get('/cookie', async (request, response) => {
      response
        .header('set-cookie', 'session=987654abcdeeecafebabe')
        .send('ok')
    })

    _fastify.get('/home', async (request, response) => {
      response.send('home')
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/cookie`
      await got(_url)
      let _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      _url = `http://127.0.0.1:${_port}/home`
      await got(_url)
      _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
