//const Video = require('./components/funvideocontainer.js')
const Video = require('./components_new/VideoObj.js')

const html = require('choo/html')
const grid = require('./videogrid.js')


module.exports = (state, emit) => {
  // return html`
  // <div class="w-100 h-100 mw-100 dt">
  //   <div style='resize:both;border:2px'></div>
  //    ${state.multiPeer.streams.map((stream, index) =>
  //      html`
  //       <div style='resize:both;overflow:auto' class='w5 h5 ma0'>
  //         ${Video({
  //          htmlProps: { class: 'w-100' },
  //          index: 'communication-' + index,
  //        //  track: (trackId in state.media.byId)  ? state.media.byId[trackId].track : null,
  //          stream: stream.stream,
  //          id: stream.stream.id,
  //          includeAudio: false
  //         })}
  //         ${stream.peer.nickname}
  //       </div>
  //       `
  //    )}
  // </div>
  // `
   const elements = state.multiPeer.streams.map((stream, index) => {
     return state.cache(Video, `video-${index}`).render(stream.stream, {objectFit: state.layout.select.objectFit.value})
   })
   //return html`<div>${elements}</div>`
   return html`<div>${grid({
     elements: elements,
     stretchToFit: false,
     ratio: '16:9'
   }, emit)}</div>`
   //return html`<div>${grid(state, emit)}</div>`
}
