// to do --> add classes for stream and simple peer that add extra information to each?

var io = require('socket.io-client')
var SimplePeer = require('simple-peer')
var EventEmitter = require('events').EventEmitter
var Messenger = require('./PeerMessenger.js')
const assert = require('assert')
const shortid = require('shortid')

function log(...message){console.log(...message)}
function makeError(...message) { console.error(...message)}
function warn(...message) { console.warn(...message)}

class MultiPeer extends EventEmitter {
  constructor() {
    super()
    this.peers = {}
    this.messenger = new Messenger(this)
    this.isOnline = true
    this.streams = {}
  }

  init({ server = 'https://livelab.app:6643', room = '', userData = {}, peerOptions = {}, sendOnly = false }) {

    this.signaller = io(server)
    this.room = room
    this.user = Object.assign({}, {
      uuid: shortid.generate(),
      nickname: '',
      sendOnly: sendOnly
    }, userData)

    // options for signalling server
    this._peerOptions = peerOptions

    var self = this
    // Handle events from signalling server
    this.signaller.on('ready', this._connectToPeers.bind(this))

    this.signaller.on('signal', this._handleSignal.bind(this))

    // updated list of peers when loss of connection is suspected
    this.signaller.on('peers', (peers) => {  self._connectToPeers(null, peers, self.servers)  })

     // emit 'join' event to signalling server
    this.signaller.emit('join', this.room, this.user)

    // when socket is reconnecting,
    this.signaller.on('reconnect', (e) => {
      this.signaller.emit('join', this._room, this._userData)
      warn('socket reconnected!')
    })

    this.checkConnectivity = setInterval(() => {
      if(self.isOnline !== navigator.onLine) {
        if(navigator.onLine === false) {
          self.onDisconnect()
        } else {
          self.onReconnect()
        }
      }
      self.isOnline = navigator.onLine
      //console.log(navigator.onLine)
    }, 500)

    window.addEventListener('unload', function(){
      Object.keys(self.peers).forEach((id) => self.peers[id].destroy())
    })
  }

  addStream(stream) {
    var settings = getSettingsFromStream(stream)
    this.streams[stream.id] = {
      settings: settings,
      stream: stream
    }
  }

  onDisconnect() {
    this.emit('disconnect')
    warn('disconnected from internet')
  }

  onReconnect() {
    this.emit('reconnect')
    warn('internet reconnected')
    this.signaller.emit('getPeers')
  }

  _handleSignal = function (data) {
    // if there is currently no peer object for a peer id, that peer is initiating a new connection.
    if (!this.peers[data.id]) {
    //  this.emit('new peer', data)
      var options = Object.assign({
        stream: this.stream
      }, this._peerOptions)
      this.peers[data.id] = { _peer: new SimplePeer(options), id: data.id, streams: {} }
      this._attachPeerEvents(this.peers[data.id], data.id)
    }
    this.peers[data.id]._peer.signal(data.signal)
  }

  _connectToPeers (_t, peers, servers) {
    // If client receives a list of STUN and TURN servers from the server, use in signalling process.
    this.emit('ready', peers)

    if (servers) {
      this._peerOptions.config = {
        iceServers: servers,
        sdpSemantics: 'plan-b'
      }
    } else {
      this._peerOptions.config = {
        sdpSemantics: 'plan-b'
      }
      this.servers = servers
    }
    peers.filter((id) => id!== this.user.uuid).forEach( (id) => {
      if(this.peers[id]) {
        // peer is still connected; do nothing
        if(this.peers[id]._peer._pc.connectionState === 'connected'){}
      } else {
        var newOptions = { initiator: true }
        var options = Object.assign(newOptions, this._peerOptions)
        this.peers[id] = { _peer: new SimplePeer(options), id: id, streams: {} }
        this._attachPeerEvents(this.peers[id], id)
      }
    })
  }

  _attachPeerEvents( peer, id ) {
    var self = this
    var p = peer._peer
    p.on('signal', (signal) => {
      //console.log('signal')
      //  console.log("peer signal sending over sockets", id, signal)
      this.signaller.emit('signal', {
        id: id,
        signal: signal
      })
    })
    //.bind(this, _id))

    p.on('stream', (stream) => {

      if(peer.streams[stream.id]) {
        peer.streams[stream.id].stream = stream
      } else {
        warn('no info for stream ', stream.id, peer, stream)
        peer.streams[stream.id] = {
          stream: stream
        }
      }
      this.emit('stream', id, stream)
      log(stream, peer)
    })

    p.on('connect', () => {
      log('connected', p)
      this._shareUserInfo(peer)
      this.emit('connect', { id: id, pc: p._pc, peer: p})
    })

    p.on('error', (error, info) => { makeError('RTC error', error, info) })

    p.on('data', (data) => this._processData(data, peer))

    p.on('close', (id) => {
      //console.log('CLOSED')
      delete(this.peers[id])
      this.emit('close', id)
    })
  }

  sendToAll(data) {
    Object.keys(this.peers).forEach( (id)  =>  { this.peers[id]._peer.send(data) })
  }

  /*
    Handling events related to specific peers
   */
   // sendLocalInfo
   _shareUserInfo (peer) {
     var streamInfo = {}
     Object.values(this.streams).forEach((stream) => {
       streamInfo[stream.stream.id] = Object.assign({}, stream)
       delete streamInfo[stream.stream.id].stream
     })
     peer._peer.send(JSON.stringify({
       type: 'userInfo',
       data: Object.assign({}, this.user, { streams: streamInfo })
     }))

      if ( !this.user.sendOnly ) {
        peer._peer.send(JSON.stringify({
         type: 'requestMedia'
       }))
     }
   }

  _processData(data, peer) {
      let payload = JSON.parse(data)
      // assert.equal(typeof payload.data, 'object', 'Data should be of type object')

        console.log('data', peer, JSON.parse(data))
      if(payload.type === 'message'){
         self.messenger.messageReceived(payload.data, id)
      } else if(payload.type === 'userInfo') {

        peer = Object.assign(peer, payload.data)
        console.log( 'peer', peer)
      } else if(payload.type === 'requestMedia') {
        Object.values(this.streams).forEach((stream) => { peer._peer.addStream(stream.stream) })
      }
      // this.emit('data', {
      //   id: id,
      //   data: JSON.parse(data)
      // })
  }

}

function getSettingsFromStream(stream) {
  var settings = {}
  if (stream && stream !== null) {
    stream.getTracks().forEach((track) => settings[track.kind] = track.getSettings())
  }
  return settings
}

module.exports = MultiPeer
