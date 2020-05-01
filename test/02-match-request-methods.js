const tap = require('tap')
const fastify = require('fastify')
const helper = require('./helper')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by request methods (*)',
  async (_test) => {
    _test.plan(4)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*'
          }
        }]
      })

    _fastify.all('/resource', async (request, response) => {
      response.send('in ' + request.req.method)
    })

    await helper.fastify.start(_fastify)

    try {
      const path = '/resource'
      await helper.request({ method: 'post', path })
      const _response = await helper.request({ method: 'post', path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'in POST')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const path = '/resource'
      await helper.request({ method: 'delete', path })
      const _response = await helper.request({ method: 'delete', path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'in DELETE')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const path = '/not-matching'
      await helper.request({ path })
    } catch (error) {
      _test.pass()
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

tap.test('peekaboo matching by request methods (string)',
  async (_test) => {
    _test.plan(4)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: 'put'
          }
        }]
      })

    _fastify.put('/resource', async (request, response) => {
      response.send('in ' + request.req.method)
    })

    _fastify.delete('/resource', async (request, response) => {
      response.send('in ' + request.req.method)
    })

    await helper.fastify.start(_fastify)

    try {
      const path = '/resource'
      await helper.request({ method: 'put', path })
      const _response = await helper.request({ method: 'put', path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'in PUT')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const path = '/resource'
      await helper.request({ method: 'delete', path })
      const _response = await helper.request({ method: 'delete', path })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'in DELETE')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const path = '/resource'
      await helper.request({ path })
    } catch (error) {
      _test.pass()
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })
