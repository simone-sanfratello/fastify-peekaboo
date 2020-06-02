const tap = require('tap')
const fastify = require('fastify')
const fs = require('fs')
const path = require('path')
const got = require('got')
const helper = require('../helper')

const peekaboo = require('../../src/plugin')

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
      response.send(fs.createReadStream(path.join(__dirname, '../samples/image.png')))
    })

    try {
      await helper.fastify.start(_fastify)

      let url = helper.fastify.url(_fastify, '/google')
      /*
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail('should use cache, but it doesnt')
      }

      url = helper.fastify.url(_fastify, '/remote/image')
      await helper.request({ url })
      _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail('should use cache, but it doesnt')
      }
*/
      url = helper.fastify.url(_fastify, '/local/image')
      await helper.request({ url })
      _response = await helper.request({ url })
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
