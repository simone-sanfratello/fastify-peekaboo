const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by request headers (string)',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: '/',
            headers: 'referer'
          }
        }]
      })

    _fastify.get('/', async (request, response) => {
      response.send(request.headers.referer)
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/`
      let _headers = { referer: 'testing' }
      await got(_url, { headers: _headers })
      let _response = await got(_url, { headers: _headers })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'testing')

      _url = `http://127.0.0.1:${_port}/`
      _headers = { host: 'localhost' }
      await got(_url, { headers: _headers })
      _response = await got(_url, { headers: _headers })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by request headers (array)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: '/',
            headers: ['authorization', 'cookie']
          }
        }]
      })

    _fastify.get('/', async (request, response) => {
      if (request.headers.authorization) {
        response.send('ok ' + request.headers.cookie)
      } else {
        response.send('error')
      }
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/`
      let headers = { authorization: 'token#1', cookie: 'sid=abcde13564' }
      await got(_url, { headers })
      let _response = await got(_url, { headers })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      _url = `http://127.0.0.1:${_port}/`
      await got(_url, { headers })
      _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'error')

      _url = `http://127.0.0.1:${_port}/`
      headers = { authorization: 'token#2', cookie: 'sid=987654abcde' }
      await got(_url, { headers })
      _response = await got(_url, { headers })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'ok ' + headers.cookie)

      await _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by request headers (function)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: '/',
            headers: function (headers) {
              if (headers['accept-language'] && headers['accept-language'].indexOf('it') !== -1) {
                return ['accept-language']
              }
            }
          }
        }]
      })

    _fastify.all('/', async (request, response) => {
      if (request.headers['accept-language'] && request.headers['accept-language'].indexOf('it') !== -1) {
        response.send('ciao')
      } else {
        response.send('hello')
      }
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/`
      await got(_url)
      let _response = await got(_url)
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'hello')

      _url = `http://127.0.0.1:${_port}/`
      const headers = { 'accept-language': 'en-US,en;q=0.9,it;q=0.8,la;q=0.7' }
      await got(_url, { headers })
      _response = await got(_url, { headers })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'ciao')

      await _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
