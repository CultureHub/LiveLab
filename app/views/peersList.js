const html = require('choo/html')



module.exports = (multiPeer) => {

  return html`
  <div class="">
      ${multiPeer.user.nickname}
      <div class="flex mv1 pv2">
      ${Object.entries(multiPeer.peers).map(([id, peer]) => html `<div class='br pr2'>${peer.nickname}</div>
        <div>${Object.entries(peer.streamInfo).map(([id, info]) => {
          let settings = info.settings
          console.log('SETTINGS', settings, peer, id)
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
          // return 'stream info!!'
        })}</div>
        </div>
      `)}
  </div>
  `
}
