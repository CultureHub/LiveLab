/* global nw */
// Server side module for managing osc connections. Only works with nw.js

// var shortid = require('shortid')

var dgram, osc
if (typeof nw === 'object') {
  dgram = nw.require('dgram')
  osc = nw.require('osc-min')
}
// to do: possibly switch to osc-msg (https://github.com/mohayonao/osc-msg) which seems to be better maintained
var events = require('events').EventEmitter
var inherits = require('inherits')

var LiveLabOSC = function (options) {
  // this.udp_client
  this.receivers = {}
  this.emitter = dgram.createSocket('udp4', function (msg, rinfo) {
  })
}

inherits(LiveLabOSC, events)

LiveLabOSC.prototype.sendOSC = function (_message, _port, _ip) {
  var buf = osc.toBuffer(_message)
  this.emitter.send(buf, 0, buf.length, _port, _ip)
}

LiveLabOSC.prototype.stopListening = function (port) {
  if (this.receivers[port]) {
    this.receivers[port].close()
    delete this.receivers[port]
  }
}

LiveLabOSC.prototype.listenOnPort = function (port) {
  // to do: check whether port in use
  this.receivers[port] = dgram.createSocket('udp4')
  this.receivers[port].on('error', err => {
    console.log(`server error:\n${err.stack}`)
    // server.close()
  })

  this.receivers[port].on('message', (msg, rinfo) => {
    try {
      // turns datagram to javascript
      var message = osc.fromBuffer(msg)

      this.emit('received osc', { port: port, message: message })
    } catch (error1) {
      // error = error1
      console.log('invalid OSC packet', error1)
    }
    // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  })

  this.receivers[port].on('listening', () => {
  })

  this.receivers[port].bind(port)
  // this.receivers[port].bind(port)
  // console.log("!!LLLLLLLLlistening on port", port)
  // this.receivers[port].on('message', function() {
  //   // handle all messages
  //   var address = arguments[0];
  //   var args = Array.prototype.slice.call(arguments, 1);
  //   console.log("RECEIVED ", address, args)
  // })
}

module.exports = LiveLabOSC
