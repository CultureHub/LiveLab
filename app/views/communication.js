//const Video = require('./components/funvideocontainer.js')
const Video = require('./components_new/VideoObj.js')

const html = require('choo/html')
const grid = require('./videogrid.js')


module.exports = (state, emit) => {
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
