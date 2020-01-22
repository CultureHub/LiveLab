'use strict'
const html = require('choo/html')
const RTCInspector = require('./components/RTCInspector.js')
const Video = require('./components/funvideocontainer.js')

module.exports = inspectorComponent

//const inspector = RTCInspector()
// <!--${inspector.render({
//   htmlProps: {
//
//   },
//   pc: state.ui.inspector.pc,
//   trackId: state.ui.inspector.trackId
// })}-->
//const previewVid = VideoEl()

function inspectorComponent (state, emit) {
  var media = state.media.byId[state.ui.inspector.trackId]
  return  html`<div class="overflow-scroll pa0 w-100" style="word-wrap: break-word;">
    ${media.track.kind==='video' ? Video({
      htmlProps: {
        class: 'h4 w4'
      },
      index: 'inspector',
      track: (state.ui.inspector.trackId in state.media.byId)  ? state.media.byId[state.ui.inspector.trackId].track : null,
      id: (state.ui.inspector.trackId in state.media.byId) ?  state.media.byId[state.ui.inspector.trackId].track.id : null
    }) : null }

    ${Object.keys(media.settings).map((setting) => html`<div><span class="b">${setting}:</span> ${media.settings[setting]}</div>`)}

  ${ media.peerId ===  state.user.uuid ? html`<div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('peers:hangupTrack', state.ui.inspector.trackId))}>Hangup</div>` : null }

  </div>`
}
