'use strict'

const superstruct = require('superstruct')
const lib = require('../lib')

const s = superstruct.struct

const storage = s({
  mode: s.optional(s.enum(Object.values(lib.STORAGE))),
  config: s.optional(s({ path: 'string?' }))
})

module.exports = storage
