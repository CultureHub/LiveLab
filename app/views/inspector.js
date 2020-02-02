'use strict'
const html = require('choo/html')
const RTCInspector = require('./components/RTCInspector.js')
const Video = require('./components/funvideocontainer.js')
const panel = require('./components/panel.js')


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
  if(state.ui.inspector.trackId !== null){
    var media = state.media.byId[state.ui.inspector.trackId]
    var title = html`<span class="i">Track Info: ${state.peers.byId[media.peerId].nickname}-${media.name} </span> `

     // ${media.track.kind==='video' ? Video({
     //    htmlProps: {
     //      class: 'h4 w4'
     //    },
     //    index: 'inspector',
     //    track: (state.ui.inspector.trackId in state.media.byId)  ? state.media.byId[state.ui.inspector.trackId].track : null,
     //    id: (state.ui.inspector.trackId in state.media.byId) ?  state.media.byId[state.ui.inspector.trackId].track.id : null
     //  }) : null }
  var innerContents =  html`<div class="pa2 w-100" style="word-wrap: break-word;font-size:11px">
    ${Video({
       htmlProps: {
         class: 'h4 w4'
       },
       index: 'inspector',
       stream: state.media.byId[state.ui.inspector.streamId],
       id: state.ui.inspector.streamId
     })}
      ${Object.keys(media.settings).map((kind) => html`
        <div class="pb1"><span class="i">${kind}: </span>
        ${Object.keys(media.settings[kind]).map((setting) => html`<div class="pb1"><span class="i">${setting}:${media.settings[kind][setting]} </span>` )}
      </div>`)}

    ${ media.peerId ===  state.user.uuid ? html`<div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('peers:hangupTrack', state.ui.inspector.trackId))}>Hangup</div>` : null }

    </div>`
    return panel(
      {
        htmlProps: {
          class: "w-100"
        },
        contents: innerContents,
        closable: true,
        header:   title,
        onClose: () => { emit('user:setInspectMedia', state.ui.inspector.trackId) }
      }
    )
  } else {
    return ''
  }
}
