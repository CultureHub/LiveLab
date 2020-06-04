const debounce = require('./../lib/utils.js').debounce
const hooks = require('choo-hooks')


module.exports = (state, emitter) => {
  const hook = hooks(emitter)
  state.layout = {
    panels: {
      chat: false,
      audio: false,
      users: false,
      addMedia: false,
      settings: false
    },
    switchers: { a: false, b: false, c: false, d: false}, // whether switcher panels are open
    // switchers: { a: true, b: true, c: true, d: true}, // whether switcher panels are open
    settings: {
      stretchToFit: true,
      switchers: { a: null, b: null, c: null, d: null}, // stream values of each switcher
      numberOfSwitchers: 0, // number of switchers to display in ui
      columnLayout: false,
      showCommunicationInfo: true
    },
    collapsed: 2   // collapsed state: 0--> closed, 1 --> basic menu, 2 --> advanced menu,
  }

  state.style = {
    colors: {
      text0: '#eee',
      text1: '#ccc', // nearly white
      text2: '#999', // gray
      accent0: '#D5008F', // yellow
      accent1: '#00F',
      background0: '#333', // drak gray
      background1: '#555' // mid gray
    }
  }

  emitter.on('render', () => {
    console.log('render was called')
  })

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
    if(state.layout.settings.switchers[item] !== null && state.layout.settings.switchers[item].stream.id === value.stream.id) {
      state.layout.settings.switchers[item] = null
    } else {
      state.layout.settings.switchers[item] = value
    }
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
