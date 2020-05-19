var xtend = require('xtend')

function addToJSON (error) {
  error.toJSON || (error.toJSON = function () {
    return {
      message: this.message,
      code: this.code || -32600,
      data: this.data
    }
  })
  return error
}

function cid () {
  return Date.now() + Math.random()
}

function jsonrpc2 (...args) {
  var jsonrpc = '2.0'
  var id = null
  return xtend({ jsonrpc, id }, ...args)
}
jsonrpc2.request = (method, params, ...args) => (
  jsonrpc2({ method, params, id: cid() }, ...args)
)
jsonrpc2.response = (result, ...args) => (
  jsonrpc2({ result }, ...args)
)
jsonrpc2.error = (error, ...args) => (
  jsonrpc2({ error }, ...args)
)

function isNull (x) { return x === null }
function isBoolean (x) { return typeof x === 'boolean' }
function isString (x) { return typeof x === 'string' }
function isNumber (x) { return typeof x === 'number' && isFinite(x) }
function isArray (x) { return Array.isArray(x) }
function isObject (x) { return typeof x === 'object' && !isArray(x) && !isNull(x) }

function testType (target, prop, types) {
  var TYPES = {
    'null': isNull,
    'boolean': isBoolean,
    'number': isNumber,
    'string': isString,
    'array': isArray,
    'object': isObject
  }
  return (
    target == null
      ? !1
      : !![].concat(types).some(type => TYPES[type](target[prop]))
  )
}

function compose (...fs) {
  return fs.reduce((a, b) => x => b(a(x)), x => (x))
}

module.exports = {
  addToJSON,
  jsonrpc2,
  testType,
  compose
}
