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
// opts can be tag and localData
// @todo: what happens when send is called before connection is initiated
class LocalChannel extends EventEmitter {
  constructor (opts, peers) {
    super()
    this.opts = opts
    this.tag = opts.tag
    if (opts.localData !== undefined) this.localData = opts.localData
    Object.entries(peers).forEach(([id, peer]) => {
      const channel = peer.addChannel(opts)
      channel.on('update', data => {
        this.emit('update', data, id)
      })
    })
    this.peers = peers
    this.listeners = []
  }

  // forward event listeners from individual peers
  on (address, callback) {
    Object.entries(this.peers).forEach(([id, peer]) => {
      peer.channels[this.tag].on(address, (...args) => {
        callback(...args, peer)
      })
    })
    this.listeners.push({ address: address, callback: callback })
  }

  updateLocalData (newData) {
    this.localData = newData
    Object.entries(this.peers).forEach(([id, peer]) => {
      peer.channels[this.tag].send('update', newData)
    })
  }

  send (address, message) {
    Object.entries(this.peers).forEach(([id, peer]) => {
      peer.channels[this.tag].send(address, message)
    })
  }

  attachEvents (peerChannel) {
    this.listeners.forEach(listener => {
      peerChannel.on(
        listener.address,
        (...args) => listener.callback(...args, peerChannel.peer)
      )
    })
  }
}

module.exports = LocalChannel
