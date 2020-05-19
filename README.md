# snoopy-bind-rpc

## example

config.json
```json
{
  "prefix": "/rpc/v1.0",
  "port": 9876
}
```

schema.json
```json
{
  "sum": {
    "type": "array",
    "items": {
      "type": "number"
    }
  },
  "average": {
    "type": "array",
    "items": {
      "type": "number"
    }
  }
}
```

api-callback.js
```js
function sum (params, cb) {
  cb(null, params.reduce((a, b) => (a + b), 0))
}

function average (params, cb) {
  sum(params, (error, result) => {
    error
      ? cb(error)
      : cb(null, result / params.length)
  })
}

module.exports = { sum, average }
```

sever.js
```js
const http = require('http')
const api = require('./api-callback')
const schemas = require('./schemas')
const { prefix, port } = require('./config')
const bind = require('@ishiduca/snoopy-bind-rpc')
const rpc = bind(prefix, { api, schemas })
const app = http.createServer(rpc((req, res) => {
  ...
}))
app.listen(port)
```

browser.js
```js
const api = require('./api-callback')
const schemas = require('./schemas')
const { prefix } = require('./config')
const bind = require('@ishiduca/snoopy-bind-rpc')
const rpc = bind(prefix, { api, schemas })
const $input = document.querySelector('#inputNumbers')
const $sum = document.querySelector('#resultSum')
const $average = document.querySelector('#resultAverage')

const set = value => {
  var values = value.split(' ').filter(Boolean).map(Number)

  rpc.sum(values)
    .on('data', sum => ($sum.innerHTML = sum))
    .on('error', error => console.error(error))

  rpc.average(values)
    .on('data', ave => ($average.innerHTML = ave))
    .on('error', error => console.error(error))
}

$input.oninput = e => set(e.target.value)
```

