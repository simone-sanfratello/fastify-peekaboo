const tap = require('tap')
const fastify = require('fastify')
const helper = require('./helper')

const peekaboo = require('../src/plugin')

tap.test('peekaboo matching by request query (*)',
  async (_test) => {
    _test.plan(3)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            route: '/query',
            query: {
              q: '1'
            }
          }
        }]
      })

    _fastify.all('/query', async (request, response) => {
      response.send(JSON.stringify(request.query))
    })

    try {
      await helper.fastify.start(_fastify)

      let path = '/query?q=1'
      await helper.request({ path })
      let _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"q":"1"}')

      path = '/query?q=0&p=0'
      await helper.request({ path })
      _response = await helper.request({ path })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
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
        rules: [{
          request: {
            route: '/query',
            query: { param: true }
          }
        }]
      })

    _fastify.all('/query', async (request, response) => {
      response.send(JSON.stringify(request.query))
    })

    try {
      await helper.fastify.start(_fastify)

      let path = '/query?param=value1'
      await helper.request({ path })
      let _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"param":"value1"}')

      path = '/query?param=value2'
      await helper.request({ path })
      _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"param":"value2"}')

      await helper.fastify.stop(_fastify)
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
        rules: [{
          request: {
            route: '/query',
            // any page and offset but no filter
            query: {
              page: true,
              offset: true,
              filter: false
            }
          }
        }]
      })

    _fastify.all('/query', async (request, response) => {
      response.send(JSON.stringify(request.query))
    })

    try {
      await helper.fastify.start(_fastify)

      let path = '/query?page=0'
      await helper.request({ path })
      let _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      path = '/query?page=1&offset=2'
      await helper.request({ path })
      _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"page":"1","offset":"2"}')

      path = '/query?page=1&offset=2&filter=value'
      await helper.request({ path })
      _response = await helper.request({ path })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
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
        rules: [{
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
      await helper.fastify.start(_fastify)

      let path = '/query?page=0'
      await helper.request({ path })
      let _response = await helper.request({ path })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      path = '/query?page=1&offset=2'
      await helper.request({ path })
      _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      path = '/query?page=2&offset=2&filter=value'
      await helper.request({ path })
      _response = await helper.request({ path })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      path = '/query?offset=0'
      await helper.request({ path })
      _response = await helper.request({ path })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
