var xtend = Object.assign
const Window = require('./../lib/window.js')
module.exports = showModel

function showModel (state, bus) {
  state.show = xtend({
    audioOutput: [],
    displays: []
  }, state.show)

  addDisplay()
//  addDisplay({title: 'test22 title'})

  updateWindows()

  bus.on('show:setAudioOutput', devices => {
    console.log("DEVICES", devices)
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

  bus.on('show:toggleWindow', displayIndex => {
    let display = state.show.displays[displayIndex]
    if (display.isOpen) {
    //  display.window.close()
      display.isOpen = false
    } else {
      console.log(display)
    //  display.window.isOpen()
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
    //state.show.
    console.log('displays', state.show.displays)
    bus.emit('render')
  })

  bus.on('show:setVideoStream', ({displayIndex, streamIndex}) => {
    console.log(state.ui.dragging)
  //  if (state.ui.dragging !== null && state.ui.dragging.track.kind === 'video') {
      state.show.displays[displayIndex].streams[streamIndex] = state.ui.dragging
  //  }
    console.log(state.show.displays)
    updateWindows()
    bus.emit('ui:dragClear')
  //  state.show.displays[displayIndex].tracks[trackIndex] = trackId
    // bus.emit('render')
  })

  // bus.on('show:setVideoTrack', ({displayIndex, trackIndex}) => {
  //   console.log(state.ui.dragging)
  //   if (state.ui.dragging !== null && state.ui.dragging.track.kind === 'video') {
  //     state.show.displays[displayIndex].tracks[trackIndex] = state.ui.dragging
  //   }
  //   console.log(state.show.displays)
  //   updateWindows()
  //   bus.emit('ui:dragClear')
  // //  state.show.displays[displayIndex].tracks[trackIndex] = trackId
  //   // bus.emit('render')
  // })

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

  // bus.on('show:trackRemoved', (trackId) => {
  //   console.log("previous state", state.show.displays)
  //   state.show.displays = state.show.displays.map((display) => {
  //     let obj = Object.assign({}, display)
  //     obj.tracks = obj.tracks.map((media) => {
  //       console.log("checking " + media + trackId)
  //       if(media && media.trackId) return media.trackId == trackId ? null : media
  //       return media
  //     }
  //     )
  //     console.log("new tracks: ", obj.tracks)
  //     return obj
  //   })
  //   console.log('new show state', state.show.displays)
  //   updateWindows()
  //
  // })


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

  // function getTrackFromId(trackId) {
  //   if (trackId && trackId !== null) {
  //     console.log('getting track', trackId, state.media.byId[trackId])
  //     return trackId
  //   }
  //   return null
  // }

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

  // function updateWindows() {
  //   state.show.displays.forEach((display) => {
  //     let t =  getTrackFromId(display.tracks[display.active])
  //     let opts = Object.assign(display, {
  //       track: t
  //     })
  //     console.log('update track', t, opts)
  //     display.window.update(opts)
  //   })
  // }

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

    let win = new Window(opts)

    opts.window = win
    // opts.track = getTrackFromId(opts.tracks[opts.])
    state.show.displays.push(Object.assign(opts, {
      stream: getStreamFromId(opts.streams[opts.active])
    }))
  }
  // function addDisplay(_opts) {
  //   let index =  state.show.displays.length + 1
  //   const opts = Object.assign({
  //     type: 'window',
  //     active: 0,
  //     isOpen: false,
  //     fullscreen: false,
  //     title: 'Output ' + index,
  //     tracks: [null, null, null, null],
  //     opacity: 100,
  //     onClose: onClose
  //   }, _opts)
  //
  //   let win = new Window(opts)
  //
  //   opts.window = win
  //   // opts.track = getTrackFromId(opts.tracks[opts.])
  //   state.show.displays.push(Object.assign(opts, {
  //     track: getTrackFromId(opts.tracks[opts.active])
  //   }))
  // }
}
