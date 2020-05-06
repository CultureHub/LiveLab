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
class Channel extends EventEmitter {
  constructor({ localData, peer, tag } = {}) {
    super()
    if(localData) this.localData = localData
    this.tag = tag
    this._peer = peer
    this.log = []
    //console.log('initial data', this.localData)
    this.initialSync = this.initialSync.bind(this)
    this.value = null
  }

  initialSync() {
    console.log('syncing', this)
    if(this.localData) this.sendMessage('update', this.localData)
    //
    // {
    //   peer._peer.send(JSON.stringify({
    //     type: 'userInfo',
    //     data: Object.assign({}, this.parent.user)
    //   }))
    // }
  }

  receivedMessage(msg) {
//    console.log('RECEIVED', msg)
    this.emit('update', msg.data)
    this.value = msg.data
    this.log.push(msg)
  }

  sendMessage(tag, message) {
    this._peer.send(JSON.stringify({
      tag: this.tag,
      data: message
    }))
  }

  updateLocalData(newData) {
    this.localData = newData
    this.sendMessage('update', this.localData)
  }

  // appendToLog() {
  //
  // }
}

module.exports = Channel
