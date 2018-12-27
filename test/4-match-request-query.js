const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by request query (*)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: '/query',
            query: '*'
          }
        }]
      })

    _fastify.all('/query', async (request, response) => {
      response.send(JSON.stringify(request.query))
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/query?q=1`
      await got(_url)
      let _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"q":"1"}')

      _url = `http://127.0.0.1:${_port}/query?q=1&p=0`
      await got(_url)
      _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"q":"1","p":"0"}')

      _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by request query (string)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: '/query',
            query: 'param'
          }
        }]
      })

    _fastify.all('/query', async (request, response) => {
      response.send(JSON.stringify(request.query))
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/query?param=value1`
      await got(_url)
      let _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"param":"value1"}')

      _url = `http://127.0.0.1:${_port}/query?param=value2`
      await got(_url)
      _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"param":"value2"}')

      _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by request query (array)',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: '/query',
            query: ['page', 'offset']
          }
        }]
      })

    _fastify.all('/query', async (request, response) => {
      response.send(JSON.stringify(request.query))
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/query?page=0`
      await got(_url)
      let _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      _url = `http://127.0.0.1:${_port}/query?page=1&offset=2`
      await got(_url)
      _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"page":"1","offset":"2"}')

      _url = `http://127.0.0.1:${_port}/query?page=1&offset=2&filter=value`
      await got(_url)
      _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by request query (function)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: '/query',
            query: function (query) {
              return parseInt(query.page) > 0
            }
          }
        }]
      })

    _fastify.all('/query', async (request, response) => {
      response.send(JSON.stringify(request.query))
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/query?page=0`
      await got(_url)
      let _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      _url = `http://127.0.0.1:${_port}/query?page=1&offset=2`
      await got(_url)
      _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      _url = `http://127.0.0.1:${_port}/query?page=2&offset=2&filter=value`
      await got(_url)
      _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      _url = `http://127.0.0.1:${_port}/query?offset=0`
      await got(_url)
      _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
