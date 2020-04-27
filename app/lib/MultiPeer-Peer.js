// to do --> add classes for stream and simple peer that add extra information to each?

var SimplePeer = require('simple-peer')
var EventEmitter = require('events').EventEmitter

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
    this.parent = parent
    this._peer = new SimplePeer(peerOptions)
    this._attachEvents(id)
  }

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
      log('stream', stream, this)
      stream.getTracks().forEach((track) => {
        track.onended = (e) => {
          warn('stream ended', stream)
          if(this.streams[stream.id]) delete this.streams[stream.id]
          this.parent._updateStreamsList()

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
      this.parent._updateStreamsList()
      this.parent.emit('stream', id, stream)
    })

    p.on('connect', () => {
      log('connected', p)
      this.parent._shareUserInfo(this)
      this.parent.emit('connect', { id: id, pc: p._pc, peer: p})
    })

    p.on('error', (error, info) => { warn('RTC error', error, info) })

    p.on('data', (data) => this.parent._processData(data, this))

    p.on('close', (id) => {
      //console.log('CLOSED')
      delete(this.parent.peers[id])
      log('close', id)
      this.parent._updateStreamsList()
    //  this.emit('close', id)
    })
  }


}

module.exports = Peer
