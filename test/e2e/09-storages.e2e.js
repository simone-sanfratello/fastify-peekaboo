'use strict'

const tap = require('tap')
const fastify = require('fastify')
const helper = require('../helper')

const peekaboo = require('../../src/plugin')

const rules = [{
  request: {
    methods: true,
    route: /^\/(?!clear).*$/
  }
}]

const storages = {
  default: {
    xheader: 'from-cache-memory',
    settings: {
      xheader: true,
      expire: 30 * 1000,
      rules
    }
  },

  memory: {
    xheader: 'from-cache-memory',
    settings: {
      xheader: true,
      expire: 30 * 1000,
      rules,
      storage: {
        mode: 'memory'
      }
    }
  },

  fs: {
    xheader: 'from-cache-fs',
    settings: {
      xheader: true,
      expire: 30 * 1000,
      rules,
      storage: {
        mode: 'fs',
        config: {
          path: '/tmp/peekaboo'
        }
      }
    }
  }
}

for (const name in storages) {
  const storage = storages[name]

  tap.test('peekaboo get from storage (' + name + ')',
    async (_test) => {
      _test.plan(2)
      const _fastify = fastify()
      _fastify
        .register(peekaboo, storage.settings)

      _fastify.all('/', async (request, response) => {
        response.send('response')
      })

      await helper.fastify.start(_fastify)

      try {
        const url = helper.fastify.url(_fastify, '/')
        await helper.request({ url })
        const _response = await helper.request({ url })
        if (_response.headers['x-peekaboo'] !== storage.xheader) {
          _test.fail(name + ' should use cache, but it doesnt')
        }
        _test.equal(_response.body, 'response')
      } catch (error) {
        _test.threw(error)
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    })

  tap.test('peekaboo do not get from storage because it is expired (' + name + ')',
    async (_test) => {
      _test.plan(2)
      const _fastify = fastify()
      _fastify
        .register(peekaboo, { ...storage.settings, expire: 10 })

      _fastify.all('/', async (request, response) => {
        response.send('response')
      })
      _fastify.all('/clear', async (request, response) => {
        await request.peekaboo.storage.clear()
        response.send('clear')
      })

      await helper.fastify.start(_fastify)

      try {
        const url = helper.fastify.url(_fastify, '/')
        await helper.request({ url: helper.fastify.url(_fastify, '/clear') })
        await helper.request({ url })
        await helper.sleep(200)
        const _response = await helper.request({ url })
        if (_response.headers['x-peekaboo']) {
          _test.fail(name + ' should not use cache, but it does')
        }
        _test.equal(_response.body, 'response')
      } catch (error) {
        _test.threw(error)
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    })

  tap.test('peekaboo get list of cached entries (' + name + ')',
    async (_test) => {
      _test.plan(3)
      const _fastify = fastify()
      _fastify
        .register(peekaboo, storage.settings)

      _fastify.all('/', async (request, response) => {
        response.send('index')
      })
      _fastify.all('/one', async (request, response) => {
        response.send('one')
      })
      _fastify.all('/two', async (request, response) => {
        response.send('two')
      })
      _fastify.all('/clear', async (request, response) => {
        await request.peekaboo.storage.clear()
        response.send('clear')
      })
      _fastify.all('/list', async (request, response) => {
        response.send(await request.peekaboo.storage.list())
      })

      await helper.fastify.start(_fastify)

      try {
        await helper.request({ url: helper.fastify.url(_fastify, '/one') })
        await helper.request({ url: helper.fastify.url(_fastify, '/two') })
        await helper.request({ url: helper.fastify.url(_fastify, '/clear') })
        await helper.request({ url: helper.fastify.url(_fastify, '/') })
        const _response = await helper.request({ url: helper.fastify.url(_fastify, '/list') })
        const _body = JSON.parse(_response.body)
        _test.equal(_body.length, 1)
        _test.match(_body[0], /^[a-f0-9]{64}$/)
      } catch (error) {
        _test.threw(error)
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    })

  tap.test('peekaboo remove a cached entry by hash (' + name + ')',
    async (_test) => {
      _test.plan(2)
      const _fastify = fastify()

      _fastify
        .register(peekaboo, { ...storage.settings, xheader: false })

      _fastify.all('/one', async (request, response) => {
        response.send('one')
      })
      _fastify.all('/two', async (request, response) => {
        response.send('two')
      })
      _fastify.all('/rm/:hash', async (request, response) => {
        await request.peekaboo.storage.rm(request.params.hash)
        response.send('rm')
      })
      _fastify.all('/list', async (request, response) => {
        response.send(await request.peekaboo.storage.list())
      })

      await helper.fastify.start(_fastify)

      try {
        await helper.request({ url: helper.fastify.url(_fastify, '/one') })
        await helper.request({ url: helper.fastify.url(_fastify, '/two') })
        let _response = await helper.request({ url: helper.fastify.url(_fastify, '/list') })
        const _list = JSON.parse(_response.body)
        _response = await helper.request({ url: helper.fastify.url(_fastify, '/rm/' + _list[0]) })
        _test.equal(_response.statusCode, 200)
      } catch (error) {
        _test.threw(error)
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    })

  tap.test('peekaboo set a cached item by hash (' + name + ')',
    async (_test) => {
      _test.plan(2)
      const _fastify = fastify()
      _fastify
        .register(peekaboo, storage.settings)

      _fastify.all('/one', async (request, response) => {
        response.send('one')
      })
      _fastify.all('/two', async (request, response) => {
        response.send('two')
      })
      _fastify.all('/set/:hash', async (request, response) => {
        await request.peekaboo.storage.set(request.params.hash, { expire: 3000 })
        response.send('set')
      })
      _fastify.all('/list', async (request, response) => {
        response.send(await request.peekaboo.storage.list())
      })

      await helper.fastify.start(_fastify)

      try {
        await helper.request({ url: helper.fastify.url(_fastify, '/one') })
        await helper.request({ url: helper.fastify.url(_fastify, '/two?three=3') })
        let _response = await helper.request({ url: helper.fastify.url(_fastify, '/list') })
        const _list = JSON.parse(_response.body)
        _response = await helper.request({ url: helper.fastify.url(_fastify, '/set/' + _list[0]) })
        _test.equal(_response.statusCode, 200)
      } catch (error) {
        _test.threw(error)
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    })
}
