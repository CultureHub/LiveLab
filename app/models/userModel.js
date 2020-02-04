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
    room: 'test',
//modify start---
    server: 'https://livelab.app:6643',
    //server: 'https://live-lab-v1.glitch.me/',
  //modify ends---
    loggedIn: false,
    nickname: "tong",
    statusMessage: '',
    multiPeer: null,
    muted: false,
  }, state.user)


  //osc.on
//login page ui events
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

  bus.on('user:toggleMute', function() {
    var trackId = state.peers.byId[state.user.uuid].defaultTracks.audio
    var track = state.media.byId[trackId].track
    if(state.user.muted===true) {
      track.enabled = true
      state.user.muted = false
    } else {
      track.enabled = false
      state.user.muted = true
    }
    bus.emit('render')
  })

  bus.on('user:setInspectMedia', function(trackId){
    var track = state.media.byId[trackId]
    console.log("inspecting ", trackId, state.ui.inspector.trackId)


    if(trackId === state.ui.inspector.trackId)   {
      bus.emit('ui:updateInspectorTrack',{
        trackId: null,
        pc: null
      })
    } else {
      if(track.peerId===state.user.uuid) {
        // if track is local, if there is a peer connection, show stats for whatever peer connectionr
        // to do: show information about peers shared with, etc
        if(Object.keys(multiPeer.peers).length > 0){
          bus.emit('ui:updateInspectorTrack', {
            trackId: trackId,
            pc: multiPeer.peers[Object.keys(multiPeer.peers)[0]]._pc
          })
        } else {
          bus.emit('ui:updateInspectorTrack', {
            trackId: trackId,
            pc: null
          })
        }
      } else {
        if(track.peerId in multiPeer.peers){
          bus.emit('ui:updateInspectorTrack', {
            pc: multiPeer.peers[track.peerId]._pc,
            trackId: trackId
          })
        }
      }
    }

    bus.emit('render')
  })

  // Initiate connection with signalling server
  bus.on('user:join', function () {
    localStorage.setItem('uuid', state.user.uuid)

    bus.emit('peers:updatePeer', {
      peerId: state.user.uuid,
      nickname: state.user.nickname
    })

    //QUICK AND DIRTY TEST of sharing media streams between windows in nwjs

    // var testPopup = window.open(null, "SHOW", 'fullscreen=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no')
    //
    //   var testVid = testPopup.document.createElement("video")
    // var vid = document.getElementsByTagName("video")[0]
    //
    // var src = vid.srcObject
    //   console.log("VID EL", vid, src)
    //   testVid.srcObject = src
    //   testVid.autoplay = true
    //   testPopup.document.body.appendChild(testVid)
    //   console.log(testPopup)

    // testing osc



    multiPeer = new MultiPeer({
      room: state.user.room,
      server: state.user.server,
      stream: getLocalCommunicationStream(),
      userData: {
        uuid: state.user.uuid,
        nickname: state.user.nickname
      }
    })

  //  if(typeof nw == "object"){
    // osc channels



    //received initial list of peers from signalling server, update local peer information
    multiPeer.on('peers', function (peers) {
      state.user.loggedIn = true
      document.title = `LiveLab V1 - ${state.user.room}`
      state.user.statusMessage += 'Connected to server ' + state.user.server + '\n'
    /*  var peersInfo = peers.map(function (peer) {
        var peerInfo = {peerId: peer}
        if (peer === state.user.uuid) peerInfo.nickname = state.user.nickname
        return peerInfo
      })
      bus.emit('peers:setAllPeers', peersInfo)*/
      bus.emit('render')
    })

    //received new media stream from remote peer
    multiPeer.on('stream', function (peerId, stream) {
      console.log("STREAM", stream.getTracks())
      state.user.statusMessage += 'Received media from peer ' + peerId + '\n'
      bus.emit('media:addTracksFromStream', {
        peerId: peerId,
        stream: stream,
        isDefault: true
      })
    })

    multiPeer.on('close', function (id) {
      bus.emit('peers:removePeer', id)
    })
    multiPeer.on('new peer', function (data) {
     console.log("NEW REMOTE PEER", data)
      bus.emit('peers:updatePeer', {
        peerId: data.id
      })
    })

    //when first connected to remote peer, send user information
    multiPeer.on('connect', function (id) {
      console.log("CONNECT", id)
      state.user.statusMessage += 'Connected to peer ' + id + '\n'
      bus.emit('peers:updatePeer', {peerId: id})
      var userInfo = state.peers.byId[state.user.uuid]
      var infoObj = {}
      userInfo.tracks.forEach((trackId) => {
        infoObj[trackId] = xtend({}, state.media.byId[trackId])
        delete infoObj[trackId].track
      })
      //for testing purposes, automatically set inspector info
      updateLocalInfo(id, {
        peer: xtend({}, userInfo),
        tracks: infoObj
      })
      bus.emit('render')
    })

    //received data from remote peer
      multiPeer.on('data', function (data) {
        // console.log("RECEIVED", data)
        // data is updated user and track information
        if (data.data){
          if (data.data.type === 'updatePeerInfo') {
            if('peer' in data.data.message) bus.emit('peers:updatePeer', data.data.message.peer)
            if('tracks' in data.data.message) bus.emit('media:updateTrackInfo', data.data.message.tracks)
            if('osc' in data.data.message) bus.emit('osc:updateRemoteOscInfo', {
              osc: data.data.message.osc,
              peerId: data.id
            })
          } else if(data.data.type=== 'chatMessage'){
           console.log("RECEIVED CHAT MESSAGE", data)
           bus.emit('ui:receivedNewChat', data.data.message)
         } else if (data.data.type === 'osc'){
          // state.user.osc.
        //  console.log("received osc", data)
          //processRemoteOsc(data)
          bus.emit('osc:processRemoteOsc', data)
          bus.emit('render')
        //  console.log("received osc ", data.data)
         }
       }
     })

    state.user.statusMessage = 'Contacting server ' + state.user.server + '\n'

    bus.emit('render')
  })



  bus.on('user:updateBroadcastStream', function(){
    if(multiPeer !== null) {
      var stream = getCombinedLocalStream()
      console.log("UPDATED STREAM", stream.getTracks())
      multiPeer.stream = stream
      multiPeer.reinitAll()
    }
    bus.emit('render')
  })

  bus.on('user:sendChatMessage', function(msg){
     multiPeer.sendToAll(JSON.stringify({type: 'chatMessage', message: msg}))
   })

   bus.on('user:sendToAll', function (msg) {
     multiPeer.sendToAll(msg)
   })

  function getLocalCommunicationStream () {
    var tracks = []
    if (state.devices.default.previewTracks.audio !== null) {
      var track = state.devices.default.previewTracks.audio.clone()
          tracks.push(track)
      bus.emit('media:addTrack', {
        track: track,
        trackId: track.id,
        peerId: state.user.uuid, // should be user peerId ?
      //  constraints: {}, //local default constrains
        isDefault: true,
        kind: track.kind
      })
    }
    if (state.devices.default.previewTracks.video !== null) {
      var track = state.devices.default.previewTracks.video.clone()
          tracks.push(track)
      bus.emit('media:addTrack', {
        track: track,
        trackId: track.id,
        peerId: state.user.uuid, // should be user peerId ?
      //  constraints: {}, //local default constrains
        isDefault: true,
        kind: track.kind
      })
    }
    return new MediaStream(tracks)
  }

