// to do --> add classes for stream and simple peer that add extra information to each?

const SimplePeer = require('simple-peer')
const EventEmitter = require('events').EventEmitter
const PeerChannel = require('./PeerChannel.js')

function log(...message){console.log(...message)}
function makeError(...message) { console.error(...message)}
function warn(...message) { console.warn(...message)}

class Peer extends EventEmitter {
  constructor({ peerOptions, id, streams, streamInfo, signaller, parent}) {
    super()
    this.signaller = signaller
    this.id = id
    this.streams = streams
    this.streamInfo = streamInfo
    this.nickname = ''
    this._parent = parent
    this._peer = new SimplePeer(peerOptions)
    this.requestedMedia = false
    this._attachEvents(id)

    this.channels = {}
  //  console.log('USER INFO', parent.user)
    Object.entries(parent.channels).forEach(([tag, channel]) => {
      console.log('ADDING CHANNEL', tag, channel)
      this.channels[tag] = new PeerChannel(Object.assign({}, {peer: this}, channel.opts))
      channel.attachEvents(this.channels[tag])
    })

    //this.userInfo = this.addChannel({ localData: parent.user, tag: 'userInfo' })
    this.channels.userInfo.on('update', (data) => {
      console.log(
        'GOT USER INFO'
      )
      this.nickname = data.nickname
      this.streamInfo = data.streamInfo
      parent.emit('update')
    })

    if(!parent.user.sendOnly) this.channels.userInfo.send('requestMedia')
    this.channels.userInfo.on('requestMedia', () => {
       console.log('MEDIA REQUESTED')
       this.requestedMedia = true
       Object.values(parent._localStreams).forEach((stream) => { this._peer.addStream(stream) })
    })
   //this.channels.userInfo.on('message', (data) => console.log('GOT USER INFO MESSAGE', data))

    // if user requests media, send streams
  //  this.requestMedia = this.addChannel({ localData: parent.user.sendOnly? false: true, tag: 'requestMedia' })
  //   this.channels.requestMedia.on('update', (sendMedia) => {
  //     console.log('%c requesting media', sendMedia, parent.streams, 'background: #cc44ff; color: #000')
  //     if(sendMedia) Object.values(parent._localStreams).forEach((stream) => { this._peer.addStream(stream) })
  //   })
  // //  parent.messenger.addChannel('userInfo')
  }

  addStream(stream) {
    this.channels.userInfo.updateLocalData(this._parent.user)
    console.log('ADDING', this.requestMedia)
    if(this.requestedMedia === true) this._peer.addStream(stream)
  }

  // addChannel(tag, globalChannel) {
  //   let channel = new Channel(Object.assign({}, {peer: this._peer}, globalChannel.opts))
  //   //this.channels[ tag] = channel
  //   return channel
  // }

  _attachEvents(id ) {
    var self = this
    var p = this._peer
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
    //  log('stream', stream, this)
      console.log('got stream', stream, 'background: #00ffff; color: #fff' )
      stream.getTracks().forEach((track) => {
        track.onended = (e) => {
          warn('stream ended', stream)
          if(this.streams[stream.id]) delete this.streams[stream.id]
          this._parent._updateStreamsList()

        }
      })
      this.streams[stream.id] = stream
      // if(peer.streams[stream.id]) {
      //   peer.streams[stream.id] = stream
      // } else {
      //   warn('no info for stream ', stream.id, peer, stream)
      //   peer.streams[stream.id] = {
      //     stream: stream
      //   }
      // }
      this._parent._updateStreamsList()
      this._parent.emit('stream', id, stream)
    })

    p.on('connect', () => {
      console.log(`%c connected to ${id}`, 'background: #222; color: #bada55; margin: 2px', p, this.channels)
    //  this._shareUserInfo(this)
      Object.values(this.channels).forEach((channel) => { channel.initialSync() })
      this._parent.emit('connect', { id: id, pc: p._pc, peer: p})
    })

    p.on('error', (error, info) => { warn('RTC error', error, info) })

    p.on('data', (data) => this._processData(data, this))

    p.on('close', () => {
      console.log('CLOSED', this._parent, id)
      delete(this._parent.peers[id])
      log('close', id)
      this._parent._updateStreamsList()
    //  this.emit('close', id)
    })
  }

  // @ todo -- messaging
  _processData(data, peer) {
      let payload = JSON.parse(data)
      console.log('GOT DATA', payload)
      if(payload.tag) {
        if (this.channels[payload.tag]) {
          this.channels[payload.tag].receivedMessage(payload)
        } else {
          console.warn('no channel named', payload.tag)
        }
      }
  }

}

module.exports = Peer
