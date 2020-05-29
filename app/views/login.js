// @todo: how to select no media
var html = require('choo/html')
var Component = require('choo/component')
const input = require('./components/input.js')
// const Dropdown = require('./components/dropdown.js')
const Video = require('./components/funvideocontainer.js')
const enumerateDevices = require('enumerate-devices')
// const MediaSettings = require('./mediaSettings.js')
const AddMedia = require('./addMedia.js')


// const audioDropdown = Dropdown()
// const videoDropdown = Dropdown()

const dropdown = (options, selected) => html `
  ${options.map((opt) => html`
    <option class="dark-gray" value=${opt.value} ${opt.value === selected? 'selected':''}>${opt.label}</option>
  `)}
`
const modal = (content, isOpen, onClose) => {
  if (isOpen) {
    return html `
      <div class="pa0 pa4-ns fixed w-100 h-100 top-0 left-0 bg-livelab-gray" style="pointer-events:all">
      <i
              class="fas fa-times absolute top-0 right-0 ma1 ma2-ns fr f4 dim pointer"
              title="close settings"
              aria-hidden="true"
              onclick=${onClose} >
      </i>
        ${content}
      </div>
    `
  } else {
    return html `<div style="display:none"></div>`
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
    this.isActive = {
      audio: false,
      video: false
    }
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
    // this.mediaSettings = new AddMedia({
    //   onSave: this.updateMedia.bind(this),
    //   onClose: this.closeSettings.bind(this)
    // })
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
      this.rerender()
      //    this.createElement(state, emit)
      //  console.log(this, this.devices.audio)
    }).catch((err) => emit('log:error', err))
  }

  load(element) {
    //  console.log('loading')

  }

  updateMedia(mediaObj) {
    console.log('UPDATING', this, mediaObj)
    //    console.log(this.mediaSettings)
    this.tracks = Object.assign({}, mediaObj.tracks)
    this.trackInfo = Object.assign({}, mediaObj.trackInfo)
    this.selectedDevices = Object.assign({}, mediaObj.selectedDevices)
    this.devices = Object.assign({}, mediaObj.devices)
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
    let initialConstraints = {
      audio: false,
      video: false
    }
    initialConstraints[kind] = {
      deviceId: this.selectedDevices[kind].deviceId
    }
    if (this.isActive[kind]) {
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
    let self = this
    const dropdowns = ['video', 'audio'].map((kind) => html `<select name=${kind} class="w-70 fw-text pa2 white ttu ba b--white pointer" style="background:none;/*font-size:3vw*/" onchange=${(e)=>{
      this.selectedDevices[kind] = this.devices[kind].filter((device) => device.deviceId === e.target.value)[0]
      if(this.selectedDevices[kind].deviceId === 'false') {
        this.isActive[kind] = false
      } else {
        this.isActive[kind] = true
      }
      this.getMedia(kind)
    }}>
    ${dropdown(
      this.devices[kind].map((device, index) => ({ value: device.deviceId,  label: kind+':'+' '+device.label })),
      this.selectedDevices[kind].deviceId,

    )}
    </select>`)

    return html `<div class="fixed w-100 h-100 top-0 left-0">
      ${Video({
        htmlProps: {
          class: 'w-100 h-100',
          style: 'object-fit:cover'
        },
        index: "login",
        track: this.tracks.video,
        id: this.tracks.video === null ? null : this.tracks.video.id
      })}
      <div class="bg-black-50 fixed w-100 h-100 top-0 left-0 f2 ttu lh-title pa2">
        <div class="pl2 absolute left-0 bottom-0 dim pointer">
        <a href="https://www.culturehub.org/livelab" style="text-decoration: none; color: white">info</a>
        </div>
        <div class="fixed w-100 h-100">
        <div class = "f5 fw3" style="letter-spacing:0.2em;">by CultureHub</div>
        <div class="fw5 "> LiveLab </div>
        <div class="fw3"> 
          A Browser-based 
          <br> 
          <span class="bg-livelab-gray">Media Router</span>
          <br> 
          For Collaborative 
          <br> Performance 
        </div>
        <div class="w-100">
          <section class="mt4">
            ${dropdowns[0]} 
            ${dropdowns[1]}
          </section> 
        <div class="dim pointer mb4 fw5 livelab-yellow" onclick=${this.openSettings.bind(this)}>
         ${'>> Settings'}
        </div> 
        <input type="text" placeholder="name" value=${this.nickname} class="fw3 pa2 ba b--white white w-70 ttu" style="background:none" onkeyup=${(e) => this.nickname = e.target.value} />
            <div class="dim pointer fw5 livelab-yellow" onclick=${() => {
                  var tracks = Object.values(this.tracks).filter((track) => track !== null)
                  emit('user:join',  {room: this.room, server: this.server, stream: new MediaStream(tracks), nickname: this.nickname, requestMedia: true})
                }}>
                ${state.user.room? '>> Start': '>> Start'}</div>
          </div>
        </div>
      </div>
      ${modal(state.cache(AddMedia, 'login-settings').render({
          selectedDevices: this.selectedDevices,
          isActive: this.isActive,
          tracks: this.tracks,
          saveText: "save",
          onCancel: () => {this.settingsIsOpen = ! this.settingsIsOpen
          this.rerender()},
          onSave: ({stream, mediaObj})  => {
            console.log('saving', this, mediaObj)
            this.updateMedia(mediaObj)
          }
        }), this.settingsIsOpen, () => {
          window.audioCtx.resume()
          this.settingsIsOpen = ! this.settingsIsOpen
          this.rerender()
      })}
    </div>
    `
  }
}