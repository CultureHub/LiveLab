const enumerateDevices = require('enumerate-devices')
const getUserMedia = require('getusermedia')
const Screen = require('./screenmedia.js')

const xtend = Object.assign

module.exports = devicesModel

function devicesModel (state, bus) {
  // object representing the user's input and output devices
  state.devices = xtend({
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
    addBroadcast: {
      active: false,
      kind: "video",
      name: "",
      errorMessage: "",
      kinds: {
        // audio: {
        //   deviceId: null
        // },
        video: {
          deviceId: null
        }
      },
      previewTrack: null
    },
    default: {
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
      }
    }
  }, state.devices)

  // on page init, get user devices and load default constraints from json
  // TO DO: put this function somewhere else
  window.onload = function () {
    getDevices()
    loadConstraints()
    //check whether screen share extension is installed OR using nw.js version
   if(sessionStorage.getScreenMediaJSExtensionId || typeof nw == "object"){
      state.devices.addBroadcast.kinds.screen =  {
        deviceId: null
      }
  }
    bus.emit('peers:updatePeer', {
      peerId: state.user.uuid
    })
  }


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
              console.log('DEVICES', state.devices)
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

  /**
  ** UI event handlers for Add Broadcast Media Pop-up
  **/

  bus.on('devices:setBroadcastName', function(name){
    state.devices.addBroadcast.name = name
    bus.emit('render')
  })

  bus.on('devices:updateBroadcastDevice', function(obj){
    xtend(state.devices.addBroadcast.kinds[state.devices.addBroadcast.kind], obj)
    bus.emit('render')
  })

  //accepts an object containing the properties to update and their new values. e.g.
  // { echoCancellation : { value: true}}
  // bus.on('devices:updateBroadcastConstraints', function(obj){
  //   Object.keys(obj).forEach(key =>
  //     {
  //       xtend(state.devices.addBroadcast.kinds[state.devices.addBroadcast.kind][key], obj[key])
  //     }
  //   )
  //   bus.emit('render')
  // })

  bus.on('devices:updateBroadcastConstraint', function(obj){
//    xtend(state.devices.default.constraints[obj.kind].kinds[state.devices.addBroadcast.kind][key]

    state.devices.default.constraints[obj.kind][obj.constraint] = obj.value
    //updateLocalPreview('video')
    state.devices.default.previewTracks[obj.kind].applyConstraints(state.devices.default.constraints[obj.kind])
    .then(() => {
        state.devices.default.trackInfo[obj.kind] = state.devices.default.previewTracks[obj.kind].getSettings()
         bus.emit('render')
     // Do something with the track such as using the Image Capture API.
   })
   .catch(e => {
     // The constraints could not be satisfied by the available devices.
     // @to do: share error message
     console.log('constraints not satisfied', e)
     state.devices.default.trackInfo[obj.kind] = state.devices.default.previewTracks[obj.kind].getSettings()
      bus.emit('render')
   })

  })

  bus.on('devices:toggleAddBroadcast', function(val){
    state.devices.addBroadcast.active = val
    state.devices.addBroadcast.errorMessage = ""
    //if closing window, stop active preview stream
    if(val===false){
      if(state.devices.addBroadcast.previewTrack !== null) {
        state.devices.addBroadcast.previewTrack.stop()
        state.devices.addBroadcast.previewTrack = null
      }
    }

    bus.emit('render')
  })

  bus.on('devices:setBroadcastKind', function(val){
    state.devices.addBroadcast.kind = val
    if(state.devices.addBroadcast.previewTrack!==null){
      state.devices.addBroadcast.previewTrack.stop()
      state.devices.addBroadcast.previewTrack = null
    }
    bus.emit('render')
    if(val==="screen"){
      if(typeof nw == "object"){
        nw.Screen.chooseDesktopMedia(["window","screen"], (streamId)=>{
          state.devices.addBroadcast.kinds.screen.deviceId= streamId
          bus.emit('devices:updateBroadcastPreview')
        })
      } else {
        // Screen().then(function(response) {
        //   console.log("screen", response)
        // })
        chrome.runtime.sendMessage(sessionStorage.getScreenMediaJSExtensionId,
                {type:'getScreen', id: 1}, null,
                function (data) {
                    console.log("getting screen", data)
                    if (!data || data.sourceId === '') { // user canceled
                        var error = new Error('NavigatorUserMediaError');
                        error.name = 'NotAllowedError';
                        callback(error);
                    } else {
                      console.log("GOT INFO", data)
                      state.devices.addBroadcast.kinds.screen.deviceId= data.sourceId
                      bus.emit('devices:updateBroadcastPreview')
                    }
                  })
                        // constraints = (hasConstraints && constraints) || {audio: false, video: {
                        //     mandatory: {
                        //         chromeMediaSource: 'desktop',
                        //         maxWidth: window.screen.width,
                        //         maxHeight: window.screen.height,
                        //         maxFrameRate: 3
                        //     }
                        // }};


      }

    }
    // to do: if screen, show screen popup

    //set broadcast to default on c

  //  bus.emit('render')
  })

  //add available constraint options to devices model
  function loadConstraints(){
    // xtend(state.devices.addBroadcast.kinds.audio, constraintsJSON.audio)
    // xtend(state.devices.addBroadcast.kinds.video, constraintsJSON.video)
  }

  bus.on('devices:updateBroadcastPreview', function () {
    updateBroadcastPreview(function(err, track){
      bus.emit('render')
    })
  })

  // for now, assume only video
  bus.on('devices:addNewMediaToBroadcast', function () {
    var track = state.devices.default.previewTracks.video.clone()
    bus.emit('media:addTrack', {
         track: track,
         peerId: state.user.uuid,
         isDefault: false,
         name: state.devices.addBroadcast.name
       })
     bus.emit('user:updateBroadcastStream')
      bus.emit('render')
  })



  function updateBroadcastPreview(callback){
    state.devices.addBroadcast.errorMessage = ""
    getConstraintsFromSettings(xtend({}, state.devices.addBroadcast.kinds[state.devices.addBroadcast.kind], {kind: state.devices.addBroadcast.kind}), function (err, constraints) {
      if(err){
        state.devices.addBroadcast.errorMessage = err
        callback(err, null)
      } else {
        getLocalMedia(constraints, function(err, stream){
          if(err) {
            state.devices.addBroadcast.errorMessage = err
            callback(err, null)
          } else {
            var tracks = stream.getTracks()
            tracks.forEach(function (track) {
              if(state.devices.addBroadcast.previewTrack!==null){
                state.devices.addBroadcast.previewTrack.stop()
              }
              state.devices.addBroadcast.previewTrack = track
            })
            callback(null, state.devices.addBroadcast.previewTrack)
          }
        })
      }
    })
  }

  /** Helper functions for dealing with devices, get user media, and constraints **/

  function getLocalMedia(constraints, callback) {
    console.log('CONSTRAINTS', constraints)
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
    // for(var key in settings){
    //   //if the user has specified a value for a particular constraint, pass it along to getusermedia.
    //   //for right now, only specifies "ideal" value, device does the best it can to meet constraints.
    //   // see https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#Applying_constraints
    //   console.log(key)
    //   if(settings[key] && settings[key].value){
    //     userConstraints[key] = value
    //   }
    //     console.log(userConstraints)
    // }

    var type = settings.kind === "audio" ? "audio" : "video"
    allConstraints[type] = userConstraints
    if(type==="audio"){
      allConstraints.video = false
    } else {
      allConstraints.audio = false
    }
    console.log('CONSTRAINTS', allConstraints)
    callback(null, allConstraints)
  }
}
