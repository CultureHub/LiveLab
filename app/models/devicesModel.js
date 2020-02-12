const enumerateDevices = require('enumerate-devices')
const getUserMedia = require('getusermedia')
const Screen = require('./screenmedia.js')

const xtend = Object.assign

module.exports = devicesModel

function devicesModel (state, bus) {
  // object representing the user's input and output devices
  state.devices = xtend({
    // input and output devices that the user has available
    videoinput: {
      byId: {},
      all: []
    },
    audiooutput: {
      byId: {},
      all: []
    },
    audioinput: {
      byId: {},
      all: []
    },
    videooutput: {
      byId: {},
      all: []
    },
    // information about preview stream
    default: {
      name: 'default',
      inputDevices: {
        audio: null,
        video: null
      },
      previewTracks: {
        audio: null,
        video: null
      },
      trackInfo: {
        audio: {},
        video: {}
      },
      constraints: {
        isOpen: false,
        audio: {},
        video: {
          width: 1920,
          height: 1080,
          frameRate: 30
        }
      },
      error: ''
    }
  }, state.devices)

  // on page init, get user devices and load default constraints from json
  // TO DO: put this function somewhere else
  window.onload = function () {
    getDevices()
    //  loadConstraints()
    //check whether screen share extension is installed OR using nw.js version
    // @to do: add screen share code
    //  if(sessionStorage.getScreenMediaJSExtensionId || typeof nw == "object"){
    //     state.devices.addBroadcast.kinds.screen =  {
    //       deviceId: null
    //     }
    // }
    bus.emit('peers:updatePeer', {
      peerId: state.user.uuid
    })
  }

  bus.on('devices:addNewMedia', function() {
    updateLocalPreview('video')
    state.devices.default.name = 'vid' + state.peers.byId[state.user.uuid].streams.length
    state.devices.default.constraints.isOpen = !state.devices.default.constraints.isOpen
    bus.emit('render')
  })

  bus.on('devices:toggleSettings', function() {
    state.devices.default.constraints.isOpen = !state.devices.default.constraints.isOpen
    bus.emit('render')
  })

  bus.on('devices:setDefaultAudio', function (val) {
    setDefaultMedia(val, "audio")

  })

  bus.on('devices:setDefaultVideo', function (val) {
    setDefaultMedia(val, "video")
  })

  bus.on('devices:setBroadcastName', function(name){
    state.devices.default.name = name
    bus.emit('render')
  })


  function setDefaultMedia (val, kind) {
    if (state.devices.default.inputDevices[kind] !== val) {
      state.devices.default.inputDevices[kind] = val
      updateLocalPreview(kind)
    }
  }

  function updateLocalPreview(kind) {
    getConstraintsFromSettings(xtend({}, {kind: kind, deviceId: state.devices.default.inputDevices[kind]}, state.devices.default.constraints[kind]), function(err, constraints){
      if(err) {
        //to do: do something with error!
        console.log("CONSTRAINT ERROR", err)
      } else {
        getLocalMedia (constraints, function(err, stream){

          if(err===null){
            var tracks = stream.getTracks()
            tracks.forEach(function (track) {
              if(state.devices.default.previewTracks[kind]!=null){
                state.devices.default.previewTracks[kind].stop()
              }
              state.devices.default.previewTracks[kind] = track
              state.devices.default.trackInfo[kind] = track.getSettings()
              //  console.log('DEVICES', state.devices)
            })
          } else {
            //to do: do something with error!
            console.log("GET USER MEDIA ERROR", err)
          }
          bus.emit('render')
        })
      }
    })
  }

  bus.on('devices:startCall', function (opts)  {
    var stream = getStreamFromPreviewTracks()
    bus.emit('media:addStream', {
      //    track: track,
      stream: stream,
      //  trackId: stream.id,
      streamId: stream.id,
      peerId: state.user.uuid,
      settings: getSettingsFromStream(stream),
      isDefault: true,
      name: 'default'
    })
    bus.emit('user:join', opts)
  })

  bus.on('devices:addNewMediaToBroadcast', function ({isDefault = false} = {}) {
    var stream = getStreamFromPreviewTracks()
    bus.emit('media:addStream', {
      stream: stream,
      streamId: stream.id,
      peerId: state.user.uuid,
      isDefault: isDefault,
      name: state.devices.default.name,
      settings: getSettingsFromStream(stream)
    })
    state.devices.default.constraints.isOpen = false
    bus.emit('user:addStream', stream)
    bus.emit('render')
  })

  function getStreamFromPreviewTracks() {
    var previewTracks = state.devices.default.previewTracks
    var tracks = []
    Object.keys(previewTracks).forEach((kind) => {
      if (previewTracks[kind] !== null) tracks.push(previewTracks[kind])
    })

    state.devices.default.previewTracks = { audio: null, video: null}
    return new MediaStream(tracks)
  }



  bus.on('devices:updateBroadcastConstraint', function(obj){
    state.devices.default.constraints[obj.kind][obj.constraint] = obj.value
    state.devices.default.previewTracks[obj.kind].applyConstraints(state.devices.default.constraints[obj.kind])
    .then(() => {
      state.devices.default.trackInfo[obj.kind] = state.devices.default.previewTracks[obj.kind].getSettings()
      bus.emit('render')
    })
    .catch(e => {
      // The constraints could not be satisfied by the available devices.
      // @to do: share error message
      console.log('constraints not satisfied', e)
      state.devices.default.trackInfo[obj.kind] = state.devices.default.previewTracks[obj.kind].getSettings()
      bus.emit('render')
    })

  })


  /** Helper functions for dealing with devices, get user media, and constraints **/

  function getLocalMedia(constraints, callback) {
    //  console.log('CONSTRAINTS', constraints)
    getUserMedia(constraints, function (err, stream) {
      if (err) {
        callback(err, null)
        // TO DO: do something about error
      } else {
        window.localStream = stream
        //  console.log(window.localStream)
        callback(null, stream)
      }
      bus.emit('render')
    })
  }

  // bus.on('devices:getDevices', function () {
  // TO DO: use electron remote available displays to enumerate video output devices
  // })
  //display window for adding broadcast
  function getDevices () {
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints()

    enumerateDevices().then((devices) => {
      const kinds = ['audioinput', 'videoinput', 'audiooutput']

      kinds.forEach((kind) => {
        const filtered = devices.filter((elem) => elem.kind === kind)

        state.devices[kind].all = filtered.map((elem) => {
          state.devices[kind].byId[elem.deviceId] = xtend({}, elem)
          return elem.deviceId
        })
      })

      // Set default audio and video devices
      if (state.devices.audioinput.all.length > 0) setDefaultMedia(state.devices.audioinput.all[0], "audio")
      if (state.devices.videoinput.all.length > 0) setDefaultMedia(state.devices.videoinput.all[0], "video")

      bus.emit('show:setAudioOutput', state.devices.audiooutput)
      bus.emit('render')
    }).catch(console.log.bind(console)) // TO DO:: display error to user
  }
}

//format ui settings object into getUserMedia constraints
// settings object is of the format {
// kind: //"audio" or "video",
// deviceId:
// <other setting > : { value: //value}
//

function getConstraintsFromSettings(settings, callback) {
  //  console.log('FORMATING CONSTRAINTS', settings)
  var allConstraints = {}
  var userConstraints = {}
  if(settings.deviceId===null) {
    callback("Error: device not specified", null)
  } else {

    if(settings.kind==="screen"){
      userConstraints.mandatory =  {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: settings.deviceId
      }
    } else {
      userConstraints.deviceId = { exact : settings.deviceId }
    }
    Object.keys(settings).forEach((key) => {
      userConstraints[key] = settings[key]
    })

    var type = settings.kind === "audio" ? "audio" : "video"
    allConstraints[type] = userConstraints
    if(type==="audio"){
      allConstraints.video = false
    } else {
      allConstraints.audio = false
    }

    callback(null, allConstraints)
  }
}

function getSettingsFromStream(stream) {
  var settings = {}
  if (stream && stream !== null) {
    stream.getTracks().forEach((track) =>
    settings[track.kind] = track.getSettings()
  )
}
return settings
}
