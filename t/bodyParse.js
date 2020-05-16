var test = require('tape')
var safe = require('json-stringify-safe')
var { through, pipe, concat } = require('mississippi')
var bodyParse = require('bodyParse')

test('duplex = bodyParse((json) => { return readable })', t => {
  t.test('success', t => {
    var data = {
      jsonrpc: '2.0',
      id: 1,
      method: 'foo',
      params: [ 1 ]
    }
    var res = concat(json => {
      t.deepEqual(json, [ data ])
    })
    var req = through.obj()
    pipe(
      req,
      bodyParse(json => {
        var s = through.obj()
        process.nextTick(() => s.end(json))
        return s
      }),
      res,
      error => {
        t.error(error)
        t.end()
      }
    )
    req.end(Buffer.from(safe(data)))
  })

  t.test('fail', t => {
    var data = '{]'
    var expected = [ {
      jsonrpc: '2.0',
      id: null,
      error: {
        message: 'Parse error',
        code: -32700,
        data: {
          _: data,
          errors: [
            { name: 'SyntaxError', message: 'can not JSON.parse' }
          ]
        }
      }
    } ]
    var res = concat(json => {
      var parsed = JSON.parse(safe(json))
      t.deepEqual(parsed, expected)
    })
    var req = through.obj()
    pipe(
      req,
      bodyParse(json => {
        var s = through.obj()
        process.nextTick(() => s.end(json))
        return s
      }),
      res,
      error => {
        t.error(error)
        t.end()
      }
    )
    req.end(Buffer.from(data))
  })

  t.test('null', t => {
    var data = null
    var expected = [] // empty
    var res = concat(isNull => {
      t.deepEqual(isNull, expected)
    })
    var req = through.obj()
    pipe(
      req,
      bodyParse(isNull => {
        var s = through.obj()
        process.nextTick(() => s.end(isNull))
        return s
      }),
      res,
      error => {
        t.error(error)
        t.end()
      }
    )
    req.end(Buffer.from(safe(data)))
  })

  t.end()
})
