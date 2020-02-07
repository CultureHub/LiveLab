var xtend = Object.assign
const ShowWindow = require('./../lib/ShowWindow.js')
module.exports = showModel

function showModel (state, bus) {
  state.show = xtend({
    audioOutput: [],
    displays: []
  }, state.show)

  addDisplay()

  updateWindows()

  bus.on('show:toggleWindow', displayIndex => {
    let display = state.show.displays[displayIndex]
    if (display.isOpen) {
      display.isOpen = false
    } else {
      console.log(display)
      display.isOpen = true
    }
    updateWindows()
    bus.emit('render')
  })

  bus.on('show:addDisplay', () => {
    addDisplay()
    bus.emit('render')
  })

  bus.on('show:removeDisplay', displayIndex => {
    console.log('removing', displayIndex)
    state.show.displays[displayIndex].window.remove()
    state.show.displays.splice(displayIndex, 1)
    console.log('displays', state.show.displays)
    bus.emit('render')
  })

  bus.on('show:setVideoStream', ({displayIndex, streamIndex}) => {
    state.show.displays[displayIndex].streams[streamIndex] = state.ui.dragging
    updateWindows()
    bus.emit('ui:dragClear')
  })

  bus.on('show:streamRemoved', (streamId) => {
    console.log("previous state", state.show.displays)
    state.show.displays = state.show.displays.map((display) => {
      let obj = Object.assign({}, display)
      obj.streams = obj.streams.map((media) => {
        console.log("checking " + media + streamId)
        if(media && media.streamId) return media.streamId == streamId ? null : media
        return media
      }
    )
    console.log("new streams: ", obj.streams)
    return obj
  })
  console.log('new show state', state.show.displays)
  updateWindows()

})

bus.on('show:clearVideoTrack', ({displayIndex, trackIndex}) => {
  state.show.displays[displayIndex].tracks[trackIndex] = null
  updateWindows()
  bus.emit('render')
})

bus.on('show:setActiveVideo', ({displayIndex, streamIndex}) => {
  state.show.displays[displayIndex].active = streamIndex
  updateWindows()
  bus.emit('render')
})

bus.on('show:updateDisplayProperty', ({displayIndex, property, value}) => {
  state.show.displays[displayIndex][property] = value
  updateWindows()
  bus.emit('render')
})

function onClose() {
  console.log('closing window')
}

function getStreamFromId(streamId) {
  if (streamId && streamId !== null) {
    console.log('getting track', streamId, state.media.byId[streamId])
    return streamId
  }
  return null
}

function updateWindows() {
  state.show.displays.forEach((display) => {
    let t =  getStreamFromId(display.streams[display.active])
    let opts = Object.assign(display, {
      stream: t
    })
    console.log('update stream', t, opts)
    display.window.update(opts)
  })
}

function addDisplay(_opts) {
  let index =  state.show.displays.length + 1
  const opts = Object.assign({
    type: 'window',
    active: 0,
    isOpen: false,
    fullscreen: false,
    title: 'Output ' + index,
    streams: [null, null, null, null],
    opacity: 100,
    onClose: onClose
  }, _opts)

  let win = new ShowWindow(opts)
  opts.window = win
  state.show.displays.push(Object.assign(opts, {
    stream: getStreamFromId(opts.streams[opts.active])
  }))
}

// Audio related functions -- currently not in use
bus.on('show:setAudioOutput', devices => {
  state.show.audioOutput = devices.all.map((id) => {
    let device = devices.byId[id]
    return {
      title: device.label,
      deviceId: device.deviceId,
      active: 0,
      streams: [null, null, null, null],
      volume: 100
    }
  })
})

}
