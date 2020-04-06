// @todo: how to select no media
var html = require('choo/html')
var Component = require('choo/component')
const input = require('./components/input.js')
const Dropdown = require('./components/dropdown.js')
const Video = require('./components/funvideocontainer.js')
const enumerateDevices = require('enumerate-devices')

const audioDropdown = Dropdown()
const videoDropdown = Dropdown()

module.exports = class Login extends Component {
  constructor (id, state, emit) {
    super(id)
    console.log('loading login', state, emit)
    this.previewVideo = null
    this.nickname = state.user.nickname
    this.room = state.user.room
    this.server = state.user.server
    this.state = state
    this.emit = emit
    this.audioDevices = []
    this.videoDevices = []
    this.selectedAudio = null
    this.selectedVideo = null
    this.videoTrack = null
    this.audioTrack = null
    enumerateDevices().then((devices) => {
      this.audioDevices = devices.filter((elem) => elem.kind == 'audioinput')
      this.videoDevices = devices.filter((elem) => elem.kind == 'videoinput')
      if(this.audioDevices.length > 0) this.setAudio(0)
      if(this.videoDevices.length > 0) this.setVideo(0)
      this.render(state, emit)
      console.log(this, this.audioDevices)
    }).catch((err) => emit('log:error', err))
  }

  load (element) {
    console.log('loading')

  }

  update (center) {
    //
    return true
  }

  setAudio(value) {
    this.selectedAudio = value
    navigator.mediaDevices.getUserMedia({ audio: { deviceId: this.audioDevices[value].deviceId }, video: false })
      .then((stream) => {
         console.log('stream is', stream)
         this.audioTrack = stream.getAudioTracks()[0]
      }).catch((err) => {
        this.emit('log:error', err)
      })
    this.render(this.state, this.emit)
  }

  setVideo(value) {
    this.selectedVideo = value
    navigator.mediaDevices.getUserMedia({ audio: false, video: { deviceId: this.videoDevices[value].deviceId } })
      .then((stream) => {
         console.log('stream is', stream)
         this.videoTrack = stream.getVideoTracks()[0]
         this.render(this.state, this.emit)
      }).catch((err) => {
        this.emit('log:error', err)
      })
    this.render(this.state, this.emit)
  }

  // getLocalMedia({ kind, deviceId}) {
  //   navigator.mediaDevices.getUserMedia({ kind: kind, deviceId: deviceId })
  //     .then((stream) => {
  //       //callback(null, stream)
  //       console.log('stream is', stream)
  //     }).catch((err) => {
  //       callback(err)
  //     })
  // }

  createElement (state, emit) {
    //  this.local.center = center
  //  this.dropDownEl =
    console.log('creating element', state, this)
    this.audioDropdown = audioDropdown.render({
      value: 'Audio:  ' + (this.selectedAudio === null ? '' : this.audioDevices[this.selectedAudio].label),
      options: this.audioDevices.map((device, index) => (  { value: index,  label: device.label })),
      onchange:   this.setAudio.bind(this)
    })

    this.videoDropdown = videoDropdown.render({
        value: 'Video:  ' + (this.selectedVideo === null ? '' : this.videoDevices[this.selectedVideo].label),
        options: this.videoDevices.map((device, index) => (  { value: index, label: device.label})),
        onchange: this.setVideo.bind(this)
      })

    return html`
    <div>
      <div>
      ${Video({
        htmlProps: {
          class: 'w-100 h-100'
        },
        index: "login",
        track: this.videoTrack,
        id: this.videoTrack === null ? null : this.videoTrack.id
      })}
      </div>
    <div class="vh-100 dt w-100 fixed top-0 left-0">
      <div class="dtc v-mid">
        <div class="w-40 center">
        <legend class="f1 fw6 ph0 mh0">LIVE LAB </legend>
        <legend class="mb3">v${state.user.version}</legend>
        <legend class="f4 fw6 ph0 mh0">Join Session</legend>
        ${input('Nickname', 'Your name', {
          value: this.nickname,
        //  onkeyup: setNickname
        })}
        ${input('Room', 'Room name', {
          value: this.room,
        //  onkeyup: setRoom
        })}
        ${input('Signalling server', 'e.g. http://server.glitch.me', {
          value: this.server,
        //  onkeyup: setServer
        })}
       <legend class="f4 fw6 ph0 mh0">Choose Default Input Devices  <i
        class="fas fa-cog ma2 dim pointer"
        aria-hidden="true"
        onclick=${()=>emit('devices:toggleSettings')} >
        </i></legend>
        ${this.audioDropdown}
          ${this.videoDropdown}
        <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer" onclick=${() => (emit('devices:startCall',  {requestMedia: true}))}>Join</div>
        <div> ${state.user.statusMessage} </div>


        </div>
        </div>
      </div>
    </div>
    `
  }
}

//   <!--  ${MediaSettings(state.devices, emit, { showElement: state.devices.default.constraints.isOpen})} --->
