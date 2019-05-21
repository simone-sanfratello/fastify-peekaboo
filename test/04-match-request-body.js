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

      await _fastify.close()
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
        matches: [{
          request: {
            methods: '*',
            route: '/update/user',
            body: 'id'
          }
        }]
      })

    _fastify.post('/update/user', async (request, response) => {
      response.send({ error: false, id: request.body.id })
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/update/user`
      await got.post(_url, { body: { id: 9 }, json: true })
      let _response = await got.post(_url, { body: { id: 9 }, json: true })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(_response.body, { error: false, id: 9 })

      _url = `http://127.0.0.1:${_port}/update/user`
      await got.post(_url, { body: { name: 'Alice' }, json: true })
      _response = await got.post(_url, { body: { name: 'Alice' }, json: true })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(_response.body, { error: false })

      await _fastify.close()
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
        matches: [{
          request: {
            methods: '*',
            route: '/update/user',
            body: ['id', 'name']
          }
        }]
      })

    _fastify.post('/update/user', async (request, response) => {
      response.send({ error: false, ...request.body })
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/update/user`
      await got.post(_url, { body: { id: 9 }, json: true })
      let _response = await got.post(_url, { body: { id: 9 }, json: true })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(_response.body, { error: false, id: 9 })

      _url = `http://127.0.0.1:${_port}/update/user`
      await got.post(_url, { body: { name: 'Alice' }, json: true })
      _response = await got.post(_url, { body: { name: 'Alice' }, json: true })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(_response.body, { error: false, name: 'Alice' })

      _url = `http://127.0.0.1:${_port}/update/user`
      await got.post(_url, { body: { id: 8, name: 'Mimì' }, json: true })
      _response = await got.post(_url, { body: { id: 8, name: 'Mimì' }, json: true })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.same(_response.body, { error: false, id: 8, name: 'Mimì' })

      await _fastify.close()
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
        matches: [{
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
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/update/user`
      await got.put(_url)
      let _response = await got.put(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      _url = `http://127.0.0.1:${_port}/update/user`
      await got.put(_url, { body: { name: 'Alice' }, json: true })
      _response = await got.put(_url, { body: { name: 'Alice' }, json: true })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
