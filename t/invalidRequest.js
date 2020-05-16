var test = require('tape')
var safe = require('json-stringify-safe')
var invalidRequest = require('invalidRequest')

test('(jsonrpc2.request || jsonrpc2.error) = invalidRequest(data)', t => {
  t.test('success', t => {
    var data = {
      jsonrpc: '2.0',
      id: 'success case',
      method: 'fly',
      params: [ 1 ]
    }
    var expected = data
    t.is(invalidRequest(data), expected)
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
          _: '{{',
          errors: [ { name: 'Error', message: 'can not JSON.parse' } ]
        }
      }
    }
    var expected = data
    t.is(invalidRequest(data), expected)
    t.end()
  })

  t.test('success # array', t => {
    var data = [{
      jsonrpc: '2.0',
      id: 'success case array',
      method: 'fly',
      params: [ 1 ]
    }]
    var expected = data
    t.deepEqual(invalidRequest(data), expected)
    t.end()
  })

  t.test('fail', t => {
    var data = {
      jsonrpc: '2.0',
      id: 'fail case',
      method: 'fly',
      params: 'bird'
    }
    var expected = {
      jsonrpc: '2.0',
      id: 'fail case',
      error: {
        message: 'Invalid Request',
        code: -32600,
        data: {
          _: data,
          errors: [
            { field: 'data.params', message: 'is the wrong type' }
          ]
        }
      }
    }
    var result = JSON.parse(safe(invalidRequest(data)))
    t.deepEqual(result, expected)
    t.end()
  })

  t.test('batch - [fail, success]', t => {
    var data1 = null
    var data2 = {
      jsonrpc: '2.0',
      id: 'success case',
      method: 'fly',
      params: [ 'bird' ]
    }
    var data = [ data1, data2 ]
    var expected1 = {
      jsonrpc: '2.0',
      id: null,
      error: {
        message: 'Invalid Request',
        code: -32600,
        data: {
          _: null,
          errors: [
            { field: 'data', message: 'is the wrong type' }
          ]
        }
      }
    }
    var expected2 = data2
    var expected = [ expected1, expected2 ]
    var result = JSON.parse(safe(invalidRequest(data)))
    t.deepEqual(result, expected)
    t.end()
  })

  t.end()
})
