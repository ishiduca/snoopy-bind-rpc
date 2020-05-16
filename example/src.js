var document = require('global/document')
var yo = require('yo-yo')
var { start } = require('@ishiduca/snoopy')
var { prefix } = require('./config')
var api = require('./api-callback')
var schemas = require('./schemas')
var bind = require('..')
var rpc = bind(prefix, { api, schemas })
var app = require('./app')({ rpc })
var { views, actions, models } = start(app)
var root = document.createElement('div')

views().on('data', rt => yo.update(root, rt))
models().on('data', model => console.log({ model }))
actions().on('data', action => console.log({ action }))

document.body.appendChild(root)
