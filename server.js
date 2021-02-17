var fs = require('fs')
var express = require('express')
var app = express()
var browserify = require('browserify-middleware')
var https = require('https')

require('dotenv').config();

//switch between localhost and website SSL credentials using environment variables 
var privateKey = process.env.NODE_ENV === 'localrun' ?
  fs.readFileSync(__dirname + '/certs/localhost-key.pem', 'utf8') :
  fs.readFileSync(__dirname + '/certs/privkey.pem', 'utf8');

var certificate = process.env.NODE_ENV === 'localrun' ?
  fs.readFileSync(__dirname + '/certs/localhost.pem', 'utf8') :
  fs.readFileSync(__dirname + '/certs/fullchain.pem', 'utf8');

var credentials = {
  key: privateKey,
  cert: certificate
}

var httpsServer = https.createServer(credentials, app)

var portNumber = process.env.PORT;

httpsServer.listen(portNumber, function () {
  console.log("server available at port " + portNumber)
})

app.use(express.static(__dirname + '/public'))