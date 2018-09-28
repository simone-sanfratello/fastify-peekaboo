const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const cases = require('./sample/cases')
const peekaboo = require('../src/plugin')

const _init = async function (routes) {
  const _server = fastify()
  for (const _route of routes) {
    _server[_route.method](_route.url, async (request, response) => {
      response.send(_route.output)
    })
  }
  await _server.listen(0)
  _server.server.unref()
  return _server
}

const _clear = async function (server) {
  await server.close()
}

const _set = async function (server, settings) {
  return tap.test(`set caching rule - 
    match: ${JSON.stringify(settings.match)}
    method: ${settings.method}
    storage: ${JSON.stringify(settings.storage)}`,
  async (_test) => {
    _test.plan(1)

    await server
      .register(peekaboo, settings)
      .ready()

    _test.pass()
  })
}

const _get = async function (server, request, settings) {
  return tap.test(`get caching rule - 
    match: ${JSON.stringify(settings.match)}
    method: ${settings.method}
    storage: ${JSON.stringify(settings.storage)}`,
  async (_test) => {
    _test.plan(1)

    try {
      const _port = server.server.address().port
      const _host = `http://127.0.0.1:${_port}`
      await got(_host + request.url)
      const _response = await got(request.url, {
        baseUrl: _host,
        method: request.method,
        header: request.header,
        body: request.body
      })
      // @todo check response?
      _test.pass()
    } catch (error) {
      if (error.statusCode === request.output.code) {
        _test.pass()
        return
      }
      _test.threw(error)
    }
  })
}

const _unit = async function (settings, request) {
  const _server = await _init(cases.routes)
  await _set(_server, settings)
  await _get(_server, request, settings)
  await _clear(_server)
}

;(async () => {
  for (const method in peekaboo.METHOD) {
    for (const match of cases.match) {
      for (const storage of cases.storages) {
        for (const _request of cases.requests) {
          const _settings = {
            match,
            method,
            storage
          }
          _unit(_settings, _request)
        }
      }
    }
  }
})()

// @todo
// - serve cached on matching requests
// - serve not-cached on not-matching request
// - expire responses, request expired, serve new, cache again
