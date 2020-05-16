var { addToJSON } = require('./utils')

var codes = {
  'Parse error': -32700,
  'Invalid Request': -32600,
  'Method not found': -32601,
  'Invalid params': -32602,
  'Internal error': -32603,
  'Server error': null
}

function x (error) {
  error.toJSON || (error.toJSON = function () {
    return {
      name: this.name,
      message: this.message
    }
  })
  return error
}

function ParseError (org, _) {
  var error = new Error('Parse error')
  error.code = codes[error.message]
  error.data = {
    _,
    errors: [ x(org) ]
  }
  return addToJSON(error)
}
module.exports.ParseError = ParseError

function InvalidRequestError (_, errors) {
  var error = new Error('Invalid Request')
  error.code = codes[error.message]
  error.data = { _, errors }
  return addToJSON(error)
}
module.exports.InvalidRequestError = InvalidRequestError

function MethodNotFoundError (_) {
  var error = new Error('Method not found')
  error.code = codes[error.message]
  error.data = { _ }
  return addToJSON(error)
}
module.exports.MethodNotFoundError = MethodNotFoundError

function InvalidParamsError (_, errors) {
  var error = new Error('Invalid params')
  error.code = codes[error.message]
  error.data = { _, errors }
  return addToJSON(error)
}
module.exports.InvalidParamsError = InvalidParamsError

function InternalError (_, _error) {
  var error = new Error('Internal error')
  error.code = codes[error.message]
  error.data = { _, errors: [ { name: _error.name, message: _error.message } ] }
  return addToJSON(error)
}
module.exports.InternalError = InternalError

function clientError (_, _error) {
  var error = new Error('xmlhttprequest error')
  error.code = -32000
  error.data = { _, errors: [ _error ] }
  return addToJSON(error)
}
module.exports.clientError = clientError
