var fs = require('fs')
var express = require('express')
var app = express()
var browserify = require('browserify-middleware')
var https = require('https')

var privateKey  = fs.readFileSync(__dirname + '/certs/privkey.pem', 'utf8')
var certificate = fs.readFileSync(__dirname +'/certs/fullchain.pem', 'utf8')

var credentials = {key: privateKey, cert: certificate}

var httpsServer = https.createServer(credentials, app)

var portNumber = 8000

httpsServer.listen(portNumber, function(){
  console.log("server available at port "+portNumber)
})

app.use(express.static(__dirname +'/public'))
