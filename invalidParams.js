var valid = require('is-my-json-valid')
var { jsonrpc2, testType } = require('./utils')
var { InvalidParamsError } = require('./errors')

module.exports = function methodNotFound (schemas, json) {
  return (
    Array.isArray(json)
      ? json.map(json => test(schemas[json.method], json))
      : test(schemas[json.method], json)
  )
}

function test (schema, json) {
  if (json != null && json.error != null) return json

  var v = valid(schema)
  if (v(json.params, { verbose: true })) return json
  return jsonrpc2.error(
    InvalidParamsError(json, v.errors), { id: cid(json) }
  )
}

function cid (json) {
  return testType(json, 'id', [ 'number', 'string', 'null' ])
    ? json.id
    : null
}
