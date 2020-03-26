// Module for handling connections to multiple peers

var io = require('socket.io-client')
var SimplePeer = require('simple-peer')
var extend = Object.assign
var events = require('events').EventEmitter
var inherits = require('inherits')

var MultiPeer = function (options) {
  // connect to websocket signalling server. To DO: error validation
  this.signaller = io(options.server)
  this._userData = options.userData || null
  this.stream = options.stream || null
  // this.stream = options.stream || null
  this._peerOptions = options.peerOptions || {}
  this._room = options.room
  this.peers = {}
/*Define and Calculate */
  // this.peersLastResult = {}
  // this.peersBitrate = {}

  // Handle events from signalling server
  this.signaller.on('ready', this._connectToPeers.bind(this))
  //  this.signaller.on('peers', )
  this.signaller.on('signal', this._handleSignal.bind(this))

  // emit 'join' event to signalling server
  this.signaller.emit('join', this._room, this._userData)

  var self = this
  window.onunload = function(){
    Object.keys(self.peers).forEach((id) => self.peers[id].destroy())
  //  return 'Are you sure you want to leave?';
  };
}
// inherits from events module in order to trigger events
inherits(MultiPeer, events)

// send data to all connected peers via data channels
MultiPeer.prototype.sendToAll = function (data) {
  Object.keys(this.peers).forEach(function (id) {
    this.peers[id].send(data)
  }, this)
}

MultiPeer.prototype.sendToPeer = function (peerId, data) {
  if (peerId in this.peers) {
    this.peers[peerId].send(data)
  }
}

MultiPeer.prototype.sendStreamToPeer = function (stream, peerId) {
  if (peerId in this.peers) {
    this.peers[peerId].addStream(stream)
  } else {
    console.log('PEER NOT FOUND', peerId)
  }
}

MultiPeer.prototype.addStream = function (stream) {
  var self = this
  Object.keys(this.peers).forEach(function (id) {
    self.peers[id].addStream(stream)
  })
}

// Once the new peer receives a list of connected peers from the server,
// creates new simple peer object for each connected peer.
MultiPeer.prototype._connectToPeers = function (_t, peers, servers) {
  this.emit('peers', peers)

  // If client receives a list of STUN and TURN servers from the server, use in signalling process.
  if (servers) {
    this._peerOptions.config = {
      iceServers: servers,
    //  sdpSemantics: 'plan-b'
    }
  } else {
    this._peerOptions.config = {
    //  sdpSemantics: 'plan-b'
    }
  }
  peers.forEach(function (id) {
    this.emit('new peer', {
      id: id
    })
    var newOptions = {
      initiator: true
    }
    if (this.stream != null) {
      newOptions.stream = this.stream
    } else {
      console.log('stream is null')
    }
    var options = extend(newOptions, this._peerOptions)
  //  console.log("options", options)
    this.peers[id] = new SimplePeer(options)
    this._attachPeerEvents(this.peers[id], id)
  }.bind(this))
}

// receive signal from signalling server, forward to simple-peer
MultiPeer.prototype._handleSignal = function (data) {
  // if there is currently no peer object for a peer id, that peer is initiating a new connection.
  if (!this.peers[data.id]) {
    this.emit('new peer', data)
    var options = extend({
      stream: this.stream
    }, this._peerOptions)
    this.peers[data.id] = new SimplePeer(options)
    this._attachPeerEvents(this.peers[data.id], data.id)
  }
  this.peers[data.id].signal(data.signal)
}

// handle events for each connected peer
MultiPeer.prototype._attachPeerEvents = function (p, _id) {
  p.on('signal', function (id, signal) {
    console.log('signal')
    //  console.log("peer signal sending over sockets", id, signal)
    this.signaller.emit('signal', {
      id: id,
      signal: signal
    })
  }.bind(this, _id))

  p.on('stream', function (id, stream) {
    this.emit('stream', id, stream)
  }.bind(this, _id))

  p.on('connect', function (id) {
    this.emit('connect', { id: id, pc: p._pc})
  }.bind(this, _id))

  p.on('error', function(error, info) {
    console.log(error, info)
  })

  p.on('data', function (id, data) {
    this.emit('data', {
      id: id,
      data: JSON.parse(data)
    })
  }.bind(this, _id))

  p.on('close', function (id) {
    console.log('CLOSED')
    delete(this.peers[id])
    this.emit('close', id)
  }.bind(this, _id))
}

module.exports = MultiPeer
