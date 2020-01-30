'use strict'

const html = require('choo/html')
const input = require('./components/input.js')
const Dropdown = require('./components/dropdown.js')
const Video = require('./components/funvideocontainer.js')

const MediaSettings = require('./mediaSettings.js')

module.exports = loginView

const audioDropdown = Dropdown()
const videoDropdown = Dropdown()

function loginView (state, emit) {
  var audioinput = state.devices.audioinput
  var videoinput = state.devices.videoinput
  var defaultAudio = state.devices.default.inputDevices.audio
  var defaultVideo = state.devices.default.inputDevices.video

  return html`
  <div>
    <div>
     ${Video({
       htmlProps: {
         class: 'w-100 h-100'
       },
       index: "login",
       track: state.devices.default.previewTracks.video,
       id: state.devices.default.previewTracks.video === null ? null : state.devices.default.previewTracks.video.id
     })}
    </div>
    <div class="vh-100 dt w-100 fixed top-0 left-0">
      <div class="dtc v-mid">
        <div class="w-40 center">
          <legend class="f1 fw6 ph0 mh0">LIVE LAB</legend>
          <legend class="f4 fw6 ph0 mh0">Join Session</legend>
          ${input('Nickname', 'how you will appear to everyone else', {
            value: state.peers.byId[state.user.uuid].nickname,
            onkeyup: setNickname
          })}
          ${input('Room', 'room name', {
            value: state.user.room,
            onkeyup: setRoom
          })}
          ${input('Signalling server', 'e.g. http://server.glitch.me', {
            value: state.user.server,
            onkeyup: setServer
          })}
          <legend class="f4 fw6 ph0 mh0">Choose Default Input Devices  <i
                    class="fas fa-cog ma2 dim pointer"
                    aria-hidden="true"
                    onclick=${()=>emit('devices:toggleSettings')} >
                  </i></legend>
          ${audioDropdown.render({
            value: 'Audio:  ' + (defaultAudio === null ? '' : audioinput.byId[defaultAudio].label),
            options: audioinput.all.map((id) => (
              {
                value: id,
                label: audioinput.byId[id].label
              }
            )),
            onchange: (value) => {
              emit('devices:setDefaultAudio', value)
            }
          })}
          ${videoDropdown.render({
            value: 'Video:  ' + (defaultVideo === null ? '' : videoinput.byId[defaultVideo].label),
            options: videoinput.all.map((id) => (
              {
                value: id,
                label: videoinput.byId[id].label
              }
            )),
            onchange: (value) => {
              emit('devices:setDefaultVideo', value)
            }
          })}

          <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer" onclick=${() => (emit('user:join'))}>Join</div>
          <div> ${state.user.statusMessage} </div>

          ${MediaSettings(state.devices, emit, { showElement: state.devices.default.constraints.isOpen})}
        </div>
      </div>
    </div>
  </div>
  `
  function setNickname (e) {
    emit('user:setNickname', e.target.value)
  }

  function setRoom (e) {
    emit('user:setRoom', e.target.value)
  }

  function setServer (e) {
    emit('user:setServer', e.target.value)
  }
}
