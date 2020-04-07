module.exports = (state, emitter) => {
  state.media = {}

  state.peers = {}

  // // Add a new media stream. Stream can have at most one audio track and one video track. More than one audio or video should be added as a separate stream.
  // emitter.on('media:initLocalMedia', ({ peerId, stream, nickname }) => {
  // //   if(_opts.stream) {
  // //     var opts = Object.assign({}, {
  // //       stream: _opts.stream,
  // //       peerId: state.user.uuid,
  // //       name: 'default',
  // //       settings: getSettingsFromStream(_opts.stream)
  // //     }, _opts)
  // //     state.media[_opts.stream.id] = opts
  // //     state.peers[state.user.uuid].streams.push(_opts.stream)
  // //   } else {
  // //     emitter.emit('log:error', 'No stream!', _ops)
  // //   }
  // // })
  // //
  // // emitter.on('peers:addNewPeer', (_opts) => {
  // //   if(_opts.peerId) {
  // //     state.peers[_opts.peerId] = Object.assign({}, {
  // //       streams: [],
  // //       nickname: ''
  // //     }, _opts)
  // //   }
  // // })
  //
  // let updateStream = (_opts) => {
  // //  if(_opts.stream.id)
  // }
  //
  // var messenger = state.multiPeer.messenger
  //
  // // on connect, request media from peer (unless send only)
  // state.multiPeer.on('connect', ({ id }) => {
  // //  console.log('connected', peer)
  //   if(state.user.requestMedia) messenger.sendToPeer('request media', null, id)
  // })
  //
  // state.multiPeer.on('stream', (id, stream) => {
  //   //
  //   console.log('got stream', id, stream)
  // })
  //
  // // when media is requested, send media to peer
  // messenger.on('request media', (data, id) => {
  //   console.log(' media requested', id)
  //   state.peers[state.user.uuid].streams.forEach((stream) => {
  //     state.multiPeer.sendStreamToPeer(stream, id)
  //   })
  // })
}

function getSettingsFromStream(stream) {
  var settings = {}
  if (stream && stream !== null) {
    stream.getTracks().forEach((track) => settings[track.kind] = track.getSettings())
  }
  return settings
}
