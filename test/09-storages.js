const tap = require('tap')
const fastify = require('fastify')
const helper = require('./helper')

const peekaboo = require('../src/plugin')

tap.test('peekaboo storage (file)',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          methods: '*',
          route: true
        }],
        expire: 10 * 1000,
        storage: {
          mode: 'fs',
          config: {
            path: '/tmp/peekaboo'
          }
        }
      })

    _fastify.all('/', async (request, response) => {
      response.send('response')
    })

    await helper.fastify.start(_fastify)

    try {
      const path = '/'
      await helper.request({ path })
      const _response = await helper.request({ path })
      if (_response.headers['x-peekaboo'] !== 'from-cache-fs') {
        _test.fail('should use cache fs, but it doesnt')
      }
      _test.equal(_response.body, 'response')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })
