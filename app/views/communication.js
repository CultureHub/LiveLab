//const Video = require('./components/funvideocontainer.js')
const Video = require('./components_new/VideoObj.js')

const html = require('choo/html')
const grid = require('./videogrid.js')

// @todo : use videoWidth rather than settings
// @todo: close popups on close

module.exports = (state, emit) => {
   const elements = state.multiPeer.streams.map((stream, index) => {
     let videoSettings = ''
     let audioSettings = ''
     let windowOpen = ''
     let mute = ''
     let videoMute = ''
     if(stream.settings && stream.settings.video) {
       videoSettings = `${stream.settings.video.width}x${stream.settings.video.height} ${stream.settings.video.frameRate}fps`
       videoMute = html `<i
         class="mh1 fas ${stream.isVideoMuted ? 'fa-video light-red':'fa-video'}" title="">
       </i>`
       windowOpen =
       html `
       <span class="mh2"> | </span>
       <i
         onclick=${()=> openWindow(stream.stream, stream.peer.nickname, stream.settings.video)}
         class="far fa-clone dim pointer ma2" title="open video into it's own window">
       </i>`
     }
     if(stream.settings && stream.settings.audio) {
       audioSettings = `${Math.round(stream.settings.audio.sampleRate/1000)} khz`
       mute =
       html `<i
         class="mh1 fas ${stream.isAudioMuted ?'fa-microphone-slash light-red':'fa-microphone'}" title="">
       </i>`
     }
    //  state.user.isAudioMuted ?'fa-microphone-slash red':'fa-microphone'
    // <div class="absolute top-0 right-0">
    // ${windowOpen}
    // </div>
    return html`<div class='w-100 h-100'>
      ${state.cache(Video, `video-${index}`).render(stream.stream, {objectFit: 'cover'})}
      <div class="absolute pa2 ph2 ma1 bottom-0 dark-gray" style="background:rgba(255, 255, 255, 0.5)">
       <span class="b mh2">${stream.peer.nickname}</span> ${videoMute} ${videoSettings} ${mute} ${audioSettings} ${windowOpen}
      </div>

     </div>`
   })
   //return html`<div>${elements}</div>`
   return html`<div>${grid({
     elements: elements,
     stretchToFit: state.layout.menu.stretchToFit,
     ratio: state.layout.menu.stretchToFit? '4:3': '16:9'
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
    vid.style.width = "100%"
    vid.style.height = "100%"
    vid.style.objectFit = "contain"
    win.document.body.style.padding = "0px"
    win.document.body.style.margin = "0px"
    win.document.body.appendChild(vid)
    vid.srcObject = stream
  }
//  var vid = this.video
}
