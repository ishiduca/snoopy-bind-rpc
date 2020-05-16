var { BufferListStream } = require('bl')
var { through, duplex } = require('mississippi')
var { ParseError } = require('./errors')
var { jsonrpc2 } = require('./utils')

module.exports = function bodyParse (f) {
  var rs = through.obj()
  var ws = BufferListStream((error, b) => {
    if (error) {
      f(jsonrpc2.error(ParseError(error))).pipe(rs)
      return
    }

    var str = String(b)
    var json; try {
      json = JSON.parse(str)
    } catch (e) {
      var parseErr = ParseError(new SyntaxError('can not JSON.parse'), str)
      f(jsonrpc2.error(parseErr)).pipe(rs)
      return
    }

    f(json).pipe(rs)
  })
  return duplex.obj(ws, rs)
}
