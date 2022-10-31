// to do --> add classes for stream and simple peer that add extra information to each?
const LocalChannel = require('./LocalChannel.js')
var io = require('socket.io-client')
var Peer = require('./Peer.js')
var EventEmitter = require('events').EventEmitter
const nanoid = require('nanoid').nanoid

class MultiPeer extends EventEmitter {
  constructor () {
    super()
    this.peers = {}
    this.isOnline = true
    this._localStreams = {}

    // local user streams
    this.streams = []
    // user facing list of streams
    this.channels = {}
  }

  init (
    {
      server = 'https://livelab.app:6643',
      room = '',
      userData = {},
      peerOptions = {},
      sendOnly = false,
      stream
    }
  ) {
    this.signaller = io(server)
    this.room = room
    this.user = Object.assign(
      {},
      {
        uuid: nanoid(24),
        nickname: '',
        sendOnly: sendOnly,
        streamInfo: {},
        navigator: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      },
      userData
    )

    this.addChannel('userInfo', { localData: this.user })
    // options for signalling server
    this._peerOptions = Object.assign({},
   { sdpTransform: ( sdp) => {
    //   console.log('editing sdp', sdp)
      //return sdp.replace('useinbandfec=1', 'useinbandfec=1; stereo=1; maxaveragebitrate=510000')
      // return sdp.replace('useinbandfec=1', 'useinbandfec=1; stereo=1; maxaveragebitrate=256000')
    return sdp
  }}
    , peerOptions)

    this.defaultStream = null
    if (stream) {
      this.defaultStream = stream
      this.addStream(stream)
    }

    var self = this
    // Handle events from signalling server
    this.signaller.on('ready', this._connectToPeers.bind(this))

    this.signaller.on('signal', this._handleSignal.bind(this))

    // emit 'join' event to signalling server
    this.signaller.emit('join', this.room, this.user)

    // when socket is reconnecting (is this ever called?)
    this.signaller.on('reconnect', e => {
      this.signaller.emit('join', this.room, this.user)
      console.warn('socket reconnected!')
    })

    this.checkConnectivity = setInterval(
      () => {
        if (self.isOnline !== navigator.onLine) {
          if (navigator.onLine === false) {
            self.onDisconnect()
          } else {
            self.onReconnect()
          }
        }
        self.isOnline = navigator.onLine
      },
      500
    )

    window.addEventListener('unload', function () {
      Object.keys(self.peers).forEach(id => self.peers[id]._peer.destroy())
    })
  }

  endCall () {
    Object.values(this.peers).forEach(peer => {
      peer._peer.destroy()
    })
    this.signaller.close()
  }

  // opts can be tag and localData
  addChannel (tag, opts) {
    this.channels[tag] = new LocalChannel(
      Object.assign({}, opts, { tag: tag }),
      this.peers
    )
    return this.channels[tag]
  }

  addStream (
    stream,
    { isAudioMuted = false, isVideoMuted = false, isVideoMirrored = true, name = '' } = {}
  ) {
    var settings = getSettingsFromStream(stream)
    this._localStreams[stream.id] = stream
    this.user.streamInfo[stream.id] = {
      settings: settings,
      isAudioMuted: isAudioMuted,
      isVideoMuted: isVideoMuted,
      isVideoMirrored: isVideoMirrored,
      name: name
    }
    Object.values(this.peers).forEach(peer => {
      peer.addStream(stream)
    })
    //this.updateLocalStreamInfo
    
    this._updateStreamsList()
    this.channels.userInfo.updateLocalData(this.user)
  }

  removeStream (streamObj) {
    if (streamObj.isLocal) {
      if (
        this.defaultStream !== null &&
          this.defaultStream.id === streamObj.stream.id
      ) {
        this.defaultStream = null
      }
      delete this._localStreams[streamObj.stream.id]
      delete this.user.streamInfo[streamObj.stream.id]
      Object.values(this.peers).forEach(peer => {
        peer._peer.removeStream(streamObj.stream)
      })
      this._updateStreamsList()
      this.channels.userInfo.updateLocalData(this.user)
    } else {
      console.warn('trying to remove non-local stream')
    }
  }

  updateLocalStreamInfo (streamId, updateObj) {
    this.user.streamInfo[streamId] = Object.assign(
      {},
      this.user.streamInfo[streamId],
      updateObj
    )

    // share local updates with peers
    this.channels.userInfo.updateLocalData(this.user)
    this._updateStreamsList()
  }

  // @to do: attach peer info to stream, contain in object
  // order by uuid
  _updateStreamsList () {
    var streams = []
    Object.values(this._localStreams).forEach(stream => {
      streams.push(
        Object.assign(
          { peer: this.user, stream: stream, isLocal: true },
          this.user.streamInfo[stream.id]
        )
      )
    })
    Object.values(this.peers).forEach(
      peer => Object.values(peer.streams).forEach(stream => {
        var streamObj = { peer: peer, stream: stream, isLocal: false }
        if (peer.streamInfo[stream.id]) {
          streamObj = Object.assign({}, streamObj, peer.streamInfo[stream.id])
          streams.push(streamObj)
        } else {
          console.warn('stream found with no corresponding info, ignoring', streamObj, stream.active)
          if(!stream.active) {
            console.warn('deleting inactive stream', stream.id)
            delete peer.streams[stream.id]
          }
        }
      })
    )    
    this.streams = streams
    this.emit('update')
  }

  onDisconnect () {
    this.emit('disconnect')
    console.warn('disconnected from internet')
  }

  onReconnect () {
    this.emit('reconnect')
    console.warn('internet reconnected')
  //  this.signaller.emit('getPeers', this.room)
    this.signaller.emit('join', this.room, this.user)
  }

  _handleSignal (data) {
    // if there is currently no peer object for a peer id, that peer is initiating a new connection.
    if (!this.peers[data.id]) {
      var options = Object.assign({ stream: this.stream }, this._peerOptions)
      this.peers[data.id] = new Peer({
        peerOptions: options,
        id: data.id,
        streams: {},
        streamInfo: {},
        signaller: this.signaller,
        parent: this
      })
    }
    this.peers[data.id]._peer.signal(data.signal)
  }

  _connectToPeers (socketId, peers, servers) {
    // If client receives a list of STUN and TURN servers from the server, use in signalling process.
    if (servers) {
      this._peerOptions.config = {
        iceServers: servers,
        //  trickle: false
    //    sdpSemantics: 'plan-b'
      }
    } else {
      this._peerOptions.config = {
        //    trickle: false
      //  sdpSemantics: 'plan-b'
      }
      this.servers = servers
    }

    peers
      .filter(id => id !== socketId)
      .forEach(id => {
        if (this.peers[id]) {
          // peer is still connected; do nothing
          if (this.peers[id]._peer._pc.connectionState === 'connected') {
          }
          console.warn('peer exists', this.peers[id])
        } else {
          var newOptions = { initiator: true }
          var options = Object.assign(newOptions, this._peerOptions)
          this.peers[id] = new Peer({
            peerOptions: options,
            id: id,
            streams: {},
            streamInfo: {},
            signaller: this.signaller,
            parent: this
          })
        }
      })
    this.emit('ready', peers)
  }

  sendToAll (data) {
    Object.keys(this.peers).forEach(id => {
      this.peers[id]._peer.send(data)
    })
  }
}

function getSettingsFromStream (stream) {
  var settings = {}
  if (stream && stream !== null) {
    stream
      .getTracks()
      .forEach(track => { settings[track.kind] = track.getSettings() })
  }
  return settings
}

module.exports = MultiPeer
