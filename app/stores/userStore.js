const shortid = require('shortid')
const MultiPeer = require('./../lib/MultiPeer.js')

module.exports = (state, emitter) => {

  state.user = {
    uuid: shortid.generate(), // for dev purposes, always regenerate id
    nickname: localStorage.getItem('livelab-nickname') || '',
    muted: false,
    isOnline: true,
    version: '1.3.0',
    loggedIn: false,
    isOnline: true,
    // room: state.query.room || localStorage.getItem('livelab-room') || 'zebra',
    room: state.query.room,
   server: 'https://livelab.app:6643',
    // server: 'https://live-lab-v1.glitch.me',
    statusMessage: '',
    requestMedia: true,
    isAudioMuted: false,
    isVideoMuted: false
  }


  state.multiPeer = new MultiPeer({}, emitter)



  emitter.on('user:join', function ({ room, server, nickname, stream, requestMedia }) {
    console.log('room is ', state.query.room)
    if (state.query.room){
      state.user.room = state.query.room
    } else {
      state.user.room = shortid.generate()
    }
    state.user.server = server
    state.user.nickname = nickname

    localStorage.setItem('livelab-nickname', state.user.nickname)
    localStorage.setItem('livelab-room', state.user.room)
    window.history.pushState({}, 'room', '?room=' + state.user.room + window.location.hash)

    // emitter.emit('peers:addNewPeer', {
    //   peerId: state.user.uuid,
    //   nickname: state.user.nickname
    // })

  //   state.peers[state.user.uuid] = {
  //     peerId: state.user.uuid,
  //     nickname: state.user.nickname,
  //     streams: []
  // //    requestMedia: requestMedia
  //   }

  //  emitter.emit('media:initLocalMedia', { peerId: state.user.uuid, stream: stream, nickname: state.user.nickname })

    state.multiPeer.init({
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
      },
      stream: stream
    })

  //  state.multiPeer.addStream(stream)
    state.user.loggedIn = true

    const setAudioMuted = (muteVal) => {
      if(state.multiPeer.defaultStream) {
        const tracks = state.multiPeer.defaultStream.getAudioTracks()
        tracks.forEach((track) => {
          track.enabled = !muteVal
        })
        state.multiPeer.updateLocalStreamInfo(state.multiPeer.defaultStream.id, { isAudioMuted: state.user.isAudioMuted})

      }
    }

    const setVideoMuted = (muteVal) => {
      if(state.multiPeer.defaultStream) {
        const tracks = state.multiPeer.defaultStream.getVideoTracks()
        tracks.forEach((track) => {
          track.enabled = !muteVal
        })
        state.multiPeer.updateLocalStreamInfo(state.multiPeer.defaultStream.id, { isVideoMuted: state.user.isVideoMuted})

      }
    }

    emitter.on('user:toggleAudioMute', () => {
      state.user.isAudioMuted = !state.user.isAudioMuted
      setAudioMuted(state.user.isAudioMuted)
      emitter.emit('render')
    })

    emitter.on('user:toggleVideoMute', () => {
      state.user.isVideoMuted = !state.user.isVideoMuted
      setVideoMuted(state.user.isVideoMuted)
      emitter.emit('render')
    })

    // to do: media addTracks
    emitter.emit('render')
  })

  //received initial list of peers from signalling server, update local peer information
  state.multiPeer.on('ready', function (peers) {
    // state.user.loggedIn = true
    document.title = `LiveLab V1 - ${state.user.room}`
    state.user.statusMessage += 'Connected to server ' + state.user.server + '\n'
    emitter.emit('render')
  })

  state.multiPeer.on('update', () => { emitter.emit('render')})

  emitter.on('user:shareScreen', () => {
    startCapture({})
  })

  async function startCapture(displayMediaOptions) {
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
      state.multiPeer.addStream(stream)
    //  var settings = getSettingsFromStream(stream)
      emitter.emit('render')
    } catch(err) {
      emitter.emit('log:warn', err)
    }
    return stream;
  }

  // emitter.on('user:setServer', function (server) {
  //   state.user.server = server
  //   emitter.emit('render')
  // })
}
