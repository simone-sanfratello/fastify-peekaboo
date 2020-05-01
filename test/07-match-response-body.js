const tap = require('tap')
const fastify = require('fastify')
const helper = require('./helper')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by response body (object)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: true
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

    await helper.fastify.start(_fastify)

    try {
      const path = '/user/1012'
      await helper.request({ path })
      const _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail('not response from cache')
      }
    } catch (error) {
      _test.threw(error)
    }

    try {
      const path = '/admin'
      await helper.request({ path })
    } catch (error) {}

    const path = '/admin'
    const _response = await helper.request(path, { throwHttpErrors: false })
    if (_response.headers['x-peekaboo']) {
      _test.fail('response from cache')
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

tap.test('peekaboo matching by response body (function)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: true
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

    await helper.fastify.start(_fastify)

    try {
      const path = '/content'
      await helper.request({ path })
      const _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail('not response from cache')
      }
    } catch (error) {
      _test.threw(error)
    }

    try {
      const path = '/user/1012'
      await helper.request({ path })
      const _response = await helper.request({ path })
      if (_response.headers['x-peekaboo']) {
        _test.fail('response from cache')
      }
    } catch (error) {
      _test.threw(error)
    }

    try {
      const path = '/admin'
      await helper.request({ path })
      const _response = await helper.request({ path })
      if (_response.headers['x-peekaboo']) {
        _test.fail('response from cache')
      }
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })
