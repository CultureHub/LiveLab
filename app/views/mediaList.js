'use strict'
const html = require('choo/html')
const inspector = require('./inspector.js')
const panel = require('./components/panel.js')

module.exports = mediaListView

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

function geAudioInfo(stream) {
  let settingsString = '--'
  if(stream.settings && stream.settings.audio) {
      if(stream.settings.audio.sampleRate) {
        settingsString = stream.settings.audio.sampleRate/1000+ 'kHz'
      }
    }
  return settingsString
}

function mediaListView (state, emit) {
  console.log('media info', state.media)
  return html`
    <div class="pa3 dib" style="width:100%">
    <!---<h3>Current Room Name: <b>${state.user.room}</b></h3>--->
    <table style="width:100%" cellspacing="0" cellpadding="0" >
      <thead>
        <tr>
          <th style="width:20%">PEER</th>
          <th style="width:20%">NAME</th>
          <th style="width:20%">VIDEO</th>
          <th style="width:40%">AUDIO</th>
        </tr>
      </thead>
      </table>
      <div style="max-height:180px;overflow-y:auto">
        <table cellspacing="0" cellpadding="0" >
          <tbody>
          ${Object.keys(state.media.byId).map((id) => {
            var media = state.media.byId[id]
            var className = id === state.ui.inspector ? 'bg-gray pointer' : 'dim pointer'
            // console.log(id, state.ui.inspector.trackId)
            return html`
              <tr class=${className}
                  draggable="true"
                  style="height:20px"
                  onclick=${() => { emit('ui:setInspectMedia', id) }}
                  ondragstart=${() => { emit('ui:dragStart', id) }}
              >
                <td class="pa1" style="width:20%;height:20px">${state.peers.byId[media.peerId].nickname}</td>
                <td class="pa1" style="width:20%;height:20px">${media.name}</td>
                <td class="pa1" style="width:20%;height:20px">${getVideoInfo(media)}</td>
                <td class="pa1" style="width:40%;height:20px">${geAudioInfo(media)}</td>
              </tr>
            `
          })}

          </tbody>
      </table>
      </div>
      <!--  <div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('devices:toggleAddBroadcast', true))}>+ Add Media Broadcast</div>-->
    </div>
    `
}
