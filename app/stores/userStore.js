const shortid = require('shortid')
const MultiPeer = require('./../lib/MultiPeer.js')

module.exports = (state, emitter) => {
  state.user = {
    uuid: shortid.generate(), // for dev purposes, always regenerate id
    nickname: localStorage.getItem('livelab-nickname') || '',
    muted: false,
    isOnline: true,
    version: '1.2.5',
    loggedIn: false,
    isOnline: true,
    room: state.query.room || localStorage.getItem('livelab-room') || 'zebra',
    server: 'https://livelab.app:6643',
    statusMessage: '',
    requestMedia: true
  }


  state.multiPeer = new MultiPeer({}, emitter)

  emitter.on('user:join', function ({ room, server, nickname, stream, requestMedia }) {
    state.user.room = room
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
      }
    })

    state.multiPeer.addStream(stream)
    // to do: media addTracks
    emitter.emit('render')
  })

  //received initial list of peers from signalling server, update local peer information
  state.multiPeer.on('ready', function (peers) {
    state.user.loggedIn = true
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
      var settings = getSettingsFromStream(stream)
      // bus.emit('media:addStream', {
      //   stream: stream,
      //   streamId: stream.id,
      //   peerId: state.user.uuid,
      //   isDefault: false,
      //   name: settings.video.displaySurface,
      //   settings: settings
      // })
      // bus.emit('user:addStream', stream)
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
