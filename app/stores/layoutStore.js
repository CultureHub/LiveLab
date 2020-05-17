const debounce = require('./../lib/utils.js').debounce


module.exports = (state, emitter) => {

  state.layout = {
    panels: {
      chat: true,
      audio: false,
      users: false,
      switcherA: true,
      switcherB: false
    },
    settings: {
      stretchToFit: true,
      switcherA: null,
      switcherB: null
    }
  }

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
