// to do --> add classes for stream and simple peer that add extra information to each?

const SimplePeer = require('simple-peer')
const EventEmitter = require('events').EventEmitter
const PeerChannel = require('./PeerChannel.js')

function log (...message) {
  console.log(...message)
}

function warn (...message) {
  console.warn(...message)
}

class Peer extends EventEmitter {
  constructor ({ peerOptions, id, streams, streamInfo, signaller, parent }) {
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
    Object.entries(parent.channels).forEach(([tag, channel]) => {
      this.channels[tag] = new PeerChannel(
        Object.assign({}, { peer: this, localChannel: channel }, channel.opts)
      )
      channel.attachEvents(this.channels[tag])
    })

    this.channels.userInfo.on('update', data => {
      this.nickname = data.nickname
      this.streamInfo = data.streamInfo
      parent._updateStreamsList()
    })

    if (!parent.user.sendOnly) this.channels.userInfo.send('requestMedia')
    this.channels.userInfo.on('requestMedia', () => {
      this.requestedMedia = true
      Object.values(parent._localStreams).forEach(stream => {
        this._peer.addStream(stream)
      })
    })
  }

  addStream (stream) {
    if (this.requestedMedia === true) {
      this._parent.channels.userInfo.updateLocalData(this._parent.user)
      this._peer.addStream(stream)
    }
  }

  _attachEvents (id) {
    var p = this._peer
    p.on('signal', signal => {
      this.signaller.emit('signal', { id: id, signal: signal })
    })
    p.on('stream', stream => {
      console.log('got stream', stream, 'background: #00ffff; color: #fff')
      stream.getTracks().forEach(track => {
        track.onended = e => {
          warn('stream ended', stream)
          if (this.streams[stream.id]) delete this.streams[stream.id]
          this._parent._updateStreamsList()
        }
      })
      this.streams[stream.id] = stream
      this._parent._updateStreamsList()
      this._parent.emit('stream', id, stream)
    })

    p.on('connect', () => {
      console.log(
        `%c connected to ${id}`,
        'background: #222; color: #bada55; margin: 2px',
        p,
        this.channels
      )
      Object.values(this.channels).forEach(channel => {
        channel.initialSync()
      })
      this._parent.emit('connect', { id: id, pc: p._pc, peer: p })
    })

    p.on('error', (error, info) => {
      warn('RTC error', error, info)
    })

    p.on('data', data => this._processData(data, this))

    p.on('close', () => {
      delete this._parent.peers[id]
      log('close', id)
      this._parent._updateStreamsList()
      //  this.emit('close', id)
    })
  }

  // @ todo -- messaging
  _processData (data, peer) {
    const payload = JSON.parse(data)
    if (payload.tag) {
      if (this.channels[payload.tag]) {
        this.channels[payload.tag].receivedMessage(payload)
      } else {
        console.warn('no channel named', payload.tag)
      }
    }
  }
}

module.exports = Peer
