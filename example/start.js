#!/usr/bin/env node
var app = require('./server')
var { port } = require('./config')
var msg = `server start to listen on port - ${port}`
app.listen(port, () => console.log(msg))
