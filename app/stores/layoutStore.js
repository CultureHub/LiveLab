const debounce = require('./../lib/utils.js').debounce


module.exports = (state, emitter) => {

  state.layout = {
    panels: {
      chat: false,
      audio: false,
      users: false,
      switcherA: false,
      switcherB: false,
      addMedia: false
    },
    settings: {
      stretchToFit: true,
      switcherA: null,
      switcherB: null
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

  window.addEventListener('resize', debounce(() => {
  //  console.log('rendering')
    emitter.emit('render')
  }, 50))
  // window.addEventListener('resize',() => {
  // //  console.log('rendering')
  //   emitter.emit('render')
  // })
}
