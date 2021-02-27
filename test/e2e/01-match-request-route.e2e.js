'use strict'

const tap = require('tap')
const fastify = require('fastify')
const helper = require('../helper')

const peekaboo = require('../../src/plugin')

tap.test('peekaboo matching by request route (string)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: true,
            route: /^\/a\/p/
          }
        }]
      })

    _fastify.all('/a/path/to/:resource', async (request, response) => {
      response.send('here you are ' + request.params.resource)
    })

    await helper.fastify.start(_fastify)

    try {
      const url = helper.fastify.url(_fastify, '/a/path/to/something?q=1')
      await helper.request({ url })
      const _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'here you are something')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const url = helper.fastify.url(_fastify, '/not-matching')
      await helper.request({ url })
    } catch (error) {
      _test.pass()
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

tap.test('peekaboo matching by request route (RegExp)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: true,
            route: /users|guest/
          }
        }]
      })

    _fastify.get('/path/to/users', async (request, response) => {
      response.send('users')
    })

    await helper.fastify.start(_fastify)

    try {
      const url = helper.fastify.url(_fastify, '/path/to/users')
      await helper.request({ url })
      const _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'users')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const url = helper.fastify.url(_fastify, '/not-matching')
      await helper.request({ url })
    } catch (error) {
      _test.pass()
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

tap.test('peekaboo matching by request route (function)',
  async (_test) => {
    _test.plan(4)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: true,
            route: function (route) {
              return route.indexOf('user/10') !== -1 && route.indexOf('user/20') === -1
            }
          }
        }]
      })

    _fastify.get('/path/to/user/:id', async (request, response) => {
      response.send('user.id=' + request.params.id)
    })

    await helper.fastify.start(_fastify)

    try {
      let path = '/path/to/user/10'
      let url = helper.fastify.url(_fastify, path)
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'user.id=10')

      path = '/path/to/user/20'
      url = helper.fastify.url(_fastify, path)
      await helper.request({ url })
      _response = await helper.request({ url })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'user.id=20')
    } catch (error) {
      _test.threw(error)
    }

    try {
      const path = '/not-matching'
      const url = helper.fastify.url(_fastify, path)
      await helper.request({ url })
    } catch (error) {
      _test.pass()
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })
