'use strict'

const tap = require('tap')
const fastify = require('fastify')
const helper = require('../helper')

const peekaboo = require('../../src/plugin')

tap.test('peekaboo matching by request headers (string)',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            route: '/',
            methods: true,
            headers: { referer: true }
          }
        }]
      })

    _fastify.get('/', async (request, response) => {
      response.send(request.headers.referer)
    })

    try {
      await helper.fastify.start(_fastify)

      let url = helper.fastify.url(_fastify, '/')
      let _headers = { referer: 'testing', empty: '' }
      await helper.request({ url, headers: _headers })
      let _response = await helper.request({ url, headers: _headers })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'testing')

      url = helper.fastify.url(_fastify, '/')
      _headers = { host: 'localhost' }
      await helper.request({ url, headers: _headers })
      _response = await helper.request({ url, headers: _headers })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
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
        rules: [{
          request: {
            route: '/',
            methods: true,
            headers: { authorization: true, cookie: true }
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
      await helper.fastify.start(_fastify)

      let url = helper.fastify.url(_fastify, '/')
      let headers = { authorization: 'token#1', cookie: 'sid=abcde13564' }
      await helper.request({ url, headers })
      let _response = await helper.request({ url, headers })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/')
      await helper.request({ url, headers })
      _response = await helper.request({ url })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'error')

      url = helper.fastify.url(_fastify, '/')
      headers = { authorization: 'token#2', cookie: 'sid=987654abcde' }
      await helper.request({ url, headers })
      _response = await helper.request({ url, headers })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'ok ' + headers.cookie)

      await helper.fastify.stop(_fastify)
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
        rules: [{
          request: {
            route: '/',
            methods: true,
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
      await helper.fastify.start(_fastify)

      let url = helper.fastify.url(_fastify, '/')
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'hello')

      url = helper.fastify.url(_fastify, '/')
      const headers = { 'accept-language': 'en-US,en;q=0.9,it;q=0.8,la;q=0.7' }
      await helper.request({ url, headers })
      _response = await helper.request({ url, headers })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      _test.equal(_response.body, 'ciao')

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })
