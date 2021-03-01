'use strict'

const tap = require('tap')
const fs = require('fs-extra')
const fastify = require('fastify')
const helper = require('../helper')

const peekaboo = require('../../src/plugin')

const rules = [{
  request: {
    methods: true,
    route: true
  }
}]

const storages = {
  memory: {
    xheader: true,
    expire: 30 * 1000,
    rules,
    storage: {
      mode: 'memory'
    }
  },

  fs: {
    xheader: true,
    expire: 30 * 1000,
    rules,
    storage: {
      mode: 'fs',
      config: {
        path: '/tmp/peekaboo-dataset'
      }
    }
  }
}

for (const storage in storages) {
  tap.test(`dataset create (${storage})`, async (_test) => {
    _test.plan(3)

    await fs.remove('/tmp/peekaboo-dataset')

    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.all('/dataset/create/:name', async (request, response) => {
      const id = await _fastify.peekaboo.dataset.create(request.params.name)
      response.send({
        new: id,
        get: await _fastify.peekaboo.dataset.get()
      })
    })

    await helper.fastify.start(_fastify)

    try {
      const _response = await helper.request({ url: helper.fastify.url(_fastify, '/dataset/create/parallel') })
      const content = JSON.parse(_response.body)
      _test.true(helper.assert.isId(content.new))
      _test.true(content.get.entries)
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

  tap.test(`dataset create (${storage}) error empty name`, async (_test) => {
    _test.plan(2)

    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.all('/dataset/create/:name', async (request, response) => {
      try {
        await _fastify.peekaboo.dataset.create(request.params.name)
        response.send({})
      } catch (error) {
        response.send({ message: error.message })
      }
    })

    await helper.fastify.start(_fastify)

    try {
      const _response = await helper.request({ url: helper.fastify.url(_fastify, '/dataset/create/') })
      const content = JSON.parse(_response.body)
      _test.equal(content.message, 'INVALID_DATASET_NAME')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

  tap.test(`dataset update (${storage})`, async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.get('/dataset/get', async (request, response) => {
      response.send(await _fastify.peekaboo.dataset.get())
    })

    _fastify.all('/dataset/update/:id/:name', async (request, response) => {
      await _fastify.peekaboo.dataset.update(request.params.id, request.params.name)
      response.send(await _fastify.peekaboo.dataset.get())
    })

    await helper.fastify.start(_fastify)

    try {
      let _response = await helper.request({ url: helper.fastify.url(_fastify, '/dataset/get') })
      let _content = JSON.parse(_response.body)
      const id = _content.default
      _response = await helper.request({ url: helper.fastify.url(_fastify, `/dataset/update/${id}/parallelo`) })
      _content = JSON.parse(_response.body)
      _test.equal(_content.entries[id], 'parallelo')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

  tap.test(`dataset update (${storage}) error empty name`, async (_test) => {
    _test.plan(2)

    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.all('/dataset/update/empty', async (request, response) => {
      try {
        const id = (await _fastify.peekaboo.dataset.get()).default
        await _fastify.peekaboo.dataset.update(id, '')
        response.send({})
      } catch (error) {
        response.send({ message: error.message })
      }
    })

    await helper.fastify.start(_fastify)

    try {
      const _response = await helper.request({ url: helper.fastify.url(_fastify, '/dataset/update/empty') })
      const _content = JSON.parse(_response.body)
      _test.equal(_content.message, 'INVALID_DATASET_NAME')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

  tap.test(`dataset update (${storage}) invalid id`, async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.all('/update/invalid', async (request, response) => {
      try {
        await _fastify.peekaboo.dataset.update('not-an-id', 'name')
        response.send({})
      } catch (error) {
        response.send({ message: error.message })
      }
    })

    await helper.fastify.start(_fastify)

    try {
      const _response = await helper.request({ url: helper.fastify.url(_fastify, '/update/invalid') })
      const _content = JSON.parse(_response.body)
      _test.equal(_content.message, 'INVALID_DATASET_ID')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

  tap.test(`dataset remove (${storage})`, async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.all('/dataset/create/:name', async (request, response) => {
      response.send({ id: await _fastify.peekaboo.dataset.create(request.params.name) })
    })
    _fastify.all('/dataset/remove/:id', async (request, response) => {
      await _fastify.peekaboo.dataset.remove(request.params.id)
      response.send(await _fastify.peekaboo.dataset.get())
    })

    await helper.fastify.start(_fastify)

    try {
      let _response = await helper.request({ url: helper.fastify.url(_fastify, '/dataset/create/ciao') })
      let _content = JSON.parse(_response.body)
      const id = _content.id
      _response = await helper.request({ url: helper.fastify.url(_fastify, `/dataset/remove/${id}`) })
      _content = JSON.parse(_response.body)
      _test.equal(_content.entries[id], undefined)
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

  tap.test(`dataset remove (${storage}) invalid id`, async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.all('/remove/invalid', async (request, response) => {
      try {
        await _fastify.peekaboo.dataset.remove('not-an-id')
        response.send({})
      } catch (error) {
        response.send({ message: error.message })
      }
    })

    await helper.fastify.start(_fastify)

    try {
      const _response = await helper.request({ url: helper.fastify.url(_fastify, '/remove/invalid') })
      const _content = JSON.parse(_response.body)
      _test.equal(_content.message, 'INVALID_DATASET_ID')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

  tap.test(`dataset remove (${storage}) current`, async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.all('/remove/current', async (request, response) => {
      try {
        const id = await _fastify.peekaboo.dataset.create('new')
        await _fastify.peekaboo.dataset.set(id)
        await _fastify.peekaboo.dataset.remove(id)
        response.send({})
      } catch (error) {
        response.send({ message: error.message })
      }
    })

    await helper.fastify.start(_fastify)

    try {
      const _response = await helper.request({ url: helper.fastify.url(_fastify, '/remove/current') })
      const _content = JSON.parse(_response.body)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

  tap.test(`dataset remove (${storage}) error removing default dataset`, async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.all('/remove/default', async (request, response) => {
      const dataset = await _fastify.peekaboo.dataset.get()
      try {
        await _fastify.peekaboo.dataset.remove(dataset.default)
        response.send(dataset)
      } catch (error) {
        response.send({ message: error.message })
      }
    })

    await helper.fastify.start(_fastify)

    try {
      const _response = await helper.request({ url: helper.fastify.url(_fastify, '/remove/default') })
      const _content = JSON.parse(_response.body)
      _test.equal(_content.message, 'INVALID_DATASET_OPERATION_CANT_REMOVE_DEFAULT')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

  tap.test(`dataset set (${storage})`, async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.get('/dataset/get', async (request, response) => {
      response.send(await _fastify.peekaboo.dataset.get())
    })

    _fastify.all('/dataset/set/:id', async (request, response) => {
      await _fastify.peekaboo.dataset.set(request.params.id)
      response.send({ current: _fastify.peekaboo.dataset.current() })
    })

    await helper.fastify.start(_fastify)

    try {
      let _response = await helper.request({ url: helper.fastify.url(_fastify, '/dataset/get') })
      let _content = JSON.parse(_response.body)

      const id = _content.default
      _response = await helper.request({ url: helper.fastify.url(_fastify, `/dataset/set/${id}`) })
      _content = JSON.parse(_response.body)

      _test.equal(_content.current, id)
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

  tap.test(`dataset set (${storage}) invalid id`, async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify.register(peekaboo, storages[storage])

    _fastify.all('/set/invalid', async (request, response) => {
      try {
        await _fastify.peekaboo.dataset.set('not-an-id')
        response.send()
      } catch (error) {
        response.send({ message: error.message })
      }
    })

    await helper.fastify.start(_fastify)

    try {
      const _response = await helper.request({ url: helper.fastify.url(_fastify, '/set/invalid') })
      const _content = JSON.parse(_response.body)
      _test.equal(_content.message, 'INVALID_DATASET_CURRENT_VALUE')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

}

// @todo fs load from last stop
// @todo fs use cache from brand new
