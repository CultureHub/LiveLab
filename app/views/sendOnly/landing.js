'use strict'

const html = require('choo/html')
const login = require('./sendonly-login.js')
const Video = require('./../components/funvideocontainer.js')

//const workspace = require('./workspace.js')

module.exports = mainView
function mainView (state, emit) {
  if (!state.user.loggedIn) {
    return html`
    <div>
      ${login(state, emit)}
    </div>
    `
  } else {
    var defaultStream  = state.peers.byId[state.user.uuid].defaultStream
    return html`
    <div class="w-100 h-100 mw-100 dt pa4">
        ${Video({
          // htmlProps: {
          //   class: 'h-50 w-100'
          // },
          index: 'stream-preview',
          stream: state.media.byId[defaultStream].stream,
          id: state.media.byId[defaultStream].stream.id,
          includeAudio: false
        })
      }
      <div class="ma4">
        <div><span class="i mr2">video: </span> ${getVideoInfo(state.media.byId[defaultStream])}</div>
        <div><span class="i mr2">audio: </span> ${getAudioInfo(state.media.byId[defaultStream])}</div>
        <div><span class="i mr2">name: </span> ${state.peers.byId[state.user.uuid].nickname}</div>
        <div><span class="i mr2">room: </span> ${state.user.room}</div>
        <div class="mt3 i">sending media to:</div>
        <ul>
        ${state.peers.all.filter((id) => id !== state.user.uuid).map((peerId) => html`<li>${state.peers.byId[peerId].nickname}</li>`)}
        </ul>
    </div>
    </div>
    `
  }
}

function getVideoInfo(stream) {
  let settingsString = ''
  if(stream.settings && stream.settings.video) {
      if(stream.settings.video.width) {
        settingsString += stream.settings.video.width + 'x' + stream.settings.video.height
      }
      if(stream.settings.video.frameRate) {
          settingsString += ', ' + stream.settings.video.frameRate + 'fps'
      }
    }
  return settingsString
}

function getAudioInfo(stream) {
  let settingsString = '--'
  if(stream.settings && stream.settings.audio) {
      if(stream.settings.audio.sampleRate) {
        settingsString = stream.settings.audio.sampleRate/1000+ 'kHz'
      }
    }
  return settingsString
}
