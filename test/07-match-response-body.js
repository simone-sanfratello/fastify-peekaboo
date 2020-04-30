const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by response body (object)',
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
            body: {
              user: 'Alice'
            }
          }
        }]
      })

    _fastify.get('/user/:id', async (request, response) => {
      response.send({ user: 'Alice' })
    })

    _fastify.get('/admin', async (request, response) => {
      response.code(403).send('ERROR_INVALID_AUTH')
    })

    await _fastify.listen(0)
    _fastify.server.unref()
    const _port = _fastify.server.address().port

    try {
      const _url = `http://127.0.0.1:${_port}/user/1012`
      await got(_url)
      const _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail('not response from cache')
      }
    } catch (error) {
      _test.threw(error)
    }

    try {
      const _url = `http://127.0.0.1:${_port}/admin`
      await got(_url)
    } catch (error) {}

    const _url = `http://127.0.0.1:${_port}/admin`
    const _response = await got(_url, { throwHttpErrors: false })
    if (_response.headers['x-peekaboo']) {
      _test.fail('response from cache')
    }

    await _fastify.close()
    _test.pass()
  })

tap.test('peekaboo matching by response body (function)',
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
            body: function (body) {
              try {
                return body.indexOf('Alice') !== -1
              } catch (error) {}
            }
          }
        }]
      })

    _fastify.get('/user/:id', async (request, response) => {
      response.send({ user: 'Alice' })
    })

    _fastify.get('/admin', async (request, response) => {
      response.send('ERROR')
    })

    _fastify.get('/content', async (request, response) => {
      response.send(' ... Alice ...')
    })

    await _fastify.listen(0)
    _fastify.server.unref()
    const _port = _fastify.server.address().port

    try {
      const _url = `http://127.0.0.1:${_port}/content`
      await got(_url)
      const _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail('not response from cache')
      }
    } catch (error) {
      _test.threw(error)
    }

    try {
      const _url = `http://127.0.0.1:${_port}/user/1012`
      await got(_url)
      const _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail('response from cache')
      }
    } catch (error) {
      _test.threw(error)
    }

    try {
      const _url = `http://127.0.0.1:${_port}/admin`
      await got(_url)
      const _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail('response from cache')
      }
    } catch (error) {
      _test.threw(error)
    }

    await _fastify.close()
    _test.pass()
  })
