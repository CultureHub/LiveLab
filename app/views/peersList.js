const html = require('choo/html')


const streamDetails = (info) => {
  let settings = info.settings
  let videoSettings = ''
  let audioSettings = ''
  let mute = ''
  let videoMute = ''
  if(settings && settings.video) {
    videoSettings = `${settings.video.width}x${settings.video.height} ${settings.video.frameRate}fps`
    videoMute = html `<i
      class="mh1 fas ${info.isVideoMuted ? 'fa-video light-red':'fa-video'}" title="">
    </i>`
  }
  if(settings && settings.audio) {
    audioSettings = `${Math.round(settings.audio.sampleRate/1000)} khz`
    mute =
    html `<i
      class="mh1 fas ${info.isAudioMuted ?'fa-microphone-slash light-red':'fa-microphone'}" title="">
    </i>`
  }
  return html`<div>${videoMute} ${videoSettings} ${mute} ${audioSettings}</div>`
}



const peerDetails = ( peer ) =>  html`<div class="pb2">
  <div class="dib w3 v-top"> ${peer.nickname} </div>
  <div class="dib">
    ${Object.entries(peer.streamInfo).map(([id, info]) => streamDetails(info))}
  </div>
</div>
`

module.exports = (multiPeer) => {

  return html`
  <div class="">
      ${peerDetails(multiPeer.user)}
      ${Object.entries(multiPeer.peers).map(([id, peer]) =>peerDetails(peer))}
  </div>
  `
}
