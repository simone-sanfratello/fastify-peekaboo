const tap = require('tap')
const fastify = require('fastify')
const helper = require('../helper')

const peekaboo = require('../../src/plugin')

tap.test('peekaboo invalid settings #1', async (_test) => {
  _test.plan(1)

  const _fastify = fastify()
  try {
    _fastify.register(peekaboo, {
      rules: [{
        request: {
          methods: true,
          route: true,
          headers: {
            a: 99
          }
        }
      }]
    })
    await helper.fastify.start(_fastify)
    await helper.fastify.stop(_fastify)
    _test.fail()
  } catch (error) {
    await helper.fastify.stop(_fastify)
    _test.pass()
  }
})

tap.test('peekaboo invalid settings #2', async (_test) => {
  _test.plan(1)

  const _fastify = fastify()
  try {
    _fastify.register(peekaboo, {
      rules: [{
        request: {
          methods: -1,
          route: '/home'
        }
      }]
    })
    await helper.fastify.start(_fastify)
    await helper.fastify.stop(_fastify)
    _test.fail()
  } catch (error) {
    await helper.fastify.stop(_fastify)
    _test.pass()
  }
})
