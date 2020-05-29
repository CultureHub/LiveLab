const debounce = require('./../lib/utils.js').debounce


module.exports = (state, emitter) => {

  state.layout = {
    panels: {
      chat: false,
      audio: false,
      users: false,
      addMedia: false,
      settings: false
    },
  //  switchers: { a: false, b: false, c: false, d: false}, // whether switcher panels are open
    switchers: { a: true, b: true, c: true, d: true}, // whether switcher panels are open
    settings: {
      stretchToFit: true,
      switchers: { a: null, b: null, c: null, d: null}, // stream values of each switcher
      numberOfSwitchers: 0, // number of switchers to display in ui
      columnLayout: true,
      showCommunicationInfo: true
    },
    collapsed: 2   // collapsed state: 0--> closed, 1 --> basic menu, 2 --> advanced menu
  }

  emitter.on('layout:collapseMenu', (val) => {
    state.layout.collapsed = val
    emitter.emit('render')
  })

  emitter.on('layout:openMenu', () => {
    state.layout.collapsed = false
    emitter.emit('render')
  })

  emitter.on('layout:openChat', () => {
    state.layout.panels.chat = true
    emitter.emit('render')
  })

  emitter.on('layout:toggleMenuItem', (item, type) => {
    state.layout[type][item] = !state.layout[type][item]
    emitter.emit('render')
  })

  emitter.on('layout:setSettings', (item, value) => {
    state.layout.settings[item] = value
    emitter.emit('render')
  })

  emitter.on('layout:setSwitcher', (item, value) => {
    state.layout.settings.switchers[item] = value
    emitter.emit('render')
  })

  window.addEventListener('resize', debounce(() => {
  //  console.log('rendering')
    emitter.emit('render')
  }, 50))
  // window.addEventListener('resize',() => {
  // //  console.log('rendering')
  //   emitter.emit('render')
  // })
}
