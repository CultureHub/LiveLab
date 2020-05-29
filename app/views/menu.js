const html = require('choo/html')

const menuIcon = ({ title, onclick, icon, selected = false, info }) => html`
<div class="relative pointer pa3 ${selected?"bg-mid-gray" : ""}" style="flex:0" title=${title} onclick= ${onclick}>
<i class="fas ${icon} dim pointer" style="display:block;" title=${title}
 ></i>
${info?html`<div class="absolute light-gray right-0 top-0 b pa2">${info}</div>` : '' }
</div>
`


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
    <div class="fixed bottom-0 right-0 pa2 " style="pointer-events:all;">
    ${menuIcon({
      icon:  'fa-chevron-up',
      title: "Show menu",
      onclick: () => emit('layout:collapseMenu', 2)
    })}
    </div>
    `
  } else {
    return html`
    <div class="flex flex-column justify-between flex-wrap-reverse" style="pointer-events:all;">
      <div class="flex flex-column-ns flex-row justify-center">
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
        </div>
        <div class="flex flex-column-ns flex-row justify-center">
          ${['a', 'b', 'c', 'd'].splice(0, state.layout.settings.numberOfSwitchers).map((switcher) => menuItem({
              icon: 'fa-desktop',
              title: `Open switcher ${switcher}`,
              onclick: () => emit('layout:toggleMenuItem', switcher, 'switchers'),
              advanced: true,
              selected: state.layout.switchers[switcher],
              info: switcher
              // classes: state.layout.panels.audio ? "bg-mid-gray" : "bg-dark-gray"
            })
          )}
          ${menuItem({
            icon: 'fa-cog',
            title: "Settings",
            selected: state.layout.panels.settings,
            // info: 'x',
            onclick: () =>  emit('layout:toggleMenuItem', 'settings', 'panels'),
          })}
          ${menuItem({
            icon: 'fa-sliders-h',
            title: "Toggle volume controls",
            onclick: () => emit('layout:toggleMenuItem', 'audio', 'panels'),
            advanced: true,
            selected: state.layout.panels.audio
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
            // icon:  'fa-angle-double-up',
            icon: 'fa-chevron-up',
            title: "Expand menu",
            onclick: () => emit('layout:collapseMenu', 2)
          })}
        </div>
    </div>
    `
  }
}
//
//
// ${menuItem({
//   icon: state.layout.settings.stretchToFit? 'fa-compress-alt': 'fa-expand-alt',
//   title: state.layout.settings.stretchToFit? 'Fit to bounding box':"Stretch videos to fit screen",
//   onclick: () => emit('layout:toggleMenuItem', 'stretchToFit', 'settings')
// })}
