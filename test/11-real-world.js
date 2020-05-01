const tap = require('tap')
const fastify = require('fastify')
const fs = require('fs')
const path = require('path')
const got = require('got')
const helper = require('./helper')

const peekaboo = require('../src/plugin')

tap.test('peekaboo with streams',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify({ logger: { level: 'trace' } })
    _fastify
      .register(peekaboo)

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
      await helper.fastify.start(_fastify)

      let path = '/google'
      await helper.request({ path })
      let _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail('should use cache, but it doesnt')
      }

      path = '/remote/image'
      await helper.request({ path })
      _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail('should use cache, but it doesnt')
      }

      path = '/local/image'
      await helper.request({ path })
      _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail('should use cache, but it doesnt')
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      console.error(error)
      _test.threw(error)
    }
  })
