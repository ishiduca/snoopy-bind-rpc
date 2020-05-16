var { jsonrpc2, testType } = require('./utils')
var { MethodNotFoundError } = require('./errors')

module.exports = function MethodNotFound (schemas, json) {
  return (
    Array.isArray(json)
      ? json.map(test.bind(null, schemas))
      : test(schemas, json)
  )
}

function test (schemas, json) {
  if (json != null && json.error != null) return json
  if (schemas[json.method] != null) return json
  return jsonrpc2.error(
    MethodNotFoundError(json), { id: cid(json) }
  )
}

function cid (json) {
  return testType(json, 'id', [ 'string', 'number', 'null' ])
    ? json.id
    : null
}
