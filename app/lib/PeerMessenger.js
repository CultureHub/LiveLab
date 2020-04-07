const events = require('events').EventEmitter

class Messenger extends events {
  constructor(multiPeer) {
    super()
    this.multiPeer = multiPeer
  }

  send(tag, data){
    console.log('sending message', tag, data)
    this.multiPeer.sendToAll(JSON.stringify({
      type: 'message',
      data: {
        tag: tag,
        data: data
      }
    }))
  }

  sendToPeer(tag, data, id) {
    console.log('sending', tag, data, id)
    this.multiPeer.sendToPeer(id, JSON.stringify({
      type: 'message',
      data: {
        tag: tag,
        data: data
      }
    }))
  }

  messageReceived(data, senderId) {
     console.log('receives message', tag, data)
    var tag = '*'
    if(data && data.tag){
      tag = data.tag
    } else {
      console.log('message must contain tag field')
    }
    this.emit(tag, data.data, senderId)
  }
}

module.exports = Messenger
