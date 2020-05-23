const superstruct = require('superstruct')
const rule = require('./rule')
const storage = require('./storage')
const default_ = require(('../../settings/default'))

const s = superstruct.struct

const settings = s({
  rules: [rule],
  storage: s.optional(storage),
  expire: 'number',
  xheader: 'boolean',
  noinfo: 'boolean?',
  mode: s.enum(['lazy', 'off', 'collector', 'warehouse']),
  log: 'boolean'
}, default_)

module.exports = settings
