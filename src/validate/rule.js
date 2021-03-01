'use strict'

const superstruct = require('superstruct')
const lib = require('../lib')

const s = superstruct.superstruct({
  types: {
    '*': v => v === '*',
    matchingStringObject: object => {
      for (const key in object) {
        try {
          matchingString(object[key])
        } catch (error) {
          return false
        }
      }
      return true
    }
  }
})

const methods = Object.values(lib.METHOD)
methods.shift() // trim '*'

const matchingNumber = s.union(['boolean', 'number', 'regexp', 'function'])
const matchingString = s.union(['boolean', 'string', 'regexp', 'function'])
const matchingList = s.union(['boolean', s.enum(methods), s.array([s.enum(methods)]), '*', 'regexp', 'function'])
const matchingObject = s.union(['boolean', 'function', 'matchingStringObject'])

const rule = s({
  request: {
    methods: matchingList,
    route: matchingString,
    headers: s.optional(matchingObject),
    body: s.optional(matchingObject),
    query: s.optional(matchingObject)
  },
  response: s.optional({
    status: s.optional(matchingNumber),
    headers: s.optional(matchingObject),
    body: s.optional(matchingObject)
  })
})

module.exports = rule
