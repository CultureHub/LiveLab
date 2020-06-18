const html = require('choo/html')

const streamDetails = info => {
  const settings = info.settings
  let videoSettings = ''
  let audioSettings = ''
  let mute = ''
  let videoMute = ''
  if (settings && settings.video) {
    videoSettings = `${settings.video.width}x${settings.video.height} ${Math.round(
      settings.video.frameRate
    )}fps`
    videoMute = html`<i
      class="mh1 fas ${info.isVideoMuted
      ? 'fa-video-slash dark-pink'
      : 'fa-video'}" title="">
    </i>`
  }
  if (settings && settings.audio) {
    audioSettings = `${Math.round(settings.audio.sampleRate / 1000)} khz`
    mute = html`<i
      class="mh1 fas ${info.isAudioMuted
      ? 'fa-microphone-slash dark-pink'
      : 'fa-microphone'}" title="">
    </i>`
  }
  return html`<div class="mv1">${'>>'} ${info.name} ${videoMute} ${videoSettings} ${mute} ${audioSettings}</div>`
}

const peerDetails = (peer, isLocal = false) => html`<div class="pb2">
  <div class="dib w-100 v-top pt2"> ${peer.nickname} ${isLocal
  ? '(you)'
  : ''}</div>
  <div class="dib">
    ${Object
  .entries(peer.streamInfo)
  .map(([id, info]) => streamDetails(info))}
  </div>
</div>
`

module.exports = multiPeer => {
  return html`
  <div class="">
      ${peerDetails(multiPeer.user, true)}
      ${Object
    .entries(multiPeer.peers)
    .map(([id, peer]) => peerDetails(peer))}
  </div>
  `
}
