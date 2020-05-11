const debounce = require('./../lib/utils.js').debounce


module.exports = (state, emitter) => {

  state.layout = {
    menu: {
      chat: true,
      audio: false,
      stretchToFit: true
    }
  }

  emitter.on('layout:toggleMenuItem', (item) => {
    state.layout.menu[item] = !state.layout.menu[item]
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
