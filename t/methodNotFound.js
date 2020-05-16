var test = require('tape')
var safe = require('json-stringify-safe')
var methodNotFound = require('methodNotFound')
var schemas = require('./schemas')

test('(jsonrpc2.request || jsonrpc2.error) = methodNotFound(schemas, data)', t => {
  t.test('success', t => {
    var data = {
      jsonrpc: '2.0',
      id: 1,
      method: 'sum',
      params: [ 1 ]
    }
    t.is(methodNotFound(schemas, data), data)
    t.end()
  })

  t.test('success # passed jsonrpc2 error', t => {
    var data = {
      jsonrpc: '2.0',
      id: null,
      error: {
        message: 'Parse error',
        code: -32700,
        data: {
          _: '{hoge',
          errors: [ { name: 'Error', message: 'can not JSON.parse' } ]
        }
      }
    }
    t.is(methodNotFound(schemas, data), data)
    t.end()
  })

  t.test('fail', t => {
    var data = {
      jsonrpc: '2.0',
      id: 3,
      method: 'add',
      params: [ 1 ]
    }
    var expected = {
      jsonrpc: '2.0',
      id: 3,
      error: {
        message: 'Method not found',
        code: -32601,
        data: {
          _: data
        }
      }
    }
    var result = JSON.parse(safe(methodNotFound(schemas, data)))
    t.deepEqual(result, expected)
    t.end()
  })

  t.test('batch', t => {
    var dataSuccess = {
      jsonrpc: '2.0',
      id: 'success',
      method: 'sum',
      params: [ 1 ]
    }
    var dataRpcError = {
      jsonrpc: '2.0',
      id: 'error',
      error: {
        message: 'Invalid Request',
        code: -32600,
        data: {
          _: { jsonrpc: '2.0', id: 'error', method: 'foo', params: 'bar' },
          errors: [
            { field: 'data.params', message: 'is the wrong type' }
          ]
        }
      }
    }
    var dataFail = {
      jsonrpc: '2.0',
      id: 'fail',
      method: 'fly',
      params: [ 'bee' ]
    }
    var expectedFail = {
      jsonrpc: '2.0',
      id: 'fail',
      error: {
        message: 'Method not found',
        code: -32601,
        data: {
          _: dataFail
        }
      }
    }
    var expected = [ dataRpcError, expectedFail, dataSuccess ]
    var data = [ dataRpcError, dataFail, dataSuccess ]
    var result = JSON.parse(safe(methodNotFound(schemas, data)))
    t.deepEqual(result, expected)
    t.end()
  })

  t.end()
})
