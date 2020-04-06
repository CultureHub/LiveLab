const shortid = require('shortid')
const MultiPeer = require('./../lib/MultiPeer.js')

module.exports = (state, emitter) => {
  state.user = {
    uuid: shortid.generate(), // for dev purposes, always regenerate id
    room: state.query.room || localStorage.getItem('livelab-room') || 'zebra',
    server: 'https://livelab.app:6643',
    version: '1.2.5',
    loggedIn: false,
    nickname: localStorage.getItem('livelab-nickname') || '',
    statusMessage: '',
    multiPeer: null,
    muted: false,
    isOnline: true,
    tracks: []
  }

  state.multiPeer = new MultiPeer({}, emitter)

  emitter.on('user:setRoom', function (room) {
    state.user.room = room
    emitter.emit('render')
  })

  emitter.on('user:setServer', function (server) {
    state.user.server = server
    emitter.emit('render')
  })
}
