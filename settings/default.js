const default_ = {
  rules: [{
    request: {
      methods: true,
      route: true
    },
    response: {
      status: /^2/
    }
  }],
  storage: {
    mode: 'memory',
    config: {}
  },
  expire: 86400000, // 1 day in ms
  xheader: true,
  log: false
}

module.exports = default_
