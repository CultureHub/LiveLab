// how to handle channel?
// sometimes you just want to listen to channel events, regardless of the peer that is calling it

const EventEmitter = require('events').EventEmitter

/*
 bi-directional data channel for sharing information with peers
 contains local and remote information
 localData = local information that should be shared with peers

 current value is stored in 'value' property
 history of values is stored in log

 questions:
 1) right now local info is duplicated for each peer -- how to have central way of sending to all
*/
class PeerChannel extends EventEmitter {
  constructor({ parentChannel, peer, tag } = {}) {
    super()
    // if(localData !== undefined) this.localData = localData
    this.tag = tag
    this._peer = peer._peer
    this.peer = peer
    this.log = []
//    console.log('initial data', this.localData)
    this.parentChannel = parentChannel
    this.initialSync = this.initialSync.bind(this)
    this.value = null
    this.isConnected = false
    this.outbox = [] // messages that cannot be sent yet
  }

  initialSync() {
  //  console.log('syncing', this)
    this.isConnected = true
    if(this.parentChannel.localData !== undefined) this.send('update', this.parentChannel.localData)
    this.outbox.forEach((msg) => {
      this.send(msg.address, msg.data)
    })
    this.outbox = []
    //
    // {
    //   peer._peer.send(JSON.stringify({
    //     type: 'userInfo',
    //     data: Object.assign({}, this.parent.user)
    //   }))
    // }
  }

  receivedMessage(msg) {
  //  console.log('RECEIVED', msg)
    this.emit(msg.address, msg.data)
    this.value = msg.data
    this.log.push(msg)
  }

  send(address, message) {
    let msg = {
      tag: this.tag,
      data: message,
      address: address
    }
  //  console.log('SENDING', msg)
    if (this.isConnected) {
      this._peer.send(JSON.stringify(msg))
    } else {
      this.outbox.push(msg)
    }
  }

  // updateLocalData(newData) {
  //   this.localData = newData
  //   this.send('update', this.localData)
  // }

  // appendToLog() {
  //
  // }
}

module.exports = PeerChannel
