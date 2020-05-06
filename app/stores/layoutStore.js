const debounce = require('./../lib/utils.js').debounce


module.exports = (state, emitter) => {

  state.layout = {
    select: {
      objectFit: {
        options: ['contain', 'cover'],
        value: 'cover',
        label: 'video fit'
      },
      stretchToFit: {
        options: [true, false],
        value: true,
        label: 'stretch bounding box'
      },
      ratio: {
        options: ['4:3', '16:9'],
        value: '4:3',
        label: 'target ratio'
      }
    },
    num: 3
  }

  emitter.on('layout:selectProp', (prop, value) => {
    state.layout.select[prop].value = value
    emitter.emit('render')
  })

  emitter.on('layout:increase', () => {
    state.layout.num++
    emitter.emit('render')
  })

  emitter.on('layout:decrease', () => {
    state.layout.num--
    if(state.layout.num < 0) state.layout.num = 0
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
