var xtend = Object.assign
var shortid = require('shortid')
var MultiPeer = require('./../lib/MultiPeer.js')

// To do: separate ui events (logged in) and connection state/ status log from user model
// status log contains all peer connection related information

module.exports = userModel

function userModel (state, bus) {
  state.user = xtend({
    //uuid: localStorage.getItem('uuid') || shortid.generate(), // persistent local user id. If none is present in local storage, generate new one
    uuid: shortid.generate(), // for dev purposes, always regenerate id
    room: state.query.room || localStorage.getItem('livelab-room') || 'zebra',
    server: 'https://livelab.app:6643',
    version: '1.2.5',
    loggedIn: false,
    nickname: localStorage.getItem('livelab-nickname') || '',
    statusMessage: '',
    multiPeer: null,
    muted: false,
    isOnline: true
  }, state.user)

  // save user info to local storage
  // window.addEventListener('unload', function(){
  //
  // })
  //osc.on
//login page ui events
// @todo: move this to ui state or somewhere else
  bus.emit('peers:updatePeer', {
    peerId: state.user.uuid,
    nickname: state.user.nickname
  })

  bus.on('user:setNickname', function (name) {
    bus.emit('peers:updatePeer', {
      peerId: state.user.uuid,
      nickname: name
    })
    state.user.nickname = name
    bus.emit('render')
  })

  bus.on('user:setServer', function (server) {
    state.user.server = server
    bus.emit('render')
  })

  bus.on('user:setRoom', function (room) {
    state.user.room = room
    bus.emit('render')
  })

  // @ to do: dont update state within function, move to ui model
  bus.on('user:toggleMute', function() {
    var defaultStreamId = state.peers.byId[state.user.uuid].defaultStream
    var defaultStream = state.media.byId[defaultStreamId].stream
    var audioTracks = defaultStream.getAudioTracks()
    if(state.user.muted===true) {
      audioTracks.forEach((track) => track.enabled = true)
      state.user.muted = false
    } else {
    //  track.enabled = false
      audioTracks.forEach((track) => track.enabled = false)
      state.user.muted = true
    }
    bus.emit('render')
  })

  bus.on('user:disconnect', () => {
    state.user.isOnline = false
  //  bus.emit('render')
  })
  bus.on('user:reconnect', () => {
    state.user.isOnline = true
  //  bus.emit('render')
  })


  // Initiate connection with signalling server
  bus.on('user:join', function (opts) {
  //  localStorage.setItem('uuid', state.user.uuid)
    localStorage.setItem('livelab-nickname', state.user.nickname)
    localStorage.setItem('livelab-room', state.user.room)
    window.history.pushState({}, 'room', '?room=' + state.user.room + window.location.hash)
  //  document.location = window.location.origin + window.location.pathname + '?room=' + state.user.room + window.location.hash

    bus.emit('peers:updatePeer', {
      peerId: state.user.uuid,
      nickname: state.user.nickname,
      requestMedia: opts.requestMedia
    })

    multiPeer = new MultiPeer({
      room: state.user.room,
      server: state.user.server,
      userData: {
        uuid: state.user.uuid,
        nickname: state.user.nickname
      },
      peerOptions: {
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
         }
      }
    }, bus)

    state.user.multiPeer = multiPeer

    //received initial list of peers from signalling server, update local peer information
    multiPeer.on('peers', function (peers) {
      state.user.loggedIn = true
      document.title = `LiveLab V1 - ${state.user.room}`
      state.user.statusMessage += 'Connected to server ' + state.user.server + '\n'
      bus.emit('render')
    })

    //received new media stream from remote peer
    multiPeer.on('stream', function (peerId, stream) {
      state.user.statusMessage += 'Received media from peer ' + peerId + '\n'
      bus.emit('media:addStream', {
        peerId: peerId,
        stream: stream
      })
    })

    multiPeer.on('close', function (id) {
      bus.emit('peers:removePeer', id)
    })

    // multiPeer.on('new peer', function (data) {
    //   // bus.emit('peers:updatePeer', {
    //   //   peerId: data.id
    //   // })
    // })

    //when first connected to remote peer, send user information
    multiPeer.on('connect', function ({id, pc}) {

      state.user.statusMessage += 'Connected to peer ' + id + '\n'
      bus.emit('peers:updatePeer', {peerId: id, pc: pc})
      // if user is set to receive media, request from remote peer
      if (state.peers.byId[state.user.uuid].requestMedia === true) {
        multiPeer.sendToPeer(id, JSON.stringify({ type: 'requestMedia', message: null }))
      }
      var userInfo = state.peers.byId[state.user.uuid]
      var infoObj = {}
      //
      userInfo.streams.forEach((streamId) => {
        infoObj[streamId] = xtend({}, state.media.byId[streamId])
      //  multiPeer.sendStreamToPeer(infoObj[streamId].stream, id)
        delete infoObj[streamId].stream
      })

      updateLocalInfo(id, {
        peer: xtend({}, userInfo),
        streams: infoObj
      })
      bus.emit('render')
    })

    //received data from remote peer
      multiPeer.on('data', function (data) {
        if (data.data){
          if (data.data.type === 'updatePeerInfo') {
            if('peer' in data.data.message) bus.emit('peers:updatePeer', data.data.message.peer)
            if('streams' in data.data.message) bus.emit('media:updateStreamInfo', data.data.message.streams)
            if('osc' in data.data.message) bus.emit('osc:updateRemoteOscInfo', {
              osc: data.data.message.osc,
              peerId: data.id
            })
          } else if (data.data.type === 'requestMedia') {
            var userInfo = state.peers.byId[state.user.uuid]
            var infoObj = {}
            userInfo.streams.forEach((streamId) => {
          //    infoObj[streamId] = xtend({}, state.media.byId[streamId])
              multiPeer.sendStreamToPeer(state.media.byId[streamId].stream, data.id)
        //      delete infoObj[streamId].stream
            })
          } else if(data.data.type=== 'chatMessage'){
           bus.emit('ui:receivedNewChat', data.data.message)
         } else if (data.data.type === 'osc'){
          bus.emit('osc:processRemoteOsc', data)
          bus.emit('render')
         }
       }
     })

    state.user.statusMessage = 'Contacting server ' + state.user.server + '\n'

    bus.emit('render')
  })

   bus.on('user:addStream', function(stream){
    if(multiPeer !== null) {
      multiPeer.addStream(stream)
      updateLocalInfo()
      bus.emit('render')
    }
  })

  bus.on('user:sendChatMessage', function(msg){
     multiPeer.sendToAll(JSON.stringify({type: 'chatMessage', message: msg}))
   })

   bus.on('user:sendToAll', function (msg) {
     multiPeer.sendToAll(msg)
   })


   bus.on('user:updateLocalInfo', () => {
     updateLocalInfo()
   })

//share local updates to track or user information with peers
function updateLocalInfo(id){
  if(multiPeer){
    var userInfo = state.peers.byId[state.user.uuid]
    var streamInfo = {}
    userInfo.streams.forEach((streamId) => {
      streamInfo[streamId] = xtend({}, state.media.byId[streamId])
      delete streamInfo[streamId].stream
    })
    var updateObj = {
      peer: userInfo,
      streams: streamInfo,
      osc: state.osc.local
    }
    if (id) {
      multiPeer.sendToPeer(id, JSON.stringify({ type: 'updatePeerInfo', message: updateObj }))
    } else {
      multiPeer.sendToAll(JSON.stringify({ type: 'updatePeerInfo', message: updateObj }))
    }

  }
}

}
