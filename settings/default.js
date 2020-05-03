const default_ = {
  rules: [{
    request: {
      methods: true,
      route: true
    },
    response: {
      status: (code) => code > 199 && code < 300
    }
  }],
  storage: { mode: 'memory' },
  expire: 86400000, // 1 day in ms
  xheader: true,
  log: false
}

module.exports = default_
