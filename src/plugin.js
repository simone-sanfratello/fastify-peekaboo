const plug = require('fastify-plugin')
const package_ = require('../package.json')

function plugin (fastify, options, next) {
  fastify.decorate('peekaboo', () => {
    console.log('peekaboo!')
  })

  next()
}

module.exports = plug(plugin, {
  fastify: package_.devDependencies.fastify,
  name: package_.name
})
