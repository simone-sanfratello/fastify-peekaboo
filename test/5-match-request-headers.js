const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by request headers (@todo)',
  async (_test) => {
    _test.plan(1)
    _test.pass()
  })
