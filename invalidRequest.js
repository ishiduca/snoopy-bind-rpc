var valid = require('is-my-json-valid')
var schema = require('./jsonrpc2-request')
var { jsonrpc2, testType } = require('./utils')
var { InvalidRequestError } = require('./errors')

module.exports = function invalidRequest (json) {
  return (
    Array.isArray(json)
      ? json.map(test)
      : test(json)
  )
}

function test (json) {
  var v = valid(schema)
  if (json != null && json.error != null) return json
  if (v(json, { verbose: true })) return json
  return jsonrpc2.error(
    InvalidRequestError(json, v.errors), { id: cid(json) }
  )
}

function cid (json) {
  return testType(json, 'id', [ 'string', 'number', 'null' ])
    ? json.id
    : null
}
