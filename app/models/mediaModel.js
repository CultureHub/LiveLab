// MEDIA::
// For now: each peer only broadcasts one stream, each stream has an unlimited number of tracks corresponding to each audio and video device + specific constraint settings.
// (i.e. the same device could broadcast multiple tracks at different framerates/bandwidths/ etc.)
// Any change in settings creates a new stream and renegotiates with peers.
// Each user creates a unique id for a specific device / constraint configuration, and this id is broadcast to other users along with the track id that it referes to.
// Peer ids and device ids are persistent between sessions.
//
// "default" refers to the audio and video tracks used for communication
// TO DO: generated track id (UNIQUE TO ENTIRE SESSION, persistent across sessions) ?? maybe bad idea
// To DO: default information only stored in one place--peer info
// MONITORING:
// there is no straightforward way to get actual specifications for each track (other than getusermedia constraints, which can drastically vary from actual settings)
// eventually makes sense to monitor information

'use strict'

var xtend = Object.assign


module.exports = mediaModel

function mediaModel (state, bus) {
  state.media = xtend({
    byId: {}//,
    // all: []
  }, state.media)


  //  var ip = window.location.host

  // bus.on('media:addTracksFromStream', function (options) {
  //   var tracks = options.stream.getTracks()
  //   tracks.forEach(function (track) {
  //     bus.emit('media:addTrack', {
  //       track: track,
  //       trackId: track.id,
  //       peerId: options.peerId, // should be user peerId ?
  //       constraints: options.constraints,
  //       isDefault: options.isDefault,
  //       kind: track.kind
  //     })
  //   })
  //   bus.emit('render')
  // })

  // bus.on('media:updateTrackInfo', function (trackUpdateObject) {
  //   console.log('UPDATING TRACKS', trackUpdateObject)
  //   Object.keys(trackUpdateObject).forEach((key) => {
  //     state.media.byId[key] = xtend(state.media.byId[key], trackUpdateObject[key])
  //   })
  // })

  bus.on('media:updateStreamInfo', function (streamUpdateObject) {
  //  console.log('STREAMINFO',streamUpdateObject, state.media.byId)
    Object.keys(streamUpdateObject).forEach((key) => {
      if(state.media.byId[key]){
        state.media.byId[""+key] = xtend({}, state.media.byId[key], streamUpdateObject[key])
      } else {
        state.media.byId[""+key] = xtend({}, streamUpdateObject[key])
      }
      window.testObj = state.media.byId
        console.log('NEWSTREAMINFO',  streamUpdateObject[key],    state.media.byId[key], state.media.byId)
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
      var audio = opts.stream.getAudioTracks()
      if (audio.length > 0) {
        hasAudio = true
        bus.emit('ui:addAudio',
          {
            track: audio[0],
            peerId: opts.peerId
          }
        )
      }
      var video = opts.stream.getVideoTracks()
      if (video.length > 0) hasVideo = true
    }
    // if (state.media.all.indexOf(id) < 0) {
    //   state.media.all.push(id)
    // }

    bus.emit('peers:addStreamToPeer', {
      streamId: id,
      peerId: opts.peerId,
      isDefault: opts.isDefault,
      hasAudio: hasAudio,
      hasVideo: hasVideo
    })
  })

  // function getSettingsFromStream(stream) {
  //   var settings = {}
  //   if (stream && stream !== null) {
  //     stream.getTracks().forEach((track) =>
  //       settings[track.kind] = track.getSettings()
  //     )
  //   }
  //   return settings
  // }

// process of migration from storing tracks to storing streams, now that addStream() works
// initially: only developed for video stream, assumes one track per stream
  // bus.on('media:addTrack', function (opts) {
  //
  //   var id = opts.track.id
  //   if(opts.stream){
  //     id = opts.stream.id
  //   }
  //   //if(opts.stream)
  //   state.media.byId[id] = xtend({}, opts, { settings: Object.assign({}, opts.track.getSettings())})
  //
  //   //console.log('adding track', state.media.byId[opts.track.id])
  //   // if default communication stream, set name to default
  //   if (opts.isDefault) {
  //     state.media.byId[id].name = 'default'
  //     if (opts.track.kind === 'audio') {
  //       bus.emit('ui:addAudio',
  //         {
  //           track: state.media.byId[opts.track.id].track,
  //           peerId: opts.peerId
  //         }
  //       )
  //     }
  //   }
  //   if (state.media.all.indexOf(id) < 0) {
  //     state.media.all.push(id)
  //   }

  //   bus.emit('peers:addTrackToPeer', {
  //     trackId: id,
  //     peerId: opts.peerId,
  //     isDefault: opts.isDefault,
  //     kind: opts.track.kind
  //   })
  //
  //   bus.emit('render')
  // })

  // bus.on('media:removeTrack', function (trackId) {
  //   bus.emit('show:trackRemoved', trackId)
  //   delete state.media.byId[trackId]
  //   var index = state.media.all.indexOf(trackId)
  //   if (trackId === state.ui.inspector.trackId) {
  //     bus.emit('ui:updateInspectorTrack', {trackId: null, pc: null})
  //   }
  //   if (index > -1) state.media.all.splice(index, 1)
  //   bus.emit('render')
  // })

  bus.on('media:removeStream', function (streamId) {
    bus.emit('show:streamRemoved', streamId)
    delete state.media.byId[streamId]
  //  var index = state.media.all.indexOf(streamId)
    if (streamId === state.ui.inspector) {
      bus.emit('ui:setInspectMedia', null)
    }
  //  if (index > -1) state.media.all.splice(index, 1)
    bus.emit('render')
  })

  // // Hacky way to avoid duplicating getusermedia calls:
  // // compare requested media constraints to constraints of existing tracks, if there is none, return null..
  // // else return existing mediaStreamTrack
  // function getTrackFromConstraints (peerId, constraints) {
  //   var existingTrack = null
  //   if (state.peers.byId[peerId] && state.peers.byId[peerId].tracks.length > 0) {
  //     var tracks = state.peers.byId[peerId].tracks
  //   //  console.log(' comparing : ', tracks, constraints)
  //     tracks.forEach(function (trackId) {
  //       var track = state.media.byId[trackId]
  //     //  console.log("1:", JSON.stringify(constraints))
  //     //  console.log("2:", JSON.stringify(track.constraints))
  //       if (JSON.stringify(constraints) === JSON.stringify(track.constraints)) {
  //         existingTrack = track
  //       }
  //     })
  //   }
  //   return existingTrack
  // }

  // returns a new object containing only the keys in the array 'keys', only if undefined
    function filterKeys (object, keys) {
      var newObject = {}
      keys.forEach(function (key) {
        if (object[key]) newObject[key] = xtend({}, object[key])
      })
      return newObject
    }
}
