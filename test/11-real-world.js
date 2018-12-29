const tap = require('tap')
const fastify = require('fastify')
const got = require('got')
const fs = require('fs')
const path = require('path')

const peekaboo = require('../src/plugin')

tap.test('peekaboo with streams',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify({ logger: { level: 'trace' } })
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            methods: '*',
            route: '/'
          }
        }]
      })

    _fastify.get('/google', async (request, response) => {
      response.send(got.stream('https://www.google.com'))
    })

    _fastify.get('/remote/image', async (request, response) => {
      response.send(got.stream('https://braceslab.com/img/header.jpg'))
    })

    _fastify.get('/local/image', async (request, response) => {
      response.send(fs.createReadStream(path.join(__dirname, 'samples/image.png')))
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port

      let _url = `http://127.0.0.1:${_port}/google`
      await got(_url)
      let _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail('should use cache, but it doesnt')
      }

      _url = `http://127.0.0.1:${_port}/remote/image`
      await got(_url)
      _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail('should use cache, but it doesnt')
      }

      _url = `http://127.0.0.1:${_port}/local/image`
      await got(_url)
      _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail('should use cache, but it doesnt')
      }

      _fastify.close()
      _test.pass()
    } catch (error) {
      console.error(error)
      _test.threw(error)
    }
  })
