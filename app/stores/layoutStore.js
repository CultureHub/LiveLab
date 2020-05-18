const debounce = require('./../lib/utils.js').debounce


module.exports = (state, emitter) => {

  state.layout = {
    panels: {
      chat: false,
      audio: false,
      users: false,
      switcherA: false,
      switcherB: false
    },
    settings: {
      stretchToFit: true,
      switcherA: null,
      switcherB: null
    },
    collapsed: false
  }

  emitter.on('layout:collapseMenu', () => {
    state.layout.collapsed = true
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
