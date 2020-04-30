const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by request methods (*)',
  async (_test) => {
    _test.plan(4)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            methods: '*'
          }
        }]
      })

    _fastify.all('/resource', async (request, response) => {
      response.send('in ' + request.req.method)
    })

    await _fastify.listen(0)
    _fastify.server.unref()
    const _port = _fastify.server.address().port

    try {
      const _url = `http://127.0.0.1:${_port}/resource`
      await got.post(_url)
      const _response = await got.post(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'in POST')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const _url = `http://127.0.0.1:${_port}/resource`
      await got.delete(_url)
      const _response = await got.delete(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'in DELETE')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const _url = `http://127.0.0.1:${_port}/not-matching`
      await got(_url)
    } catch (error) {
      _test.pass()
    }

    await _fastify.close()
    _test.pass()
  })

tap.test('peekaboo matching by request methods (string)',
  async (_test) => {
    _test.plan(4)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
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

    await _fastify.listen(0)
    _fastify.server.unref()
    const _port = _fastify.server.address().port

    try {
      const _url = `http://127.0.0.1:${_port}/resource`
      await got.put(_url)
      const _response = await got.put(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'in PUT')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const _url = `http://127.0.0.1:${_port}/resource`
      await got.delete(_url)
      const _response = await got.delete(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'in DELETE')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const _url = `http://127.0.0.1:${_port}/resource`
      await got(_url)
    } catch (error) {
      _test.pass()
    }

    await _fastify.close()
    _test.pass()
  })
