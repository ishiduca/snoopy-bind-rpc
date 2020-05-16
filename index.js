var url = require('url')
var safe = require('json-stringify-safe')
var { pipe, through } = require('mississippi')
var routing = require('@ishiduca/routing')
var bodyParse = require('./bodyParse')
var invalidRequest = require('./invalidRequest')
var methodNotFound = require('./methodNotFound')
var invalidParams = require('./invalidParams')
var doit = require('./doit')
var { compose } = require('./utils')
var hasOwnProperty = Object.prototype.hasOwnProperty

module.exports = function bindRPC (prefix, { api, schemas }) {
  for (var method in schemas) {
    if (hasOwnProperty.apply(schemas, [ method ])) {
      if (!api[method]) {
        throw new Error(`method - [${method}] not found in api`)
      }
    }
  }

  var router = routing()
  var POST = 'POST'
  router.define(prefix, POST, (req, res) => {
    pipe(
      req,
      bodyParse(json => compose(
        invalidRequest,
        methodNotFound.bind(null, schemas),
        invalidParams.bind(null, schemas),
        doit.bind(null, api)
      )(json)),
      through.obj((json, _, done) => {
        var str = safe(json)
        var size = Buffer.byteLength(str)
        res.setHeader('content-type', 'application/json')
        res.setHeader('content-length', size)
        done(null, str)
      }),
      res,
      error => error && console.error('error')
    )
  })

  return next => (req, res) => {
    var u = url.parse(req.url)
    var m = router.match(u.pathname)
    if (m == null || m.values[0] !== req.method) return next(req, res)
    m.values[1](req, res)
  }
}
