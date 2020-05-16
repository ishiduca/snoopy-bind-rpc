module.exports = {
  sum (params, cb) {
    cb(null, params.reduce((a, b) => (a + b), 0))
  },
  upper (params, cb) {
    var paraph = params
      .reduce((a, s) => a.concat(s.split(' ')), [])
      .filter(Boolean)
      .map(s => (s.slice(0, 1).toUpperCase() + s.slice(1)))
      .join(' ')

    !paraph
      ? cb(new Error('not found valid data'))
      : cb(null, paraph)
  }
}
