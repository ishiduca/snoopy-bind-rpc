module.exports = {
  sum,
  average
}

function sum (params, cb) {
  var amount = params.reduce((a, b) => (a + b), 0)
  cb(null, amount)
}

function average (params, cb) {
  sum(params, (error, amount) => {
    if (error) return cb(error)
    cb(null, (amount / params.length))
  })
}
