// @todo: how to select no media
var html = require('choo/html')
var Component = require('choo/component')
const input = require('./components/input.js')
const Dropdown = require('./components/dropdown.js')
const Video = require('./components/funvideocontainer.js')
const enumerateDevices = require('enumerate-devices')
const MediaSettings = require('./mediaSettings.js')


const audioDropdown = Dropdown()
const videoDropdown = Dropdown()

module.exports = class Login extends Component {
  constructor (id, state, emit) {
    super(id)
  //  console.log('loading login', state, emit)
    this.previewVideo = null
    this.nickname = state.user.nickname
    this.room = state.user.room
    this.server = state.user.server
    this.state = state
    this.emit = emit
    this.devices = { audio: [], video: [] }
    this.selectedDevices = { audio: null, video: null }
    this.tracks = { audio: null, video: null }
    this.trackInfo = { audio: {}, video: {} }

//    this.devices.audio = []
  //  this.devices.video = []
    // this.selectedDevices.audio = null
    // this.selectedDevices.video = null
  //  this.tracks.video = null
    this.settingsIsOpen = true
    this.mediaSettings = new MediaSettings({
      onSave: this.updateMedia.bind(this),
      onClose: this.closeSettings.bind(this)
    })
    enumerateDevices().then((devices) => {
      this.devices.audio = devices.filter((elem) => elem.kind == 'audioinput')
      this.devices.video = devices.filter((elem) => elem.kind == 'videoinput')
      if(this.devices.audio.length > 0) this.setAudio(0)
      if(this.devices.video.length > 0) this.setVideo(0)
      this.createElement(state, emit)
    //  console.log(this, this.devices.audio)
    }).catch((err) => emit('log:error', err))
  }

  load (element) {
  //  console.log('loading')

  }

  updateMedia() {
//    console.log(this.mediaSettings)
    this.tracks = Object.assign({}, this.mediaSettings.tracks)
    this.trackInfo = Object.assign({}, this.mediaSettings.trackInfo)
    this.selectedDevices = Object.assign({}, this.mediaSettings.selectedDevices)
    this.devices =  Object.assign({}, this.mediaSettings.devices)
    this.settingsIsOpen = false
    this.createElement(this.state, this.emit)
  }

  closeSettings() {
    this.settingsIsOpen = false
    this.createElement(this.state, this.emit)
  }

  openSettings() {
    this.settingsIsOpen = true
    this.createElement(this.state, this.emit)
  }

  update (center) {
    //
    return true
  }

  setAudio(value) {
    this.selectedDevices.audio = value
    navigator.mediaDevices.getUserMedia({ audio: { deviceId: this.devices.audio[value].deviceId }, video: false })
      .then((stream) => {
      //   console.log('stream is', stream)
         this.tracks.audio = stream.getAudioTracks()[0]
         this.trackInfo.audio = this.tracks.audio.getSettings()
      }).catch((err) => {
        this.emit('log:error', err)
      })
    this.createElement(this.state, this.emit)
  }

  setVideo(value) {
    this.selectedDevices.video = value
    navigator.mediaDevices.getUserMedia({ audio: false, video: { deviceId: this.devices.video[value].deviceId } })
      .then((stream) => {
      //   console.log('stream is', stream)
         this.tracks.video = stream.getVideoTracks()[0]
         this.trackInfo.video = this.tracks.video.getSettings()
         this.createElement(this.state, this.emit)
      }).catch((err) => {
        this.emit('log:error', err)
      })
    this.createElement(this.state, this.emit)
  }

  createElement (state, emit) {
    //  this.local.center = center
  //  this.dropDownEl =
    console.log('creating element', this)
    this.audioDropdown = audioDropdown.render({
      value: 'Audio:  ' + (this.selectedDevices.audio === null ? '' : this.devices.audio[this.selectedDevices.audio].label),
      options: this.devices.audio.map((device, index) => (  { value: index,  label: device.label })),
      onchange:   this.setAudio.bind(this)
    })

    this.videoDropdown = videoDropdown.render({
        value: 'Video:  ' + (this.selectedDevices.video === null ? '' : this.devices.video[this.selectedDevices.video].label),
        options: this.devices.video.map((device, index) => (  { value: index, label: device.label})),
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
        track: this.tracks.video,
        id: this.tracks.video === null ? null : this.tracks.video.id
      })}
      </div>
    <div class="vh-100 dt w-100 fixed top-0 left-0">
      <div class="dtc v-mid">
        <div class="w-40 center">
        <legend class="f1 fw6 ph0 mh0">LIVE LAB </legend>
        <legend class="mb3">v${state.user.version}</legend>
        <legend class="f4 fw6 ph0 mh0">Join Session</legend>
        ${input('Nickname', 'Your name', {  value: this.nickname,  onkeyup: (e) => { this.nickname = e.target.value } })}
        ${input('Room', 'Room name', {  value: this.room, onkeyup: (e) => { this.room = e.target.value}})}
        ${input('Signalling server', 'e.g. http://server.glitch.me', { value: this.server, onkeyup: (e) => { this.server = e.target.value} })}
       <legend class="f4 fw6 ph0 mh0">Choose Default Input Devices
          <i class="fas fa-cog ma2 dim pointer" aria-hidden="true" onclick=${this.openSettings.bind(this)} ></i>
        </legend>
          ${this.audioDropdown}
          ${this.videoDropdown}
        <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer" onclick=${() => (emit('devices:startCall',  {requestMedia: true}))}>Join</div>
        <div> ${state.user.statusMessage} </div>


        </div>
        </div>
      </div>
       ${this.mediaSettings.render(this.settingsIsOpen)}
    </div>
    `
  }
}

//   <!--  ${MediaSettings(state.devices, emit, { showElement: state.devices.default.constraints.isOpen})} --->
