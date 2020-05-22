const html = require('choo/html')
 // ${selected?"bg-mid-gray" : "bg-dark-gray"}
 // text-shadow:4px 4px #555
const menuIcon = ({ title, onclick, icon, selected = false, info }) => html`
<div class="db relative pointer pa3 ${selected?"bg-mid-gray" : "bg-dark-gray"}" title=${title} onclick= ${onclick}>
<i class="fas ${icon} dim pointer" style="display:block;" title=${title}
 ></i>
${info?html`<div class="absolute light-gray right-0 top-0 b pa2">${info}</div>` : '' }
</div>
`



// <i
//  class="fas fa-desktop dim pointer ma3 db"
//  style="display:block"
//  title="Share Screen"
//  onclick= ${() => emit('user:shareScreen')}
//  ></i>




module.exports = (state, emit) => {
  const menuItem = (opts) => {
  //  console.log()
    if(state.layout.collapsed === 1 && opts.advanced ) {
      return ''
    } else {
      return menuIcon(opts)
    }
  }

  if(state.layout.collapsed === 0) {
    return html`
    <div class="fixed bottom-0 right-0 pa2">
    ${menuIcon({
      icon:  'fa-chevron-up',
      title: "Show menu",
      onclick: () => emit('layout:collapseMenu', 1)
    })}
    </div>
    `
  } else {
    return html`
    <div class="fixed bottom-0 right-0 pa2">
    ${menuItem({
      icon: 'fa-share-alt',
      title: "Share",
      // info: 'x',
      onclick: () => {}
    })}
    ${menuItem({
      icon: 'fa-question',
      title: "Info",
      onclick: () => emit('layout:showInfo'),
      // selected: state.layout.settings.stretchToFit
    })}
    <br>
        ${menuItem({
          icon:  state.user.isVideoMuted ?'fa-video red':'fa-video green',
          title: "Mute your video",
          onclick: () => emit('user:toggleVideoMute')
        })}
        ${menuItem({
          icon:  state.user.isAudioMuted ?'fa-microphone-slash red':'fa-microphone green',
          title: "Mute your microphone",
          onclick: () => emit('user:toggleAudioMute')
        })}
        ${menuItem({
          icon: 'fa-desktop',
          title: "Add screen share",
          onclick: () => emit('user:shareScreen'),
          // info: '+'
        })}
        ${menuItem({
          icon: 'fa-plus-circle',
          title: "Add media stream",
          onclick: () =>  emit('layout:toggleMenuItem', 'addMedia', 'panels'),
          advanced: true,
          // info: '+'
        })}

        ${menuItem({
          icon: 'fa-phone-slash',
          title: "Leave call",
          // info: 'x',
          onclick: () => emit('user:endCall')
        })}
        <br>
        ${menuItem({
          icon: state.layout.settings.stretchToFit? 'fa-compress-alt': 'fa-expand-alt',
          title: state.layout.settings.stretchToFit? 'Fit to bounding box':"Stretch videos to fit screen",
          onclick: () => emit('layout:toggleMenuItem', 'stretchToFit', 'settings')
        })}
        <br>
        ${menuItem({
          icon: 'fa-sliders-h',
          title: "Toggle volume controls",
          onclick: () => emit('layout:toggleMenuItem', 'audio', 'panels'),
          advanced: true,
          selected: state.layout.panels.audio
          // classes: state.layout.panels.audio ? "bg-mid-gray" : "bg-dark-gray"
        })}
        ${menuItem({
          icon: 'fa-desktop',
          title: "Open switcher A",
          onclick: () => emit('layout:toggleMenuItem', 'switcherA', 'panels'),
          advanced: true,
          selected: state.layout.panels.switcherA,
          info: 'A'
          // classes: state.layout.panels.audio ? "bg-mid-gray" : "bg-dark-gray"
        })}
        ${menuItem({
          icon: 'fa-desktop',
          title: "Open switcher B",
          onclick: () => emit('layout:toggleMenuItem', 'switcherB', 'panels'),
          selected: state.layout.panels.switcherB,
          advanced: true,
          info: 'B'
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
        <br>
        ${state.layout.collapsed === 2 ? menuItem({
          icon:  'fa-chevron-down',
          title: "Collapse menu",
          onclick: () => emit('layout:collapseMenu', 0)
        }) :  menuItem({
          icon:  'fa-angle-double-up',
          title: "Expand menu",
          onclick: () => emit('layout:collapseMenu', 2)
        })}

    </div>
    `
  }
}

//fas fa-user-friends

// <i
//   style="margin-left:3px"
//   class="fas fa-plus-circle dim pointer fr"
//   onclick=${() => emit('devices:addNewMedia', true)}
//   title="Add Media Broadcast"
// >
// </i>
