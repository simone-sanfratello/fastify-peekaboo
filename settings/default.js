const default_ = {
  match: {
    request: {
      methods: 'get'
    },
    response: {
      headers: {
        status: 200
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
