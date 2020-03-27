// the PEERS data store contains information about each connected peer (including the local user (definied by state.user.uuid))
// Each peer has/will have:
// 1. a nickname
// 2. a set of mediaStreamIds (including metadata about the track)
// 3. certain tracks (defaultTracks) designated for communication
//
// The PEER data store ideally should be identical for all users in a session, with each connected peer updating its own information and broadcasting to other users as necessary

var xtend = Object.assign

module.exports = peersModel

function peersModel (state, bus) {
  state.peers = xtend({
    byId: {

    },
    all: []
  }, state.peers)

  bus.on('peers:setAllPeers', function (peers) {
    peers.forEach(function (peer) {
      bus.emit('peers:updatePeer', peer)
    })
  })

  // update information about a specific peer, creates a new one if none exists
  // Note on Object.assign::
  // Properties in the target object will be overwritten by properties in the sources if they have the same key.
  // Later sources' properties will similarly overwrite earlier ones.
  bus.on('peers:updatePeer', function (peer) {
    state.peers.byId[peer.peerId] = xtend({
      peerId: peer.peerId,
      streams: [],
      nickname: null,
      defaultStream: null,
      requestMedia: true // flag indicating whether the peer should receive media from other peers
    }, state.peers.byId[peer.peerId], peer)

  //  console.log('NEW  PEER INFO',state)
    bus.emit('ui:addPeer', {
      peerId: peer.peerId
    })

    if (state.peers.all.indexOf(peer.peerId) < 0) {
      state.peers.all.push(peer.peerId)
    }
    bus.emit('render')
  })

  bus.on('peers:addStreamToPeer', function (opts) {
    state.peers.byId[opts.peerId].streams.push(opts.streamId)
    // if stream is default communication stream, add to peer defaultStream
    if (opts.isDefault) {
      state.peers.byId[opts.peerId].defaultStream = opts.streamId
    }
    bus.emit('render')
  })

  bus.on('peers:hangupTrack', function (trackId) {
    var index = state.peers.byId[state.user.uuid].tracks.indexOf(trackId)
    if (index > -1) state.peers.byId[state.user.uuid].tracks.splice(index, 1)
    bus.emit('media:removeTrack', trackId)
    bus.emit('user:updateBroadcastStream')
    bus.emit('render')
  })

  bus.on('peers:removePeer', function (peerId) {
    if(state.peers.byId[peerId]){
      state.peers.byId[peerId].streams.forEach(function (streamId) {
        bus.emit('media:removeStream', streamId)
      })
      state.peers.byId[peerId].streams = []
      var index = state.peers.all.indexOf(peerId)
      if (index > -1) state.peers.all.splice(index, 1)
      delete state.peers.byId[peerId]
      bus.emit('ui:removePeer', peerId)
      bus.emit('render')
    }
  })
}
