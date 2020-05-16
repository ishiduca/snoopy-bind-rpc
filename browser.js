var window = require('global/window')
var path = require('path')
var { pipeline, through } = require('mississippi')
var invalidRequest = require('./invalidRequest')
var methodNotFound = require('./methodNotFound')
var invalidParams = require('./invalidParams')
var doit = require('./doit-browser')
var { compose, jsonrpc2, testType } = require('./utils')
var hasOwnProperty = Object.prototype.hasOwnProperty

module.exports = function bindRPC (prefix, { api, schemas }) {
  for (var method in schemas) {
    if (hasOwnProperty.apply(schemas, [ method ])) {
      if (!api[method]) {
        throw new Error(`method - [${method}] not found in api`)
      }
    }
  }

  var loc = window.location
  var protocol = loc.protocol
  var host = loc.host
  var uri = [ protocol, '//', host, path.resolve('/', prefix) ].join('')

  function x (request) {
    return compose(
      invalidRequest,
      methodNotFound.bind(null, schemas),
      invalidParams.bind(null, schemas)
    )(
      jsonrpc2.request(
        Object.keys(request)[0],
        Object.values(request)[0]
      )
    )
  }

  function _batch (requests) {
    if (testType({ requests }, 'requests', 'object')) {
      requests = Object.keys(requests).map(m => ({ [m]: requests[m] }))
    }
    return requests.map(x)
  }

  var batch = compose(_batch, doit.bind(null, uri))

  Object.keys(api).forEach(method => {
    batch[method] = params => (
      pipeline.obj(
        doit(uri, x({ [method]: params })),
        through.obj((response, _, done) => {
          if (response.error != null) return done(response.error)
          done(null, response.result)
        })
      )
    )
  })

  return batch
}
