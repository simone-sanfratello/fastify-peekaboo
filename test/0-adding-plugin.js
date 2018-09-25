const tap = require('tap')
const fastify = require('fastify')

const plugin = require('../src/plugin')

tap.test('peekaboo plugin added to fastify', 
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    await _fastify
      .register(plugin)
      .ready()
    _test.ok(_fastify.peekaboo)
  })

/*
tap.test('peekaboo is usable', (t) => {
  t.plan(1)
  const _fastify = fastify()
  _fastify.register(plugin)

  _fastify.get('/one', (req, reply) => {
    _fastify.cache.set('one', {one: true}, 100, (err) => {
      if (err) return reply.send(err)
      reply.redirect('/two')
    })
  })

  _fastify.get('/two', (req, reply) => {
    _fastify.cache.get('one', (err, obj) => {
      if (err) t.threw(err)
      t.deepEqual(obj.item, {one: true})
      reply.send()
    })
  })

  _fastify.listen(0, (err) => {
    if (err) t.threw(err)
    _fastify.server.unref()
    const portNum = _fastify.server.address().port
    const address = `http://127.0.0.1:${portNum}/one`
    http
      .get(address, (res) => {
        if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
          http.get(`http://127.0.0.1:${portNum}${res.headers.location}`, (res) => {}).on('error', t.threw)
        }
      })
      .on('error', t.threw)
  })
})

tap.test('etags get stored in cache', (t) => {
  t.plan(1)
  const _fastify = fastify()
  _fastify.register(plugin)

  _fastify.get('/one', (req, reply) => {
    reply
      .etag('123456')
      .send({hello: 'world'})
  })

  _fastify.listen(0, (err) => {
    if (err) t.threw(err)
    _fastify.server.unref()
    const portNum = _fastify.server.address().port
    const address = `http://127.0.0.1:${portNum}/one`
    http
      .get(address, (res) => {
        const opts = {
          host: '127.0.0.1',
          port: portNum,
          path: '/one',
          headers: {
            'if-none-match': '123456'
          }
        }
        http
          .get(opts, (res) => {
            t.is(res.statusCode, 304)
          })
          .on('error', t.threw)
      })
      .on('error', t.threw)
  })
})

tap.test('etag cache life is customizable', (t) => {
  t.plan(1)
  const _fastify = fastify()
  _fastify.register(plugin)

  _fastify.get('/one', function (req, reply) {
    reply
      .etag('123456', 50)
      .send({hello: 'world'})
  })

  _fastify.listen(0, (err) => {
    if (err) t.threw(err)
    _fastify.server.unref()
    const portNum = _fastify.server.address().port
    const address = `http://127.0.0.1:${portNum}/one`
    http
      .get(address, (res) => {
        const opts = {
          host: '127.0.0.1',
          port: portNum,
          path: '/one',
          headers: {
            'if-none-match': '123456'
          }
        }
        setTimeout(() => {
          http
            .get(opts, (res) => {
              t.is(res.statusCode, 200)
            })
            .on('error', t.threw)
        }, 150)
      })
      .on('error', t.threw)
  })
})
*/
