var { through } = require('mississippi')
var { jsonrpc2, testType } = require('./utils')
var { InternalError } = require('./errors')

module.exports = function doitServer (api, json) {
  if (!Array.isArray(json)) return _doit(api, json)

  var i = 0
  var results = []
  var src = through.obj(function (json, _, done) {
    results.push(json)
    done()
  }, function (done) {
    this.push(results)
    done()
  })
  src.on('pipe', s => (i += 1))
  src.on('unpipe', s => ((i -= 1) || src.end()))
  json.map(json => _doit(api, json))
    .forEach(s => s.pipe(src, { end: false }))
  return src
}

function _doit (api, json) {
  var src = through.obj()
  if (json != null && json.error != null) {
    process.nextTick(() => src.end(json))
    return src
  }
  api[json.method](json.params, (error, result) => {
    error != null
      ? src.end(jsonrpcError(error, json))
      : src.end(jsonrpcResponse(result, json))
  })
  return src
}

function jsonrpcResponse (result, request) {
  return jsonrpc2.response(
    result,
    { request, id: cid(request) }
  )
}

function jsonrpcError (error, json) {
  return jsonrpc2.error(
    InternalError(json, error),
    { id: cid(json) }
  )
}

function cid (json) {
  return testType(json, 'id', [ 'string', 'number', 'null' ])
    ? json.id
    : null
}
