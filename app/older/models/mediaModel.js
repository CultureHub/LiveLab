

'use strict'

var xtend = Object.assign


module.exports = mediaModel

function mediaModel (state, bus) {
  state.media = xtend({
    byId: {}
  }, state.media)


  bus.on('media:updateStreamInfo', function (streamUpdateObject) {
    Object.keys(streamUpdateObject).forEach((key) => {
      if(state.media.byId[key]){
        state.media.byId[""+key] = xtend({}, state.media.byId[key], streamUpdateObject[key])
      } else {
        state.media.byId[""+key] = xtend({}, streamUpdateObject[key])
      }
    })
    bus.emit('render')
  })


  // Add a new media stream. Stream can have at most one audio track and one video track. More than one audio or video should be added as a separate stream.
  bus.on('media:addStream', function (opts) {
    var id = opts.stream.id
    state.media.byId[id] = xtend({}, state.media.byId[id], opts)

    var hasAudio = false
    var hasVideo = false
    if (opts.isDefault) {
      state.media.byId[id].name = 'default'
    }
    var audio = opts.stream.getAudioTracks()
    if (audio.length > 0) {
      hasAudio = true
      bus.emit('ui:addAudio',
      {
        track: audio[0],
        peerId: opts.peerId
      }
    )
    var video = opts.stream.getVideoTracks()
    if (video.length > 0) hasVideo = true
  }

  opts.stream.getTracks().forEach((track) => {
    track.onended = (e) => {
      console.log('ENDED', e, opts)
      if(state.media.byId[id]){
        bus.emit('media:removeStream', id)
        bus.emit('render')
      }
    }
  })

  bus.emit('peers:addStreamToPeer', {
    streamId: id,
    peerId: opts.peerId,
    isDefault: opts.isDefault,
    hasAudio: hasAudio,
    hasVideo: hasVideo
  })
})


bus.on('media:removeStream', function (streamId) {
  console.log('stopping tracks')
  // var tracks = state.media.byId[streamId].stream.getTracks()
  // tracks.forEach((track) => track.stop())
  bus.emit('show:streamRemoved', streamId)
  // console.log(state.media.byId[streamId])
  //
  if (streamId === state.ui.inspector) {
    bus.emit('ui:setInspectMedia', null)
  }
    bus.emit('peers:removeStreamFromPeer', state.media.byId[streamId].peerId, streamId)
    delete state.media.byId[streamId]
   bus.emit('user:updateLocalInfo')
   bus.emit('render')
})


}
