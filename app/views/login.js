// @todo: how to select no media
var html = require('choo/html')
var Component = require('choo/component')
const input = require('./components/input.js')
// const Dropdown = require('./components/dropdown.js')
const Video = require('./components/funvideocontainer.js')
const enumerateDevices = require('enumerate-devices')
const MediaSettings = require('./mediaSettings.js')
const AddMedia = require('./addMedia.js')


// const audioDropdown = Dropdown()
// const videoDropdown = Dropdown()

const dropdown = (options, selected) => html`
  ${options.map((opt) => html`
    <option class="dark-gray" value=${opt.value} ${opt.value === selected? 'selected':''}>${opt.label}</option>
  `)}
`
const modal = (content, name, label, state, emit) => {
  if(state.layout.panels[name]) {
    return html`
      <div class="pa2 pa4-ns fixed w-100 h-100 top-0 left-0" style="pointer-events:all;background:rgba(213, 0, 143, 0.8)">
      <i
              class="fas fa-times absolute top-0 right-0 ma1 ma4-ns fr f4 dim pointer"
              title="close ${label}"
              aria-hidden="true"
              onclick=${() =>{ emit('layout:toggleMenuItem', name, 'panels')}} >
      </i>
        ${content}
      </div>
    `
  } else {
    return html`<div style="display:none">${content}</div>`
  }
}

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
    this.isActive = { audio: false, video: false}
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
      console.log('devicces', devices)
      this.devices.audio = devices.filter((elem) => elem.kind == 'audioinput')
      this.devices.video = devices.filter((elem) => elem.kind == 'videoinput')
      this.devices.audio.push({
        label: 'no audio',
        deviceId: 'false'
      })
      this.devices.video.push({
        label: 'no video',
        deviceId: 'false'
      })
      if (this.devices.audio.length > 0) {
        this.isActive.audio = true
         this.getMedia('audio')
       }
      if (this.devices.video.length > 0) {
        this.isActive.video = true
        this.getMedia('video')
      }
      this.rerender
  //    this.createElement(state, emit)
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


  // getMedia(kind, value) {
  //   this.selectedDevices[kind] = this.devices[kind][value]
  //   console.log('getting', this.selectedDevices[kind])
  //   const initialConstraints = {
  //     audio: false,
  //     video: false
  //   }
  //   if (this.selectedDevices[kind].deviceId !== false) {
  //     initialConstraints[kind] = {
  //       deviceId: this.selectedDevices[kind].deviceId
  //     }
  //     console.log(initialConstraints)
  //     navigator.mediaDevices.getUserMedia(initialConstraints)
  //       .then((stream) => {
  //         console.log(`%c got user media (${kind})`, 'background: #0044ff; color: #fff', stream.getTracks())
  //         this.tracks[kind] = stream.getTracks().filter((track) => track.kind == kind)[0]
  //         this.trackInfo[kind] = this.tracks[kind].getSettings()
  //         this.rerender()
  //       }).catch((err) => {
  //         //this.emit('log:error', err)
  //         this.log('error', err)
  //       })
  //   } else {
  //     this.tracks[kind] = null
  //     this.rerender()
  //   }
  // }

  getMedia(kind) {
    console.log('active', this.isActive)
    let initialConstraints = { audio: false, video: false}
    initialConstraints[kind] = {
          deviceId: this.selectedDevices[kind].deviceId
        }
    if(this.isActive[kind]) {
      navigator.mediaDevices.getUserMedia(initialConstraints)
      .then((stream) => {
        this.tracks[kind] = stream.getTracks().filter((track) => track.kind == kind)[0]
      //  this.streams[kind] = stream
        window.stream = stream
        console.log(`%c got user media (${kind})`, 'background: #0044ff; color: #f00', stream.getTracks(), this.tracks)
        this.rerender()
      //  this.applyConstraints(kind)
      }).catch((err) => {
        this.log('error', err)
      })
    } else {
      this.tracks[kind] = null
  //    this.streams[kind] = null
      this.rerender()
    }
  }

  createElement(state, emit) {
    //  this.local.center = center
    //  this.dropDownEl =
    //  console.log('creating element', this)
    const dropdowns = ['audio', 'video'].map((kind) => html`<select name=${kind} class="w-100 pa2 white ttu ba b--white pointer" style="background:none;/*font-size:3vw*/" onchange=${(e)=>{
      this.selectedDevices[kind] = this.devices[kind].filter((device) => device.deviceId === e.target.value)[0]
      if(this.selectedDevices[kind].deviceId === 'false') {
        this.isActive[kind] = false
      } else {
        this.isActive[kind] = true
      }
      this.getMedia(kind)
    }}>
    ${dropdown(
      this.devices[kind].map((device, index) => (  { value: device.deviceId,  label:  device.label })),
      this.selectedDevices[kind].deviceId,

    )}
    </select>`)

    return html`<div class="fixed w-100 h-100 top-0 left-0">
      ${Video({
        htmlProps: {
          class: 'w-100 h-100',
          style: 'object-fit:cover'
        },
        index: "login",
        track: this.tracks.video,
        id: this.tracks.video === null ? null : this.tracks.video.id
      })}
      <div class="fixed w-100 h-100 top-0 left-0 f2 ttu lh-title pa2" style="background:rgba(213, 0, 143, 0.8)">
        <div class="absolute right-0 bottom-0" style="transform: rotate(-90deg) translate(100%, 0);transform-origin:right bottom;">
          by CultureHub
        </div>
        <div class="fixed w-100 h-100">
          <div style=""> LiveLab ...................</div>
          <div style=""> An Experimental <br> Interface <br> For Web-based <br> Performance </div>
          <div class="mt4 w-100">
            ${dropdowns[0]}
            ${dropdowns[1]}
            <input type="text" placeholder="name" value=${this.nickname} class="pa2 ba b--white white w-100" style="background:none" onkeyup=${(e) => this.nickname = e.target.value} />
            <div class="dim pointer mt4" onclick=${this.openSettings.bind(this)}>${'>> Settings'}</div>
            <div class="dim pointer" onclick=${() => {
                  var tracks = Object.values(this.tracks).filter((track) => track !== null)
                  emit('user:join',  {room: this.room, server: this.server, stream: new MediaStream(tracks), nickname: this.nickname, requestMedia: true})
                }}>${state.user.room? '>> Start': '>> Start'}</div>
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

// <div class="">
// <input type="text" value=${this.nickname} class="pa2 ba b--white white w-100" style="background:none" onkeyup=${this.nickname = e.target.value }> </input>
// </div>
//
// return html `
// <div>
//   <div>
//   ${Video({
//     htmlProps: {
//       class: 'w-100 h-100'
//     },
//     index: "login",
//     track: this.tracks.video,
//     id: this.tracks.video === null ? null : this.tracks.video.id
//   })}
//   </div>
//
//   <div class="vh-100 dt w-100 fixed top-0 left-0 ttu f0">
//   <!--initation content outside transparent block-->
//     <div> LiveLab ......</div>
//     <div> An Experimental <br> Interface <br> For Web-based <br> Performance <div>
//      <!-- //hide the version
//      <legend class="mb3">v${state.user.version}</legend>
//      -->
//
//      ${input('Name', 'Your name', {  value: this.nickname,  onkeyup: (e) => { this.nickname = e.target.value } })}
//      <!-- //hide room options
//      ${input('Room', 'Room name', { value: this.room, onkeyup: (e) => { this.room = e.target.value } })}
//      -->
//      <!-- // hide the signalling server options
//      ${input('Signalling server', 'e.g. http://server.glitch.me', { value: this.server, onkeyup: (e) => { this.server = e.target.value} })}
//      -->
//      </div>
//
//      <legend class="f4 fw6 ph0 mh0">Select Input Devices
//       <i class="fas fa-cog ma2 dim pointer" aria-hidden="true" onclick=${this.openSettings.bind(this)} ></i>
//      </legend>
//
//      <div id="dropdownMenuInit">
//        <article>
//         ${this.audioDropdown}
//         <div class="mv0 ml1 fl"><i class="fas fa-microphone-slash icon-24px-red ma2 dim pointer"></i></div>
//        </article>
//        <article>
//         ${this.videoDropdown}
//         <div class="mv0 ml1 fl"><i class="fas fa-video icon-24px-green ma2 dim pointer"></i></div>
//       </article>
//
//      </div>
//
//     <!-- restyle the join button
//      <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer" onclick=${() => {
//       var tracks = Object.values(this.tracks).filter((track) => track !== null)
//       emit('devices:startCall',  {room: this.room, server: this.server, stream: new MediaStream(tracks), nickname: this.nickname, requestMedia: true})
// }}>Join</div>
//      -->
//      <div class="w-25 font-Inter fs-normal f4 b pv3 ph4 link dim mv3 dib white bg-livelab-orange pointer br4" id="joinButton" onclick=${() => {
//        var tracks = Object.values(this.tracks).filter((track) => track !== null)
//        emit('user:join',  {room: this.room, server: this.server, stream: new MediaStream(tracks), nickname: this.nickname, requestMedia: true})
//      }}>${state.user.room? 'Join': 'Start'}</div>
//      <div> ${state.user.statusMessage} </div>
//     </div>
//   </div>
// </div>
//   ${this.mediaSettings.render(this.settingsIsOpen, {
//     selectedDevices: this.selectedDevices,
//     tracks: this.tracks
//   })}
// </div>
// `

//   <!--  ${MediaSettings(state.devices, emit, { showElement: state.devices.default.constraints.isOpen})} --->