//share local updates to track or user information with peers
// to do: (maybe?) only update track info that has changed
function updateLocalInfo(id){
  if(multiPeer){
    var userInfo = state.peers.byId[state.user.uuid]
    var trackInfo = {}
    userInfo.tracks.forEach((trackId) => {
      trackInfo[trackId] = xtend({}, state.media.byId[trackId])
      delete trackInfo[trackId].track
    })
    var updateObj = {
      peer: userInfo,
      tracks: trackInfo,
      osc: state.osc.local
    }
  //  console.log("SHARING USER INFO", updateObj)
    if (id) {
      multiPeer.sendToPeer(id, JSON.stringify({ type: 'updatePeerInfo', message: updateObj }))
    } else {
      // send to all
    }

  }
}
// returns a stream that contains all local tracks. Adds tracks one by one using addTrack() because
// of bug (when all are added at once in an array, tracks with duplicate labels but not duplicate ids are eliminated)
  function getCombinedLocalStream () {
    var tracks = []
    console.log('tracks are', state.peers.byId[state.user.uuid].tracks)
    var startTrack = state.peers.byId[state.user.uuid].tracks[0]
    tracks.push(state.media.byId[startTrack].track)
    var stream = new MediaStream(tracks)
    state.peers.byId[state.user.uuid].tracks.forEach(function (trackId) {
      stream.addTrack(state.media.byId[trackId].track)
    })
    return stream
  }
}
