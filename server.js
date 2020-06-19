const fs = require('fs');
const express = require('express')
const app = express();
const browserify = require('browserify-middleware')
const https = require('https')

//var privateKey  = fs.readFileSync(__dirname + '/certs/privkey.pem', 'utf8');
//var certificate = fs.readFileSync(__dirname +'/certs/fullchain.pem', 'utf8');
const privateKey = fs.readFileSync(__dirname + '/certs/localhost-key.pem', 'utf8');
const certificate = fs.readFileSync(__dirname + '/certs/localhost.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate
}

const httpsServer = https.createServer(credentials, app)
//var portNumber = 443
const portNumber = 8000
// browserify.settings({
//   transform: ['sheetify']
// })
// app.get('/bundle.js', browserify(__dirname + '/app/app.js'));

httpsServer.listen(portNumber, () => {
  console.log("server available at port " + portNumber)
});

app.use(express.static(__dirname + '/public'));