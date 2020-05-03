const tap = require('tap')
const matcher = require('../../src/matcher')

tap.test('matcher.string', (test) => {
  const _cases = [
    { input: { value: '200', match: /^2/ }, output: true },
    { input: { value: 'hello', match: null }, output: false }
  ]
  test.plan(_cases.length)
  for (const _case of _cases) {
    const { input, output } = _case
    test.equal(matcher.string(input.value, input.match), output)
  }
})

tap.test('matcher.number', (test) => {
  const _cases = [
    { input: { value: 200, match: /^2/ }, output: true },
    { input: { value: undefined, match: /^2/ }, output: false },
    { input: { value: 200, match: true }, output: true },
    { input: { value: 300, match: (value) => value < 300 }, output: false },
    { input: { value: 200, match: false }, output: false },
    { input: { value: 200, match: null }, output: false }
  ]
  test.plan(_cases.length)
  for (const _case of _cases) {
    const { input, output } = _case
    test.equal(matcher.number(input.value, input.match), output)
  }
})

tap.test('matcher.list', (test) => {
  const _cases = [
    { input: { value: 'get', match: false }, output: false },
    { input: { value: 'get', match: (value) => value === 'post' }, output: false }
  ]
  test.plan(_cases.length)
  for (const _case of _cases) {
    const { input, output } = _case
    test.equal(matcher.list(input.value, input.match), output)
  }
})

tap.test('matcher.object', (test) => {
  const _cases = [
    { input: { value: { a: 'b' }, match: false }, output: false }
  ]
  test.plan(_cases.length)
  for (const _case of _cases) {
    const { input, output } = _case
    test.equal(matcher.object(input.object, input.match), output)
  }
})
