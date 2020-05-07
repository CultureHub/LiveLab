//const Video = require('./components/funvideocontainer.js')
const Video = require('./components_new/VideoObj.js')

const html = require('choo/html')
const grid = require('./videogrid.js')


module.exports = (state, emit) => {
   const elements = state.multiPeer.streams.map((stream, index) => {
     let videoSettings = ''
     if(stream.settings && stream.settings.video) videoSettings = `${stream.settings.video.width}x${stream.settings.video.height} ${stream.settings.video.frameRate}fps`
    return html`<div class='w-100 h-100'>
      ${state.cache(Video, `video-${index}`).render(stream.stream, {objectFit: state.layout.select.objectFit.value})}
      <div class="absolute pa1 ph2 ma1 bottom-0" style="background:rgba(0, 0, 0, 0.5)">${stream.peer.nickname} ${videoSettings}</div>
     </div>`
   })
   //return html`<div>${elements}</div>`
   return html`<div>${grid({
     elements: elements,
     stretchToFit: state.layout.select.stretchToFit.value,
     ratio: '16:9'
   }, emit)}</div>`
   //return html`<div>${grid(state, emit)}</div>`
}
