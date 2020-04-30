const default_ = {
  match: {
    request: {
      methods: 'get'
    },
    response: {
      status: 200,
      headers: {
      }
    }
  },
  storage: {
    mode: 'memory',
    config: {}
  },
  expire: 86400000, // 1 day in ms
  xheader: true,
  log: false
}

module.exports = default_
