var test = require('tape')
var safe = require('json-stringify-safe')
var schemas = require('./schemas')
var invalidParams = require('invalidParams')
var methodNotFound = require('methodNotFound')

test('jsonrpc2.request || jsonrpc2.error) = invalidParams(schemas, json)', t => {
  t.test('success', t => {
    var data = {
      jsonrpc: '2.0',
      id: 1,
      method: 'upper',
      params: { text: 'foo' }
    }
    var expected = data
    var result = invalidParams(schemas, data)
    t.is(result, expected)
    t.end()
  })

  t.test('success # passed jsonrpc2 error', t => {
    var _data = {
      jsonrpc: '2.0',
      id: 2,
      method: 'lower',
      params: { text: 'foo' }
    }
    var data = methodNotFound(schemas, _data)
    var expected = {
      jsonrpc: '2.0',
      id: 2,
      error: {
        message: 'Method not found',
        code: -32601,
        data: { _: _data }
      }
    }
    var result = invalidParams(schemas, data)
    t.deepEqual(JSON.parse(safe(result)), expected)
    t.end()
  })

  t.test('fail', t => {
    var data = {
      jsonrpc: '2.0',
      id: 3,
      method: 'upper',
      params: [ 'foo' ]
    }
    var expected = {
      jsonrpc: '2.0',
      id: 3,
      error: {
        message: 'Invalid params',
        code: -32602,
        data: {
          _: data,
          errors: [
            { field: 'data', message: 'is the wrong type' }
          ]
        }
      }
    }
    var result = invalidParams(schemas, data)
    t.deepEqual(JSON.parse(safe(result)), expected)
    t.end()
  })

  t.test('batch', t => {
    var dataSuccess = {
      jsonrpc: '2.0',
      id: 'success',
      method: 'upper',
      params: { text: 'poo' }
    }
    var _dataRpcError = {
      jsonrpc: '2.0',
      id: 'error',
      method: 'lower',
      params: { text: 'HOGE' }
    }
    var dataRpcError = methodNotFound(schemas, _dataRpcError)
    var dataFail = {
      jsonrpc: '2.0',
      id: 'fail',
      method: 'upper',
      params: [ 'bird' ]
    }
    var expectedFail = {
      jsonrpc: '2.0',
      id: 'fail',
      error: {
        message: 'Invalid params',
        code: -32602,
        data: {
          _: dataFail,
          errors: [
            { field: 'data', message: 'is the wrong type' }
          ]
        }
      }
    }
    var data = [
      dataFail,
      dataRpcError,
      dataSuccess
    ]
    var expected = [
      expectedFail,
      dataRpcError,
      dataSuccess
    ]
    var result = invalidParams(schemas, data)
    t.deepEqual(
      JSON.parse(safe(result)),
      JSON.parse(safe(expected))
    )
    t.end()
  })

  t.end()
})
