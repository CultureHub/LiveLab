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
  constructor(id, state, emit) {
    super(id)
    //  console.log('loading login', state, emit)
    this.previewVideo = null
    this.nickname = state.user.nickname
    this.room = state.user.room
    this.server = state.user.server
    this.state = state
    this.emit = emit
    this.devices = {
      audio: [],
      video: []
    }
    this.selectedDevices = {
      audio: {
        label: 'initial',
        deviceId: ''
      },
      video: {
        label: 'initial',
        deviceId: ''
      }
    }
    this.tracks = {
      audio: null,
      video: null
    }
    this.trackInfo = {
      audio: {},
      video: {}
    }
    this.settingsIsOpen = false
    this.mediaSettings = new MediaSettings({
      onSave: this.updateMedia.bind(this),
      onClose: this.closeSettings.bind(this)
    })
    enumerateDevices().then((devices) => {
      this.devices.audio = devices.filter((elem) => elem.kind == 'audioinput')
      this.devices.video = devices.filter((elem) => elem.kind == 'videoinput')
      this.devices.audio.push({
        label: 'no audio',
        deviceId: false
      })
      this.devices.video.push({
        label: 'no video',
        deviceId: false
      })
      if (this.devices.audio.length > 0) this.getMedia('audio', 0)
      if (this.devices.video.length > 0) this.getMedia('video', 0)
      this.createElement(state, emit)
      //  console.log(this, this.devices.audio)
    }).catch((err) => emit('log:error', err))
  }

  load(element) {
    //  console.log('loading')

  }

  updateMedia() {
    //    console.log(this.mediaSettings)
    this.tracks = Object.assign({}, this.mediaSettings.tracks)
    this.trackInfo = Object.assign({}, this.mediaSettings.trackInfo)
    this.selectedDevices = Object.assign({}, this.mediaSettings.selectedDevices)
    this.devices = Object.assign({}, this.mediaSettings.devices)
    this.settingsIsOpen = false
    this.rerender()
  }

  closeSettings() {
    this.settingsIsOpen = false
    this.rerender()
  }

  openSettings() {
    this.settingsIsOpen = true
    this.rerender()
  }

  update(center) {
    //
    return true
  }

  log(type, message) {
    console[type](message)
  }


  getMedia(kind, value) {
    this.selectedDevices[kind] = this.devices[kind][value]
    console.log('getting', this.selectedDevices[kind])
    const initialConstraints = {
      audio: false,
      video: false
    }
    if (this.selectedDevices[kind].deviceId !== false) {
      initialConstraints[kind] = {
        deviceId: this.selectedDevices[kind].deviceId
      }
      console.log(initialConstraints)
      navigator.mediaDevices.getUserMedia(initialConstraints)
        .then((stream) => {
          console.log(`%c got user media (${kind})`, 'background: #0044ff; color: #fff', stream.getTracks())
          this.tracks[kind] = stream.getTracks().filter((track) => track.kind == kind)[0]
          this.trackInfo[kind] = this.tracks[kind].getSettings()
          this.rerender()
        }).catch((err) => {
          //this.emit('log:error', err)
          this.log('error', err)
        })
    } else {
      this.tracks[kind] = null
      this.rerender()
    }
  }


  createElement(state, emit) {
    //  this.local.center = center
    //  this.dropDownEl =
    //  console.log('creating element', this)
    this.audioDropdown = audioDropdown.render({
      value: 'Audio:  ' + (this.selectedDevices.audio === null ? '' : this.selectedDevices.audio.label),
      options: this.devices.audio.map((device, index) => ({
        value: index,
        label: device.label
      })),
      // onchange:   this.setAudio.bind(this)
      onchange: (value) => this.getMedia('audio', value)
    })

    this.videoDropdown = videoDropdown.render({
      value: 'Video:  ' + (this.selectedDevices.video === null ? '' : this.selectedDevices.video.label),
      options: this.devices.video.map((device, index) => ({
        value: index,
        label: device.label
      })),
      onchange: (value) => this.getMedia('video', value)
    })

    return html `
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
      <!--initation content outside transparent block-->
      <div class="flex v-mid" id="iniContBlock">
        <!--
         <div class="w-40 center">
        -->
        <div class="w-90 fl " id="iniCont"> <!--the initiation content-->
         <legend>
          <a class="mb3 font-Inter fs-normal b f1 livelab-orange" id="livelabTitle" >LiveLab</a>
          <a class="mb3 ml2 font-Inter fs-normal fw6-ns f6" id="livelabCredit"> by Culturehub </a>
         </legend>

         <!-- //hide the version
         <legend class="mb3">v${state.user.version}</legend>
         -->
         <legend class="font-Inter fs-normal fw6 ph0 mt2 mh0" id="introCont">Video Call Software for Networked Performance</legend>
         <div id="infoInput">
         ${input('Name', 'Your name', {  value: this.nickname,  onkeyup: (e) => { this.nickname = e.target.value } })}
         <!-- //hide room options
         ${input('Room', 'Room name', { value: this.room, onkeyup: (e) => { this.room = e.target.value } })}
         -->
         <!-- // hide the signalling server options
         ${input('Signalling server', 'e.g. http://server.glitch.me', { value: this.server, onkeyup: (e) => { this.server = e.target.value} })}
         -->
         </div>

         <legend class="f4 fw6 ph0 mh0">Select Input Devices
          <i class="fas fa-cog ma2 dim pointer" aria-hidden="true" onclick=${this.openSettings.bind(this)} ></i>
         </legend>

         <div id="dropdownMenuInit">
           <article>
            ${this.audioDropdown}
            <div class="mv0 ml1 fl"><i class="fas fa-microphone-slash icon-24px-red ma2 dim pointer"></i></div>
           </article>
           <article>
            ${this.videoDropdown}
            <div class="mv0 ml1 fl"><i class="fas fa-video icon-24px-green ma2 dim pointer"></i></div>
          </article>

         </div>

        <!-- restyle the join button
         <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer" onclick=${() => {
          var tracks = Object.values(this.tracks).filter((track) => track !== null)
          emit('devices:startCall',  {room: this.room, server: this.server, stream: new MediaStream(tracks), nickname: this.nickname, requestMedia: true})
    }}>Join</div>
         -->
         <div class="w-25 font-Inter fs-normal f4 b pv3 ph4 link dim mv3 dib white bg-livelab-orange pointer br4" id="joinButton" onclick=${() => {
           var tracks = Object.values(this.tracks).filter((track) => track !== null)
           emit('user:join',  {room: this.room, server: this.server, stream: new MediaStream(tracks), nickname: this.nickname, requestMedia: true})
         }}>${state.user.room? 'Join': 'Start'}</div>
         <div> ${state.user.statusMessage} </div>
        </div>
      </div>
    </div>
      ${this.mediaSettings.render(this.settingsIsOpen, {
        selectedDevices: this.selectedDevices,
        tracks: this.tracks
      })}
    </div>
    `
  }
}


//   <!--  ${MediaSettings(state.devices, emit, { showElement: state.devices.default.constraints.isOpen})} --->
