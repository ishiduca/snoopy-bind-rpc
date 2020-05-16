window = require('global/window')
var url = require('url')
var http = require('http')
var test = require('tape')
var datas = require('./data')
var api = require('./api-callback')
var schemas = require('./schemas')
var { prefix, port } = require('./config')
var bindBrowser = require('browser')
var bindServer = require('index')
var middleware = bindServer(prefix, { api, schemas })
var app = http.createServer(middleware((req, res) => res.end()))

test('doit-browser', t => {
  app.on('close', () => t.end())
  app.listen(port, () => {
    window.location = new url.URL('http://0.0.0.0:' + port + prefix)
    var rpc = bindBrowser(prefix, { api, schemas })

    t.test('rpc.sum([ 1, 2, ... ])', t => {
      rpc.sum(datas[0].params)
        .on('data', result => {
          t.is(result, datas[0].result)
        })
        .on('end', () => {
          t.end()
        })
    })

    t.test('rpc.upper([ str ])', t => {
      rpc.upper(datas[1].params)
        .on('data', result => {
          t.is(result, datas[1].result)
        })
        .on('end', () => {
          t.end()
        })
    })

    t.test('rpc.upper([ str ]) # error', t => {
      rpc.upper(datas[2].params)
        .on('data', result => {
          t.fail(result)
        })
        .on('error', error => {
          error.data._.id = null
          t.ok(error, 'emit error ok')
          t.deepEqual(error, datas[2].result)
          t.end()
        })
        .on('end', () => {
          t.fail('no end')
        })
    })

    t.test('rpc([ requests ]) # batch', t => {
      var batchRequest = datas.map(x => ({ [x.method]: x.params }))
      rpc(batchRequest)
        .on('data', _response => {
          var response = _response.map(idnull)
          var results = datas.map(
            ({ method, params, result }) => wrap(result, method, params)
          )
          t.deepEqual(response, results)
        })
        .on('error', error => {
          t.fail(error)
        })
        .on('end', () => {
          t.end()
          app.close()
        })
    })
  })
})

function idnull (x) {
  x.id = null
  x.error && (x.error.data._.id = null)
  x.request && (x.request.id = null)
  return x
}

function wrap (result, method, params) {
  if (result.data && result.data.errors) {
    return {
      jsonrpc: '2.0',
      id: null,
      error: result
    }
  }
  return {
    jsonrpc: '2.0',
    id: null,
    result,
    request: {
      jsonrpc: '2.0',
      id: null,
      method,
      params
    }
  }
}
