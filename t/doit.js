var test = require('tape')
var safe = require('json-stringify-safe')
var { pipe, concat } = require('mississippi')
var doit = require('doit')
var invalidParams = require('invalidParams')
var api = require('./api')
var schemas = require('./schemas')

test('readable = doit(api, json)', t => {
  t.test('success', t => {
    var data = {
      jsonrpc: '2.0',
      id: 1,
      method: 'sum',
      params: [ 1, 2 ]
    }
    var _expected = {
      jsonrpc: '2.0',
      id: 1,
      result: 3,
      request: data
    }
    var expected = [ _expected ]
    pipe(
      doit(api, data),
      concat(result => {
        t.deepEqual(result, expected)
      }),
      error => {
        t.error(error)
        t.end()
      }
    )
  })

  t.test('success # passed jsonrpc2 error', t => {
    var _data = {
      jsonrpc: '2.0',
      id: 2,
      method: 'upper',
      params: [ 'foo' ]
    }
    var data = invalidParams(schemas, _data)
    var expected = [ data ]
    pipe(
      doit(api, data),
      concat(result => {
        t.deepEqual(
          JSON.parse(safe(result)),
          JSON.parse(safe(expected))
        )
      }),
      error => {
        t.error(error)
        t.end()
      }
    )
  })

  t.test('fail', t => {
    var _data = {
      jsonrpc: '2.0',
      id: 2,
      method: 'upper',
      params: { text: 'buuu pop' }
    }
    var data = invalidParams(schemas, _data)
    var _expected = {
      jsonrpc: '2.0',
      id: 2,
      error: {
        message: 'Internal error',
        code: -32603,
        data: {
          _: _data,
          errors: [
            { message: 'Buu error', name: 'Error' }
          ]
        }
      }
    }
    var expected = [ _expected ]
    pipe(
      doit(api, data),
      concat(result => {
        t.deepEqual(
          JSON.parse(safe(result)),
          expected
        )
      }),
      error => {
        t.error(error)
        t.end()
      }
    )
  })

  t.test('batch', t => {
    var dataSuccess = {
      jsonrpc: '2.0',
      id: 'success',
      method: 'upper',
      params: { text: 'ponta' }
    }
    var _dataError = {
      jsonrpc: '2.0',
      id: 'error',
      method: 'upper',
      params: [ 'mugen' ]
    }
    var dataError = invalidParams(schemas, _dataError)
    var dataFail = {
      jsonrpc: '2.0',
      id: 'fail',
      method: 'upper',
      params: { text: 'buuu!!!' }
    }
    var expectedSuccess = {
      jsonrpc: '2.0',
      id: 'success',
      result: 'PONTA',
      request: dataSuccess
    }
    var expectedFail = {
      jsonrpc: '2.0',
      id: 'fail',
      error: {
        message: 'Internal error',
        code: -32603,
        data: {
          _: dataFail,
          errors: [
            { name: 'Error', message: 'Buu error' }
          ]
        }
      }
    }
    var data = [ dataError, dataFail, dataSuccess ]
    var expected = [ dataError, expectedFail, expectedSuccess ]
    pipe(
      doit(api, data),
      concat(result => {
        t.deepEqual(
          JSON.parse(safe(result)),
          JSON.parse(safe(expected)))
      }),
      error => {
        t.error(error)
        t.end()
      }
    )
  })

  t.end()
})
