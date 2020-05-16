var { through } = require('mississippi')
var jsonist = require('jsonist')
var { jsonrpc2, testType } = require('./utils')
var { clientError } = require('./errors')

module.exports = function doit (uri, json) {
  if (!Array.isArray(json)) {
    return _doit(uri, json, through.obj())
  }

  var i = 0
  var s = []
  var src = through.obj(function (result, _, done) {
    s.push(result)
    done()
  }, function (done) {
    this.push(s)
    done()
  })
  src.on('pipe', s => (i += 1))
  src.on('unpipe', s => (i -= 1) || src.end())
  json.map(json => _doit(uri, json, through.obj()))
    .forEach(s => s.pipe(src, { end: false }))

  return src
}

function _doit (uri, json, src) {
  if (json.error != null) {
    process.nextTick(() => src.end(json))
    return src
  }

  jsonist.post(uri, json, (error, rpcRes) => {
    if (error) {
      src.end(wrapError(json, error))
      return
    }
    if (rpcRes.error != null) {
      src.end(rpcRes)
      return
    }
    src.end(rpcRes)
  })

  return src
}

function wrapError (json, error) {
  return jsonrpc2.error(
    clientError(json, error),
    { id: cid(json) }
  )
}

function cid (json) {
  return testType(json, 'id', [ 'string', 'number', 'null' ])
    ? json.id
    : null
}
