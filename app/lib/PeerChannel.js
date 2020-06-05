// how to handle channel?
// sometimes you just want to listen to channel events, regardless of the peer that is calling it

const EventEmitter = require('events').EventEmitter

/*
 bi-directional data channel for sharing information with a specific peer
 information that the remote peer shares to this channel is stored in 'log'
 localChannel refers to the corresponding local channel (class Channel) that contains

 current value is stored in 'value' property
 history of values is stored in log

 questions:
 1) right now local info is duplicated for each peer -- how to have central way of sending to all
*/
class PeerChannel extends EventEmitter {
  constructor ({ localChannel, peer, tag } = {}) {
    super()
    this.tag = tag
    this._peer = peer._peer
    this.peer = peer
    this.log = []
    this.localChannel = localChannel
    this.value = null
    this.isConnected = false
    this.outbox = [] // messages that cannot be sent yet
  }

  initialSync () {
    this.isConnected = true
    if (this.localChannel.localData !== undefined) {
      this.send('update', this.localChannel.localData)
    }
    this.outbox.forEach(msg => {
      this.send(msg.address, msg.data)
    })
    this.outbox = []
  }

  receivedMessage (msg) {
    this.emit(msg.address, msg.data)
    this.value = msg.data
    this.log.push(msg)
  }

  send (address, message) {
    const msg = { tag: this.tag, data: message, address: address }
    if (this.isConnected) {
      this._peer.send(JSON.stringify(msg))
    } else {
      this.outbox.push(msg)
    }
  }
}

module.exports = PeerChannel
