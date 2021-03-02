'use strict'

const tap = require('tap')
const fastify = require('fastify')
const helper = require('../helper')

const peekaboo = require('../../src/plugin')

tap.test('peekaboo matching by request query (*)',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: ['get', 'put'],
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

      let url = helper.fastify.url(_fastify, '/query?q=1')
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"q":"1"}')

      url = helper.fastify.url(_fastify, '/query?q=0&p=0')
      await helper.request({ url })
      _response = await helper.request({ url })
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
            methods: '*',
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

      let url = helper.fastify.url(_fastify, '/query?param=value1')
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"param":"value1"}')

      url = helper.fastify.url(_fastify, '/query?param=value2')
      await helper.request({ url })
      _response = await helper.request({ url })
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

tap.test('peekaboo matching by request query (any and never)',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: '/query',
            // any page and offset but no filter
            query: {
              page: true,
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

      let url = helper.fastify.url(_fastify, '/query?page=0')
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/query?page=1&offset=2')
      await helper.request({ url })
      _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, '{"page":"1","offset":"2"}')

      url = helper.fastify.url(_fastify, '/query?page=1&offset=2&filter=value')
      await helper.request({ url })
      _response = await helper.request({ url })
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
            methods: '*',
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

      let url = helper.fastify.url(_fastify, '/query?page=0')
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/query?page=1&offset=2')
      await helper.request({ url })
      _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/query?page=2&offset=2&filter=value')
      await helper.request({ url })
      _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/query?offset=0')
      await helper.request({ url })
      _response = await helper.request({ url })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo partial matching by request query (function)',
  async (_test) => {
    _test.plan(4)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: '/query',
            query: function (query) {
              return query.page && parseInt(query.page) > 0
                ? query.page
                : false
            }
          }
        }]
      })

    _fastify.all('/query', async (request, response) => {
      response.send(request.query)
    })

    try {
      await helper.fastify.start(_fastify)

      let url = helper.fastify.url(_fastify, '/query?page=0')
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/query?page=0')
      await helper.request({ url })
      _response = await helper.request({ url })
      _test.deepEqual(JSON.parse(_response.body), { page: 0 })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/query?page=1&offset=2')
      await helper.request({ url })
      _response = await helper.request({ url })
      _test.deepEqual(JSON.parse(_response.body), { page: 1, offset: 2 })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/query?nopage=2&filter=value')
      await helper.request({ url })
      _response = await helper.request({ url })
      _test.deepEqual(JSON.parse(_response.body), { nopage: 2, filter: 'value' })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
