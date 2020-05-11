const html = require('choo/html')

menuItem = ({ title, onclick, icon, selected = false }) => html`
<i class="fas ${icon} ${selected?"bg-mid-gray" : "bg-dark-gray"} dim pointer pa3 db" style="display:block" title=${title} onclick= ${onclick}
 ></i>
`

// <i
//  class="fas fa-desktop dim pointer ma3 db"
//  style="display:block"
//  title="Share Screen"
//  onclick= ${() => emit('user:shareScreen')}
//  ></i>




module.exports = (state, emit) => {
  return html`
  <div class="fixed bottom-0 right-0 pa2">
      ${menuItem({
        icon:  state.user.isVideoMuted ?'fa-video red':'fa-video',
        title: "Mute your video",
        onclick: () => emit('user:toggleVideoMute')
      })}
      ${menuItem({
        icon:  state.user.isAudioMuted ?'fa-microphone-slash red':'fa-microphone',
        title: "Mute your microphone",
        onclick: () => emit('user:toggleAudioMute')
      })}
      ${menuItem({
        icon: 'fa-desktop',
        title: "Share screen",
        onclick: () => emit('user:shareScreen')
      })}
      ${menuItem({
        icon: 'fa-th-large',
        title: "Stretch videos to fit screen",
        onclick: () => emit('layout:toggleMenuItem', 'stretchToFit'),
        selected: state.layout.menu.stretchToFit
      })}
      <br>
      ${menuItem({
        icon: 'fa-sliders-h',
        title: "Toggle volume controls",
        onclick: () => emit('layout:toggleMenuItem', 'audio'),
        selected: state.layout.menu.audio
        // classes: state.layout.menu.audio ? "bg-mid-gray" : "bg-dark-gray"
      })}
      ${menuItem({
        icon: 'fa-comment',
        title: "Toggle chat",
        onclick: () => emit('layout:toggleMenuItem', 'chat'),
        selected: state.layout.menu.chat
        // classes: state.layout.menu.chat ? "bg-mid-gray": ""
      })}
  </div>
  `
}

// <i
//   style="margin-left:3px"
//   class="fas fa-plus-circle dim pointer fr"
//   onclick=${() => emit('devices:addNewMedia', true)}
//   title="Add Media Broadcast"
// >
// </i>
