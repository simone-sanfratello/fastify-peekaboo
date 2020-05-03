const superstruct = require('superstruct')
const rule = require('./rule')
const storage = require('./storage')

const s = superstruct.struct

const settings = s({
  rules: [rule],
  storage: s.optional(storage),
  expire: 'number',
  xheader: 'boolean',
  log: 'boolean'
})

module.exports = settings
