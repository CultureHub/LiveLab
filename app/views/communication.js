//const Video = require('./components/funvideocontainer.js')
const Video = require('./components_new/VideoObj.js')

const html = require('choo/html')
const grid = require('./videogrid.js')

// @todo : use videoWidth rather than settings
// @todo: close popups on close

module.exports = (state, emit) => {
   const elements = state.multiPeer.streams.map((stream, index) => {
     let videoSettings = ''
     let windowOpen = ''
     if(stream.settings && stream.settings.video) {
       videoSettings = `${stream.settings.video.width}x${stream.settings.video.height} ${stream.settings.video.frameRate}fps`
       windowOpen =
       html `<i
         onclick=${()=> openWindow(stream.stream, stream.peer.nickname, stream.settings.video)}
         style="margin-left:6px" class="far fa-clone dim pointer" title="open window">
       </i>`
     }
    return html`<div class='w-100 h-100'>
      ${state.cache(Video, `video-${index}`).render(stream.stream, {objectFit: 'cover'})}
      <div class="absolute pa1 ph2 ma1 bottom-0" style="background:rgba(0, 0, 0, 0.5)">
        ${stream.peer.nickname} ${videoSettings} ${windowOpen}
      </div>
     </div>`
   })
   //return html`<div>${elements}</div>`
   return html`<div>${grid({
     elements: elements,
     stretchToFit: false,
     ratio: '16:9'
   }, emit)}</div>`
   //return html`<div>${grid(state, emit)}</div>`
}

function openWindow(stream, title, settings) {
  var windowSettings = `popup=yes,menubar=no,titlebar=no,location=no,scrollbars=no,status=no,toolbar=no,location=no,chrome=yes,width=${settings.width},height=${settings.height}`;
 var win = window.open('', JSON.stringify(Date.now()), windowSettings)
 // specifying a name for the second setting returns a reference to the same window, could be useful for setting output
// var win = window.open('', 'hey', windowSettings)
  win.document.body.style.background = 'black'
  win.document.title = title
  if(stream) {
    var vid = win.document.createElement('video')
    vid.autoplay = "autoplay"
    vid.loop = "loop"
    vid.muted = "muted"
    // vid.setAttribute('controls', false)
    // vid.setAttribute('allowFullScreen', true)
    vid.style.width = "100%"
    vid.style.height = "100%"
    vid.style.objectFit = "contain"
  //  vid.setAttribute('muted', true)
    win.document.body.style.padding = "0px"
    win.document.body.style.margin = "0px"
    win.document.body.appendChild(vid)
    vid.srcObject = stream
  }
//  var vid = this.video
}
