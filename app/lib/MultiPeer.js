// to do --> add classes for stream and simple peer that add extra information to each?
const Channel = require('./Channel.js')
var io = require('socket.io-client')
var Peer = require('./Peer.js')
var EventEmitter = require('events').EventEmitter
//var Messenger = require('./PeerMessenger.js')
const assert = require('assert')
const shortid = require('shortid')
const merge = require('deepmerge')

function log(...message){console.log(...message)}
function makeError(...message) { console.error(...message)}
function warn(...message) { console.warn(...message)}

class MultiPeer extends EventEmitter {
  constructor() {
    super()
    this.peers = {}
  //  this.messenger = new Messenger(this)
    this.isOnline = true
    this._localStreams = {} // local user streams

    this.streams = [] // user facing list of streams
    this.channels = {}
  }

  init({ server = 'https://livelab.app:6643', room = '', userData = {}, peerOptions = {}, sendOnly = false, stream }) {

    this.signaller = io(server)
    this.room = room
    this.user = Object.assign({}, {
      uuid: shortid.generate(),
      nickname: '',
      sendOnly: sendOnly,
      streamInfo: {},
      navigator: {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      },
    }, userData)



    console.log('SEND ONLY', sendOnly)
    this.addChannel('userInfo', { localData: this.user })
    //this.addChannel('requestMedia', { localData: sendOnly})


    // options for signalling server
    this._peerOptions = peerOptions

    this.defaultStream = null
    if(stream) {
      this.defaultStream = stream
      this.addStream(stream)
    }

    var self = this
    // Handle events from signalling server
    this.signaller.on('ready', this._connectToPeers.bind(this))

    this.signaller.on('signal', this._handleSignal.bind(this))

    // updated list of peers when loss of connection is suspected
    this.signaller.on('peers', (peers) => {
      console.log('peers')
      self._connectToPeers(null, peers, self.servers)
    })

     // emit 'join' event to signalling server
    this.signaller.emit('join', this.room, this.user)

    // when socket is reconnecting,
    this.signaller.on('reconnect', (e) => {
      console.log('ATTEMPTING TO RECONNECT')
      this.signaller.emit('join', this._room, this.user)
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
      Object.keys(self.peers).forEach((id) => self.peers[id]._peer.destroy())
    })
  }

  // opts can be tag and localData
  addChannel(tag, opts) {
    this.channels[tag] = new Channel(Object.assign({}, opts, {tag: tag}), this.peers)
    return this.channels[tag]
  }

  addStream(stream) {
    var settings = getSettingsFromStream(stream)
    this._localStreams[stream.id] = stream
    this.user.streamInfo[stream.id] = { settings: settings }
    Object.values(this.peers).forEach((peer) => {
      peer.addStream(stream)
    })
    this._updateStreamsList()
  }

  // @to do: attach peer info to stream, contain in object
  // order by uuid
  _updateStreamsList() {
    var streams = []
    Object.values(this._localStreams).forEach((stream) => {
    //  stream.peer = this.user
      streams.push(Object.assign({
        peer: this.user,
        stream: stream,
        isLocal: true
      }, this.user.streamInfo[stream.id]))
    })
    Object.values(this.peers).forEach((peer) =>
      Object.values(peer.streams).forEach((stream) => {
      //  if(stream.stream) {
          var streamObj = { peer: peer, stream: stream, isLocal: false}
          // streams.push({
          //   peer: peer,
          //   stream: stream
          // })
          if(peer.streamInfo[stream.id]) streamObj = Object.assign({}, peer.streamInfo[stream.id], streamObj)
          streams.push(streamObj)
      //  }
      })
    )
    log('streams', streams, this.peers)
    this.streams = streams
    this.emit('update')
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
    //  this.peers[data.id] = { _peer: new Peer(options), id: data.id, streams: {}, streamInfo: {} }
      this.peers[data.id] = new Peer ({ peerOptions: options, id: data.id, streams: {}, streamInfo: {}, signaller: this.signaller, parent: this })

    //  this._attachPeerEvents(this.peers[data.id], data.id)
    }
    this.peers[data.id]._peer.signal(data.signal)
  }

  _connectToPeers (_t, peers, servers) {
    console.log('READY TO CONNECT', peers, servers)
    // If client receives a list of STUN and TURN servers from the server, use in signalling process.


    if (servers) {
      this._peerOptions.config = {
        iceServers: servers,
        sdpSemantics: 'plan-b',
      //  trickle: false
      }
    } else {
      this._peerOptions.config = {
        sdpSemantics: 'plan-b',
    //    trickle: false
      }
      this.servers = servers
    }
    peers.filter((id) => id!== this.user.uuid).forEach( (id) => {
      if(this.peers[id]) {
        // peer is still connected; do nothing
        if(this.peers[id]._peer._pc.connectionState === 'connected'){}
        console.warn('peer exists', this.peers[id])
      } else {
        var newOptions = { initiator: true }
        var options = Object.assign(newOptions, this._peerOptions)
        this.peers[id] = new Peer ({ peerOptions: options, id: id, streams: {}, streamInfo: {}, signaller: this.signaller, parent: this })
        //this._attachPeerEvents(this.peers[id], id)
      }
    })
    this.emit('ready', peers)
  }

  sendToAll(data) {
    Object.keys(this.peers).forEach( (id)  =>  { this.peers[id]._peer.send(data) })
  }

  /*
    Handling events related to specific peers
   */
   // sendLocalInfo
   // _shareUserInfo (peer) {
   //   // var streamInfo = {}
   //   // Object.values(this._localStreams).forEach((stream) => {
   //   //   streamInfo[stream.stream.id] = Object.assign({}, stream)
   //   //   delete streamInfo[stream.stream.id].stream
   //   // })
   //   console.log('sharing info', this.user)
   //   peer._peer.send(JSON.stringify({
   //     type: 'userInfo',
   //     data: Object.assign({}, this.user)
   //   }))
   //
   //    if ( !this.user.sendOnly ) {
   //      peer._peer.send(JSON.stringify({
   //       type: 'requestMedia'
   //     }))
   //   }
   // }

  // _processData(data, peer) {
  //     let payload = JSON.parse(data)
  //     // assert.equal(typeof payload.data, 'object', 'Data should be of type object')
  //
  //       console.log('data', peer, JSON.parse(data))
  //     if(payload.type === 'message'){
  //        self.messenger.messageReceived(payload.data, id)
  //     } else if(payload.type === 'userInfo') {
  //       console.log('got info', peer, payload.data)
  //       var newPeer = Object.assign(peer, payload.data)
  //       //newPeer.streams = Object.assign({}, peer.streams)
  //       peer = newPeer
  //     } else if(payload.type === 'requestMedia') {
  //       Object.values(this._localStreams).forEach((stream) => { peer._peer.addStream(stream) })
  //       this._updateStreamsList()
  //     }
  //     // this.emit('data', {
  //     //   id: id,
  //     //   data: JSON.parse(data)
  //     // })
  // }

}

function getSettingsFromStream(stream) {
  var settings = {}
  if (stream && stream !== null) {
    stream.getTracks().forEach((track) => settings[track.kind] = track.getSettings())
  }
  return settings
}

module.exports = MultiPeer
