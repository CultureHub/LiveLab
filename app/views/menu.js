const html = require('choo/html')
 // ${selected?"bg-mid-gray" : "bg-dark-gray"}
 // text-shadow:4px 4px #555
menuItem = ({ title, onclick, icon, selected = false, info }) => html`
<div class="db relative pointer pa3 ${selected?"bg-mid-gray" : "bg-dark-gray"}" title=${title} onclick= ${onclick}>
<i class="fas ${icon} dim pointer" style="display:block;" title=${title}
 ></i>
${info?html`<div class="absolute light-gray right-0 top-0 b pa2" style="text-shadow:3px 3px #555">${info}</div>` : '' }
</div>
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
        icon: 'fa-phone',
        title: "Leave call",
        info: 'x',
        onclick: () => emit('user:endCall')
      })}
      <br>
      <br>
      ${menuItem({
        icon: 'fa-th-large',
        title: "Stretch videos to fit screen",
        onclick: () => emit('layout:toggleMenuItem', 'stretchToFit', 'settings'),
        selected: state.layout.settings.stretchToFit
      })}
      ${menuItem({
        icon: 'fa-question',
        title: "Info",
        onclick: () => emit('layout:showInfo'),
        // selected: state.layout.settings.stretchToFit
      })}
      <br>
      <br>
      ${menuItem({
        icon: 'fa-sliders-h',
        title: "Toggle volume controls",
        onclick: () => emit('layout:toggleMenuItem', 'audio', 'panels'),
        selected: state.layout.panels.audio
        // classes: state.layout.panels.audio ? "bg-mid-gray" : "bg-dark-gray"
      })}
      ${menuItem({
        icon: '',
        title: "Open switcher A",
        onclick: () => emit('layout:toggleMenuItem', 'switcherA', 'panels'),
        selected: state.layout.panels.switcherA,
        info: 'A'
        // classes: state.layout.panels.audio ? "bg-mid-gray" : "bg-dark-gray"
      })}
      ${menuItem({
        icon: 'fa-comment',
        title: "Toggle chat",
        onclick: () => emit('layout:toggleMenuItem', 'chat', 'panels'),
        selected: state.layout.panels.chat
        // classes: state.layout.panels.chat ? "bg-mid-gray": ""
      })}
      ${menuItem({
        icon: 'fa-users',
        title: "Show participant list",
        onclick: () => emit('layout:toggleMenuItem', 'users', 'panels'),
        selected: state.layout.panels.users,
        info: Object.keys(state.multiPeer.peers).length + 1
        // classes: state.layout.panels.chat ? "bg-mid-gray": ""
      })}
  </div>
  `
}

//fas fa-user-friends

// <i
//   style="margin-left:3px"
//   class="fas fa-plus-circle dim pointer fr"
//   onclick=${() => emit('devices:addNewMedia', true)}
//   title="Add Media Broadcast"
// >
// </i>
