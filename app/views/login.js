const html = require('choo/html')
var Component = require('choo/component')
const Video = require('./components_new/VideoObj.js')
const enumerateDevices = require('enumerate-devices')
const AddMedia = require('./addMedia.js')
const { button } = require('./formElements.js')

const dropdown = (options, selected) => html`
  ${options.map(
  opt => html`
    <option class="dark-gray" value=${opt.value} ${opt.value === selected
    ? 'selected'
    : ''}>${opt.label}</option>
  `
)}
`
const modal = (content, isOpen, onClose) => {
  if (isOpen) {
    return html`
      <div class="pa0 pa4-ns fixed w-100 h-100 top-0 left-0 bg-dark-gray" style="pointer-events:all;/*background:rgba(213, 0, 143, 1)*/">
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
    return html`<div style="display:none"></div>`
  }
}

module.exports = class Login extends Component {
  constructor (id, state, emit) {
    super(id)
    this.previewVideo = new Video()
    this.nickname = state.user.nickname
    this.room = state.user.room
    this.server = state.user.server
    this.state = state
    this.emit = emit
    this.isActive = { audio: false, video: false }
    this.devices = { audio: [], video: [] }
    this.selectedDevices = {
      audio: { label: 'initial', deviceId: '' },
      video: { label: 'initial', deviceId: '' }
    }
    this.tracks = { audio: null, video: null }
    this.streams = { audio: null, video: null }
    this.trackInfo = { audio: {}, video: {} }
    this.settingsIsOpen = false

    enumerateDevices()
      .then(devices => {
        this.devices.audio = devices.filter(elem => elem.kind === 'audioinput')
        this.devices.video = devices.filter(elem => elem.kind === 'videoinput')
        this.devices.audio.push({ label: 'no audio', deviceId: 'false' })
        this.devices.video.push({ label: 'no video', deviceId: 'false' })
        if (this.devices.audio.length > 0) {
          this.isActive.audio = true
          this.getMedia('audio')
        }
        if (this.devices.video.length > 0) {
          this.isActive.video = true
          this.getMedia('video')
        }
        this.rerender()
      })
      .catch(err => emit('log:error', err))
  }

  updateMedia (mediaObj) {
    this.tracks = Object.assign({}, mediaObj.tracks)
    this.streams = Object.assign({}, mediaObj.streams)
    this.trackInfo = Object.assign({}, mediaObj.trackInfo)
    this.selectedDevices = Object.assign({}, mediaObj.selectedDevices)
    this.devices = Object.assign({}, mediaObj.devices)
    this.settingsIsOpen = false
    this.rerender()
  }

  closeSettings () {
    this.settingsIsOpen = false
    this.rerender()
  }

  openSettings () {
    this.settingsIsOpen = true
    this.rerender()
  }

  update (center) {
    //
    return true
  }

  log (type, message) {
    console[type](message)
  }

  getMedia (kind) {
    let initialConstraints = { audio: false, video: false }
    initialConstraints[kind] = {
      deviceId: this.selectedDevices[kind].deviceId
    }
    if (this.isActive[kind]) {
      navigator.mediaDevices
        .getUserMedia(initialConstraints)
        .then(stream => {
          this.tracks[kind] = stream
            .getTracks()
            .filter(track => track.kind == kind)[0]
          this.streams[kind] = stream
          window.stream = stream
          console.log(
            `%c got user media (${kind})`,
            'background: #0044ff; color: #f00',
            stream.getTracks(),
            this.tracks
          )
          // ----------------- rerender media list on
          enumerateDevices().then((devices) => {
            //console.log('devicces', devices)
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
            this.rerender()

          }).catch((err) => emit('log:error', err))
          //---------------- rerender media list off

          this.rerender()
        })
        .catch(err => {
          this.log('error', err)
        })
    } else {
      this.tracks[kind] = null
      this.streams[kind] = null
      this.rerender()
    }
  }

  createElement(state, emit) {
    const dropdowns = ['audio', 'video'].map(
      kind => html `
    <div class="flex items-center ba">
      <i class="w1 fas mh2 f3 ${kind === 'video'
        ? 'fa-video'
        : 'fa-microphone'}"></i>
      <select name=${kind} class="w-100 pa2 white ttu pointer bn" style="background:none;/*font-size:3vw*/" onchange=${e => {
        this.selectedDevices[kind] = this.devices[kind].filter(
              device => device.deviceId === e.target.value
            )[0]
        if (this.selectedDevices[kind].deviceId === 'false') {
          this.isActive[kind] = false
        } else {
          this.isActive[kind] = true
        }
        this.getMedia(kind)
      }}>
        ${dropdown(
            this.devices[kind].map((device, index) => ({
              value: device.deviceId,
              label: device.label
            })),
            this.selectedDevices[kind].deviceId
          )}
      </select>
    </div>`
    )

    return html`<div class="fixed w-100 h-100 top-0 left-0" style="font-family:rektorant_light">
      ${this.previewVideo.render(this.streams.video, {
        objectPosition: 'center',
        objectFit: 'cover'
      })}
      <div class="fixed w-100 h-100 top-0 left-0 f2 lh-title pa2 flex justify-center ttu" style="background:rgba(0, 0, 0, 0.3);font-size:4vmin;">
        <div class="w-100 h-100 pt4 flex justify-center flex-column" style="max-width:1200px">
          <div class="flex flex-column justify-center">
            <a style="width:fit-content;font-size:8vmin;line-height:6vmin;margin-left: -0.08em;color:${state.style.colors.text0}" class="mt4 dim no-underline" title="more info" href="https://www.culturehub.org/livelab" target="_blank"> LiveLab </a>
            <div class="ttl" style="font-size:2.3vmin">v${state.user.version} beta |  by  <a style="color:${state.style.colors.text0}" class="no-underline dim  ttu" href="https://www.culturehub.org" target="_blank">CultureHub</a></div>
            <div style="" class="mv5">A browser-based<br>media router<br>for collaborative performance </div>
          </div>
          <div class="w-100" style='font-size:4vmin'>
            ${dropdowns[1]}
            ${dropdowns[0]}
            <div class="ba flex items-center">
              <i class="w1 fas mh2 f3 fa-user"></i>
              <input type="text" placeholder="name" value=${this.nickname} class="ml1 pa2 bn w-100 white" style="background:none" onkeyup=${e =>
      this.nickname = e.target.value} />
            </div>
            <div class="flex mt5">
            ${button({
              text: 'Start',
              title: 'join a call',
              onClick: () => {
                var tracks = Object.values(this.tracks).filter(track => track !== null)
                emit('user:join', {
                  room: this.room,
                  server: this.server,
                  stream: new MediaStream(tracks),
                  nickname: this.nickname,
                  requestMedia: true
                })
              }
            })}
            ${button({
              text: 'Settings',
              onClick: this.openSettings.bind(this),
              classes: 'dark-gray bg-near-white ml2'
            })}
            </div>
          </div>
        </div>
      </div>
      ${modal(
      state.cache(AddMedia, 'login-settings').render({
        selectedDevices: this.selectedDevices,
        isActive: this.isActive,
        tracks: this.tracks,
        saveText: 'save',
        showLabel: false,
        state: state,
        onCancel: () => {
          this.settingsIsOpen = !this.settingsIsOpen
          this.rerender()
        },
        onSave: ({ stream, mediaObj }) => {
          this.updateMedia(mediaObj)
        }
      }),
      this.settingsIsOpen,
      () => {
        window.audioCtx.resume()
        this.settingsIsOpen = !this.settingsIsOpen
        this.rerender()
      }
    )}
    </div>
    `
  }
}
