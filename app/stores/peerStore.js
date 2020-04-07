// module.exports = (state, emitter) => {
//   state.peers = { }
//
//   emitter.on('peers:addNewPeer', (_opts) => {
//     if(_opts.peerId) {
//       state.peers[_opts.peerId] = Object.assign({}, {
//         streams: [],
//         nickname: ''
//       }, _opts)
//     }
//   })
//
//   emitter.on('peers:addStreamToPeer', (stream, peerId) => {
//
//   })
//
//   state.multiPeer.on('connect', ({ id }) => {
//   //  console.log('connected', peer)
//     if(state.user.requestMedia) messenger.sendToPeer('request media', null, id)
//   })
//
//
// }
