const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by request route (string)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: '/a/p'
          }
        }]
      })

    _fastify.all('/a/path/to/:resource', async (request, response) => {
      response.send('here you are ' + request.params.resource)
    })

    await _fastify.listen(0)
    _fastify.server.unref()
    const _port = _fastify.server.address().port

    try {
      const _url = `http://127.0.0.1:${_port}/a/path/to/something?q=1`
      await got(_url)
      const _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'here you are something')
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

tap.test('peekaboo matching by request route (RegExp)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: /user|guest/
          }
        }]
      })

    _fastify.get('/path/to/users', async (request, response) => {
      response.send('users')
    })

    await _fastify.listen(0)
    _fastify.server.unref()
    const _port = _fastify.server.address().port

    try {
      const _url = `http://127.0.0.1:${_port}/path/to/users`
      await got(_url)
      const _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'users')
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

tap.test('peekaboo matching by request route (function)',
  async (_test) => {
    _test.plan(4)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: function (route) {
              return route.indexOf('user/10') !== -1 && route.indexOf('user/20') === -1
            }
          }
        }]
      })

    _fastify.get('/path/to/user/:id', async (request, response) => {
      response.send('user.id=' + request.params.id)
    })

    await _fastify.listen(0)
    _fastify.server.unref()
    const _port = _fastify.server.address().port

    try {
      let _url = `http://127.0.0.1:${_port}/path/to/user/10`
      await got(_url)
      let _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'user.id=10')

      _url = `http://127.0.0.1:${_port}/path/to/user/20`
      await got(_url)
      _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'user.id=20')
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
