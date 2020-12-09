const html = require('choo/html')
const Video = require('./components_new/VideoObj.js')
const Component = require('choo/component')
const enumerateDevices = require('enumerate-devices')
const AudioVis = require('./components_new/audioVis.js')
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

const toggle = (val, onChange) => html`
  <input type="checkbox" checked=${val} onchange=${onChange} />
`

const expandable = (isOpen, content, maxHeight = '300px') => html`
  <div class="overflow-hidden" style="transition: max-height 1s;max-height:${isOpen
  ? maxHeight
  : 0}">
    ${content}
  </div>
`
const constraintNames = {
  echoCancellation: 'echo cancellation',
  autoGainControl: 'auto gain',
  noiseSuppression: 'noise suppression'
}

module.exports = class AddMedia extends Component {
  constructor (opts) {
    super(opts)
    this.onSave = opts.onSave
    this.onClose = opts.onClose
    this.previewVideo = new Video()
    this.isOpen = false
    this.audioVis = new AudioVis()
    this.devices = { audio: [], video: [] }
    this.selectedDevices = {
      audio: { label: 'initial', deviceId: '' },
      video: { label: 'initial', deviceId: '' }
    }
    this.tracks = { audio: null, video: null }
    this.trackInfo = { audio: {}, video: {} }
    this.streams = { audio: null, video: null }
    this.isActive = { audio: false, video: false }
    // this.stream = null
    this.label = ''
    this.trackInfo = { audio: {}, video: {} }
    this.constraints = {
      audio: {
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true,
      },
      video: { width: 1920, height: 1080, frameRate: 30 }
    }

    this.updateDeviceList(() => {
      if (this.devices.audio.length > 0) {
        this.selectedDevices.audio = this.devices.audio[this.devices.audio.length -
          1]
      }
      if (this.devices.video.length > 0) {
        this.selectedDevices.video = this.devices.video[this.devices.video.length -
          1]      }
    })
  }

  updateDeviceList (callback) {
    enumerateDevices()
      .then(devices => {
        this.devices.audio = devices.filter(elem => elem.kind == 'audioinput')
        this.devices.video = devices.filter(elem => elem.kind == 'videoinput')
        this.devices.audio.push({ label: 'no audio', deviceId: 'false' })
        this.devices.video.push({ label: 'no video', deviceId: 'false' })
        callback()
        //  this.rerender()
      })
      .catch(err => this.log('error', err))
  }

  log (type, message) {
    console[type](message)
  }

  update (opts) {
    if (opts && opts.isActive) {
      this.selectedDevices = Object.assign(
        {},
        this.selectedDevices,
        opts.selectedDevices
      )
      if (opts.isActive != this.isActive) {
        this.isActive = Object.assign({}, this.isActive, opts.isActive)
        // @ todo: only update if new information
        if (opts.isActive.video && opts.isActive.video !== this.isActive.video) {
          this.getMedia('video')
        }
        if (opts.isActive.audio && opts.isActive.audio !== this.isActive.audio) {
          this.getMedia('audio')
        }
      }
    }
    return false
  }

  load (el) {
    this.updateDeviceList(() => {
      this.selectedDevices = Object.assign(
        {},
        this.selectedDevices,
        this.parentOpts.selectedDevices
      )
      this.isActive = Object.assign(
        {},
        this.isActive,
        this.parentOpts.isActive
      )
      this.getMedia('audio')
      this.getMedia('video')
    })
  }

  applyConstraints (kind, obj = {}) {
    this.constraints[kind] = Object.assign({}, this.constraints[kind], obj)
    console.log(
      `%c applying ${kind} constraints `,
      'background: #ff9900; color: #fff',
      this.constraints[kind]
    )
    this.tracks[kind]
      .applyConstraints(this.constraints[kind])
      .then(() => {
        this.trackInfo[kind] = this.tracks[kind].getSettings()
        this.showTrackInfo(this.tracks[kind])
          this.rerender()
   // Do something with the track such as using the Image Capture API.
         }).catch(e => {
           console.log(e)
         });
    // this.trackInfo[kind] = this.tracks[kind].getSettings()
    // this.rerender()
  }

  showTrackInfo(track) {
    console.log(
      `%c ${track.kind} constraints applied `,
      'background: #ffcc66; color: #fff',
      track.getConstraints()
    )
    console.log(
      `%c ${track.kind} settings `,
      'background: #ff4466; color: #fff',
      track.getSettings()
    )
  }

  /* Inconsistent behavior between audio and video for applying constraints.
  For video, appears to work better to apply constraints once stream is received.
  For audio, seems to work better to apply constraints when get user media is called
  bug is here: https://bugs.chromium.org/p/chromium/issues/detail?id=796964
  */
  getMedia (kind) {
    let initialConstraints = { audio: false, video: false }
    if (this.isActive[kind]) {
      initialConstraints[kind] = {
        deviceId: this.selectedDevices[kind].deviceId
      }
      if (kind === 'audio') {
        initialConstraints[kind] = Object.assign(
          {},
          initialConstraints[kind],
          this.constraints[kind],
          {
            latency: 0,
            //channelCount: 2
          }
        )
        if (this.tracks.audio !== null) {
          this.tracks.audio.stop()
          this.tracks.audio = null
        }
      }
      navigator.mediaDevices
        .getUserMedia(initialConstraints)
        .then(stream => {
          this.tracks[kind] = stream
            .getTracks()
            .filter(track => track.kind == kind)[0]
          this.streams[kind] = stream
          this.showTrackInfo(this.tracks[kind])
          if(kind === 'video') {
            this.applyConstraints(kind)
          } else {
            //this.audioEl.srcObject = stream
          }
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

  createElement (opts) {
    this.parentOpts = opts
    var self = this
    const dropdowns = [ 'audio', 'video' ].map(
      kind =>
        html`<select name=${kind} class="w-100 pa2 white ttu ba b--white pointer" style="background:none" onchange=${e => {
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
    </select>`
    )

    let vid = this.previewVideo.render(this.streams.video, {
      objectPosition: 'center'
    })

    var audioSettings = Object.keys(this.constraints.audio).map(
      constraint => html`<div class="flex w-100 justify-between">
    <div class="">${constraintNames[constraint]}</div>
    <input type="checkbox" id=${constraint} name=${constraint} checked=${this.constraints.audio[constraint]}
    onchange=${e => {
      this.constraints.audio[constraint] = e.target.checked
      this.getMedia('audio')
      //console.log(this.constraints)
      // this.applyConstraints('audio', {
      //   [constraint]: e.target.checked
      // })
    }}>
    </div>`
    )
    var videoSettings = Object.keys(this.constraints.video).map(
      constraint => html`
  <div class="flex-auto w3 mt2">
  <div>${constraint === 'frameRate' ? 'fps' : constraint}</div>
  <input type="text" value=${this.constraints.video[constraint]} class="pa2 ba b--white white w-100" style="background:none" onkeyup=${e => {
    if (parseInt(e.srcElement.value)) {
      this.applyConstraints('video', {
        [constraint]: parseInt(e.srcElement.value)
      })
    }
  }}> </input>
  </div>`
    )

    let vidInfo = this.trackInfo.video.width
      ? `${this.trackInfo.video.width}x${this.trackInfo.video.height}@${this.trackInfo.video.frameRate}fps`
      : ''

    // audio element for debugging
    // this.audioEl = html`<audio controls class="h2"></audio>`
    return html`
  <div class="h-100 flex flex-column flex-center overflow-y-auto ttu lh-title pa1 pa2-ns b">
    <!-- video settings -->
    <div class="flex flex-column mw6 w-100">
      <div>Video input</div>
      <div>${dropdowns[1]}</div>
      ${expandable(
      this.isActive.video,
      html`
        <div class="mt4 flex justify-between"><div>Video preview</div><div>${vidInfo}</div></div>
        <div class="w-100 h4 h5-ns ba b--white">${vid}</div>
        <div class="flex flex-wrap mt4">${videoSettings} </div>`,
      '500px'
    )}
    <!--audio settings -->
    <div class="flex flex-column mw6 w-100 mt4">
      <div>Audio input</div>
      <div class="">${dropdowns[0]}</div>
      ${expandable(
      this.isActive.audio,
      html`<div class="mt4">Audio meter</div>
          <div class="ba b--white">${this.audioVis.render(
        this.streams.audio,
        this
      )}</div>

          <div class="mt4 flex flex-column">
            <div class="flex flex-wrap">${audioSettings}</div>
          </div>`
    )}
    </div>
  <!--buttons go here-->
    <div class="flex flex-wrap mt4">
      ${this.isActive.audio || this.isActive.video ? html`
      ${opts.showLabel
        ? html`<input type="text" placeholder="label" value=${this.label} class="mb4 pa2 ba b--white white w-100" style="background:none" onkeyup=${e =>
          this.label = e.target.value} />`
        : ''}
      ${button({
        text: opts.saveText,
        onClick: () => {
          var tracks = Object
            .values(this.tracks)
            .filter(track => track !== null)
          opts.onSave({ stream: new MediaStream(tracks), mediaObj: this })
        }
      })}
      ` : ''}
      ${button({
        text: 'Cancel',
        onClick: opts.onCancel,
        classes: 'dark-gray bg-near-white ml2'
      })}
    </div>
    </div>
  </div>`
  }
}
