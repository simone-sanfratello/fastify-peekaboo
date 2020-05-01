const tap = require('tap')
const fastify = require('fastify')
const helper = require('./helper')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by request body (*)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: true,
            body: true
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
      await helper.fastify.start(_fastify)

      let path = '/update'
      await helper.request({ method: 'post', path, json: { id: 11 } })
      let _response = await helper.request({ method: 'post', path, json: { id: 11 } })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(JSON.parse(_response.body), { error: false, id: 11 })

      path = '/update'
      await helper.request({ method: 'post', path, json: { id: 11, name: 'Alice' } })
      _response = await helper.request({ method: 'post', path, json: { id: 11, name: 'Alice' } })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(JSON.parse(_response.body), { error: false, name: 'Alice' })

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by request body (string)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: '/update/user',
            body: /id/m
          }
        }]
      })

    _fastify.post('/update/user', async (request, response) => {
      response.send({ error: false, id: request.body.id })
    })

    try {
      await helper.fastify.start(_fastify)

      let path = '/update/user'
      await helper.request({ method: 'post', path, json: { id: 9 } })
      let _response = await helper.request({ method: 'post', path, json: { id: 9 } })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(JSON.parse(_response.body), { error: false, id: 9 })

      path = '/update/user'
      await helper.request({ method: 'post', path, json: { name: 'Alice' } })
      _response = await helper.request({ method: 'post', path, json: { name: 'Alice' } })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(JSON.parse(_response.body), { error: false })

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by request body (array)',
  async (_test) => {
    _test.plan(4)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: '/update/user',
            body: { id: true, name: true }
          }
        }]
      })

    _fastify.post('/update/user', async (request, response) => {
      response.send({ error: false, ...request.body })
    })

    try {
      await helper.fastify.start(_fastify)

      let path = '/update/user'
      await helper.request({ method: 'post', path, json: { id: 9 } })
      let _response = await helper.request({ method: 'post', path, json: { id: 9 } })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(JSON.parse(_response.body), { error: false, id: 9 })

      path = '/update/user'
      await helper.request({ method: 'post', path, json: { name: 'Alice' } })
      _response = await helper.request({ method: 'post', path, json: { name: 'Alice' } })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(JSON.parse(_response.body), { error: false, name: 'Alice' })

      path = '/update/user'
      await helper.request({ method: 'post', path, json: { id: 8, name: 'Mimì' } })
      _response = await helper.request({ method: 'post', path, json: { id: 8, name: 'Mimì' } })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(JSON.parse(_response.body), { error: false, id: 8, name: 'Mimì' })

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by request body (function)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: 'put',
            route: '/update/user',
            body: function (body) {
              return !!body
            }
          }
        }]
      })

    _fastify.put('/update/user', async (request, response) => {
      response.send({ ok: 1 })
      /*
        fastify bug
          response
          .type('text/plain')
          .send('ok')
      */
    })

    try {
      await helper.fastify.start(_fastify)

      const path = '/update/user'
      await helper.request({ method: 'put', path })
      let _response = await helper.request({ method: 'put', path })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.request({ method: 'put', path, json: { name: 'Alice' } })
      _response = await helper.request({ method: 'put', path, json: { name: 'Alice' } })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
