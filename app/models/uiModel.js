// State information specifically related to the ui
// to do: unify ui information in this model
// const MAX_NUM_PEERS = 8 // to do: put this all in one place
var xtend = Object.assign
var LiveLabAudio = require('./../lib/LiveLabAudio.js')

module.exports = uiModel

const Audio = new LiveLabAudio()

function uiModel (state, bus) {
  state.ui = xtend({
    tabs: ['Communication', 'Show Control'],
    selectedTab: 0,
    communication: {},
    inspector: null,
    dragging: null,
    windows:
    [
      {
        track: null,
        open: false
      },
      {
        track: null,
        open: false
      },
      {
        track: null,
        open: false
      }
    ],
    chat: {
      messages: [

      ],
      current: ''
    }
  }, state.ui)

  bus.on('ui:dragStart', (mediaId) => {
    var media = state.media.byId[mediaId]
    state.ui.dragging = media
    bus.emit('render')
  })

  bus.on('ui:dragClear', () => {
    state.dragging = null
    bus.emit('render')
  })

  bus.on('ui:setTab', (index) => {
    state.ui.selectedTab = index
    bus.emit('render')
  })

  bus.on('ui:addPeer', function (opts) {
    var vol = 0.0
    if (opts.peerId === state.user.uuid) vol = 0.0
  //  var audio = opts
  //  var audio = null
    // if(opts.defaultAudio != null){
    //   audio = Audio.addTrack(opts.defaultAudio, vol)
    // }
    if (state.ui.communication[opts.peerId]) {
      state.ui.communication[opts.peerId].volume = vol
    } else {
      state.ui.communication[opts.peerId] = {
        volume: vol//,
      //  audioEl: audio
      }
    }
    console.log("ADDING PEER COMMUNICATION", state.ui.communication[opts.peerId])

  })

  // bus.on('ui:addAudio', function (opts) {
  //   console.log('ADDING AUDIO', opts, state.ui.communication)
  // //  var audioEl = Audio.addTrack(opts.track, state.ui.communication[opts.peerId].volume)
  //   state.ui.communication[opts.peerId].audioEl = audioEl
  // })

  bus.on('ui:toggleFullscreen', function () {
    state.ui.windows.fullscreen = !state.ui.windows.fullscreen
    bus.emit('render')
  })

  bus.on('ui:updateWindowTrack', function (opts) {
    state.ui.windows[opts.index].track = state.media.byId[opts.value].track
    bus.emit('render')
  })

  bus.on('ui:openWindow', function (index) {
    if (state.ui.windows[index].track === null) {
      // console.log("user default", state.peers, state.user.uuid)
      var trackId = state.peers.byId[state.user.uuid].defaultTracks.video
      state.ui.windows[index].track = state.media.byId[trackId].track
    }
    state.ui.windows[index].open = true
    bus.emit('render')
  })

  bus.on('ui:closeWindow', function (index) {
    state.ui.windows[index].open = false
    bus.emit('render')
  })

  bus.on('ui:toggleCommunicationVolume', function (peerId) {
    //console.log("setting volume", state.ui.communication, peerId)
    state.ui.communication[peerId].volume === 0 ? state.ui.communication[peerId].volume = 1 : state.ui.communication[peerId].volume = 0
  //  state.ui.communication[peerId].audioEl.volume = state.ui.communication[peerId].volume
    bus.emit('render')
  })

  // bus.on('ui:initCommunicationAudio', function () {
  //   state.peers.all.forEach((peerId) => {
  //       var audioId = state.peers.byId[peerId].defaultTracks.audio
  //       var track = state.media.byId[audioId]
  //       addAudioTrack(track)
  //   })
  // })

  bus.on('ui:removePeer', function (peerId) {
  //  document.body.removeChild(state.ui.communication[peerId].audioEl)
    delete state.ui.communication[peerId]
  })

  bus.on('ui:setInspectMedia', function (mediaId) {
    state.ui.inspector = mediaId
    // console.log('PEER CONNECTION', state.ui.inspector)
    bus.emit('render')
  })

  // Events related to UI
  bus.on('ui:sendChatMessage', function () {
    var chatObj = {
      peerId: state.user.uuid,
      message: state.ui.chat.current,
      date: Date.now()
    }
    bus.emit('user:sendChatMessage', chatObj)
    state.ui.chat.current = ''
    appendNewChat(chatObj)
  })

  bus.on('ui:receivedNewChat', function (chatObj) {
    appendNewChat(chatObj)
  })

  bus.on('ui:updateChat', function (text) {
    state.ui.chat.current = text
  })

  function appendNewChat (chatObj) {
    if (state.peers.byId[chatObj.peerId]) {
    //  console.log(state.ui.chat)
      chatObj.nickname = state.peers.byId[chatObj.peerId].nickname
      state.ui.chat.messages.push(chatObj)
    } else {
      console.log('USER NOT FOUND', chatObj)
    }
    bus.emit('render')
    var container = document.getElementById("scroll-container")

    // hacky way to scroll once rendered
    setTimeout(() => {
      container.scrollTop = container.scrollHeight
    }, 300)
  }
}
