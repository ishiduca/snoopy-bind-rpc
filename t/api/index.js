module.exports = {
  sum (params, cb) {
    cb(null, params.reduce((a, b) => (a + b), 0))
  },
  upper ({ text }, cb) {
    if (/buu/.test(text)) {
      cb(new Error('Buu error'))
      return
    }
    cb(null, text.toUpperCase())
  }
}
