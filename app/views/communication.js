//const Video = require('./components/funvideocontainer.js')
const Video = require('./components_new/VideoObj.js')

const html = require('choo/html')
const grid = require('./videogrid.js')

// @todo : use videoWidth rather than settings
// @todo: close popups on close

module.exports = (state, emit) => {
   const elements = state.multiPeer.streams.map((stream, index) => {
  //   let state.layout.settings.stretchToFit = state.layout.menu.state.layout.settings.stretchToFit
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
       </i>
       <i
         onclick=${()=> emit('layout:setSettings', 'switcherA', stream)}
         class="dim pointer ma2" title="set video output to switcher a"> A
       </i>
       `
     }
     if(stream.settings && stream.settings.audio) {
       audioSettings = `${Math.round(stream.settings.audio.sampleRate/1000)} khz`
       mute =
       html `<i
         class="mh1 fas ${stream.isAudioMuted ?'fa-microphone-slash light-red':'fa-microphone'}" title="">
       </i>`
     }

    let endStream = stream.isLocal ? html` <i
       onclick=${()=> emit('user:endStream', stream)}
       class="fas fa-times-circle dim pointer ma2" title="end stream">
     </i>` : ''
    //  state.user.isAudioMuted ?'fa-microphone-slash red':'fa-microphone'
    // <div class="absolute top-0 right-0">
    // ${windowOpen}
    // </div>
    return html`<div class='w-100 h-100 ${state.layout.settings.stretchToFit? '' : 'ba'}'>
      ${state.cache(Video, `video-${index}`).render(stream.stream, {objectFit: state.layout.settings.stretchToFit? 'cover': 'contain'})}
      <div class="absolute pa2 ph2 ma0 bottom-0 dark-gray" style="background:rgba(255, 255, 255, 0.5)">
       <span class="b mh2">${stream.peer.nickname}</span> ${videoMute} ${videoSettings} ${mute} ${audioSettings} ${windowOpen} ${endStream}
      </div>

     </div>`
   })
   //return html`<div>${elements}</div>`=
   // let numOpenPanels = Object.values(state.layout.panels).filter((val) => val).length
   // console.log(numOpenPanels)
   // let sideMargin = numOpenPanels > 1 ? 400 : 0
   let sideMargin = 0
   return html`<div>${grid({
     elements: elements,
     stretchToFit: state.layout.settings.stretchToFit,
     outerWidth: window.innerWidth - sideMargin,
     ratio: state.layout.settings.stretchToFit? '4:3': '16:9'
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
