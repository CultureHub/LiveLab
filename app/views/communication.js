//const Video = require('./components/funvideocontainer.js')
const Video = require('./components_new/VideoObj.js')

const html = require('choo/html')
const grid = require('./videogrid.js')

// @todo : use videoWidth rather than settings
// @todo: close popups on close

module.exports = (state, emit) => {
   const elements = state.multiPeer.streams.map((stream, index) => {
  //   let state.layout.settings.stretchToFit = state.layout.menu.state.layout.settings.stretchToFit
     let info = ''
     if(state.layout.settings.showCommunicationInfo === true) {
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
           class="fas fa-external-link-alt dim pointer ma2" title="open video into it's own window">
         </i>
         ${['a', 'b', 'c', 'd'].splice(0, state.layout.settings.numberOfSwitchers).map((switcher) => html
         `<i
           onclick=${()=> emit('layout:setSwitcher', switcher, stream)}
           class="dim pointer ma2 b ttu" title="send video to switcher a">${switcher}
         </i>`
         )}
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
         class="fas fa-trash-alt dim pointer ma2" title="end stream">
       </i>` : ''
       info = html`  <div class="absolute pa2 ph2 ma2 bottom-0 video-info" style="text-shadow: 2px 2px 3px rgba(213, 0, 143, 1);/*mix-blend-mode:difference*/">
          <span class="b mh2">${stream.peer.nickname}</span> ${videoMute} ${mute} ${windowOpen} ${endStream}
         </div>`
    }
    //  state.user.isAudioMuted ?'fa-microphone-slash red':'fa-microphone'
    // <div class="absolute top-0 right-0">
    // ${windowOpen}
    // </div>
      // <div class="absolute pa2 ph2 ma0 bottom-0 dark-gray" style="background:rgba(255, 255, 255, 0.5)">
      //background:rgba(213, 0, 143, 0.8);
    return html`<div class='w-100 h-100 video-container ${state.layout.settings.stretchToFit? '' : 'ba'}'>
      ${state.cache(Video, `video-${index}`).render(stream.stream, {objectFit: state.layout.settings.stretchToFit? 'cover': 'contain'})}
      ${info}
     </div>`
   })
   //return html`<div>${elements}</div>`=
   let numOpenPanels = Object.values(state.layout.panels).filter((val) => val == true).length
   console.log(numOpenPanels)
   // let sideMargin = numOpenPanels > 1 ? 400 : 0

   // resize video grid based on screen dimensions
   let sideMargin = 0
   let bottomMargin = 0



   if(!(state.layout.collapsed === 0)) {
     // if on small screen, make margin on bottom rather than side  @todo: use EM rather than pixels
     if(window.innerWidth < 480) {
       bottomMargin = 52*2
     } else {
       // get position of last panel in order to calculate grid space
       const panels = document.getElementsByClassName('panel')
      // panels[panels.length -1].getBoundingClientRect().x
       if(panels.length > 0) {
         console.log('panels are', panels)
         let panelX = window.innerWidth
         for(let panel of panels) {
           const bounds = panel.getBoundingClientRect()
           // get element in top left corner
           if (bounds.y <= 0) {
             if(bounds.x < panelX) panelX = bounds.x
           }
         }
         // const panelX =  panels[panels.length -1].getBoundingClientRect().x
         sideMargin  = window.innerWidth -panelX
       }
      // if(state.layout.settings.columnLayout && numOpenPanels > 0) sideMargin += 384
     }
   }

   return html`<div class="w-100 h-100 fixed top-0 left-0">${grid({
     elements: elements,
     stretchToFit: state.layout.settings.stretchToFit,
     outerWidth: window.innerWidth - sideMargin,
     outerHeight: window.innerHeight - bottomMargin,
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
