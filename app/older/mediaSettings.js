// @todo: how to select no media
var html = require('choo/html')
const Modal = require('./components/modal.js')
var Component = require('choo/component')
const input = require('./components/input.js')
const Dropdown = require('./components/dropdown.js')
//
const DropdownSmall = require('./components/dropdown-small.js')
//
const Video = require('./components/funvideocontainer.js')
const enumerateDevices = require('enumerate-devices')

const AudioDropdown = Dropdown()
const VideoDropdown = Dropdown()

const PresetDropdown = DropdownSmall()


module.exports = class MediaSettings extends Component {
  constructor(opts) {
    super(opts)
    this.previewVideo = null
    this.onSave = opts.onSave
    this.onClose = opts.onClose
    this.isOpen = true
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
    this.constraints = {
      audio: {
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true
      },
      video: {
        width: 1920,
        height: 1080,
        frameRate: 30
      }
    }

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
      if (this.devices.audio.length > 0) {
        this.selectedDevices.audio = this.devices.audio[0]
      }
      if (this.devices.video.length > 0) {
        this.selectedDevices.video = this.devices.video[0]
      }
      this.rerender()
    }).catch((err) => this.log('error', err))
  }

  log(type, message) {
    console[type](message)
  }

  load(element) {

  }

  update(isOpen, opts = {}) {
    if (isOpen !== this.isOpen) {
      if (isOpen == true) {
        //  this.updateVideo()
        this.tracks = Object.assign({}, this.tracks, opts.tracks)
        this.selectedDevices = Object.assign({}, this.selectedDevices, opts.selectedDevices)
        this.getMedia('video')
        this.getMedia('audio')
      }
      return true
    }
    return false
  }

  applyConstraints(kind, obj = {}) {
    this.constraints[kind] = Object.assign({}, this.constraints[kind], obj)
    console.log(`%c applying ${kind} constraints `, 'background: #ff9900; color: #fff', this.constraints[kind])
    this.tracks[kind].applyConstraints(this.constraints[kind])
    this.trackInfo[kind] = this.tracks[kind].getSettings()
    console.log('settings', this.tracks[kind].getSettings())
    console.log('constraints', this.tracks[kind].getConstraints()) // not always consistent with settings
    window.track = this.tracks[kind]
    // this.trackInfoEl.innerHTML = `Current Video Resolution:  ${this.trackInfo.video.width}x${this.trackInfo.video.height}, ${this.trackInfo.video.frameRate}fps`
    this.rerender()
  }

  getMedia(kind, applyConstraintsOnInit) {
    const initialConstraints = {
      audio: false,
      video: false
    }
    if (this.selectedDevices[kind].deviceId !== false) {
      initialConstraints[kind] = {
        deviceId: this.selectedDevices[kind].deviceId
      }
      if (applyConstraintsOnInit) {
        initialConstraints[kind] = Object.assign({}, initialConstraints[kind], this.constraints[kind])
      }
      console.log(initialConstraints)
      navigator.mediaDevices.getUserMedia(initialConstraints)
        .then((stream) => {
          console.log(`%c got user media (${kind})`, 'background: #0044ff; color: #fff', stream.getTracks())
          this.tracks[kind] = stream.getTracks().filter((track) => track.kind == kind)[0]
          this.applyConstraints(kind)
          // console.log('settings', this.tracks[kind].getSettings())
          // console.log('constraints', this.tracks[kind].getConstraints())
        }).catch((err) => {
          //this.emit('log:error', err)
          this.log('error', err)
        })
    } else {
      this.tracks[kind] = null
      this.rerender()
    }
  }

  createElement(isOpen) {
    console.log('rerendering', isOpen)
    this.isOpen = isOpen

    var self = this

    this.audioDropdown = AudioDropdown.render({
      value: 'Audio:  ' + (this.selectedDevices.audio === null ? '' : this.selectedDevices.audio.label),
      options: this.devices.audio.map((device, index) => ({
        value: index,
        label: device.label
      })),
      onchange: (value) => {
        this.selectedDevices.audio = this.devices.audio[value]
        this.getMedia('audio', true)
      }
    })

    this.videoDropdown = VideoDropdown.render({
      value: 'Video:  ' + (this.selectedDevices.video === null ? '' : this.selectedDevices.video.label),
      options: this.devices.video.map((device, index) => ({
        value: index,
        label: device.label
      })),
      onchange: (value) => {
        this.selectedDevices.video = this.devices.video[value]
        this.getMedia('video')
        //this.updateVideo()
      }
    })
    //Adding video preset dropdown
    this.presetDropdown = PresetDropdown.render({
      value: 'Freeform',
      options: this.devices.video.map((device, index) => ({
        value: index,
        label: ''
      })),
      onchange: (value) => {
        console.log(value);
      }
    })
    //
    this.previewVideo = Video({
      htmlProps: {
        class: 'w-100 h-100 mt2',
        style: 'object-fit: contain; max-width: 400px;'

      },
      index: "login-settings-video",
      track: this.tracks.video,
      id: this.tracks.video === null ? null : this.tracks.video.id
    })
    //this.previewVideo = html`<video></video>`

    var audioSettings = Object.keys(this.constraints.audio).map((constraint) =>
      html `<div class="f6 pv3 dib mr3">
            <input type="checkbox" id=${constraint} name=${constraint} checked=${this.constraints.audio[constraint]}
            onchange=${(e) => {
            //  this.applyConstraints('audio', { [constraint]: e.target.checked } ) // bug, seems that applyConstraints does not work for audio. must retrigger call to getUserMedia()
              this.constraints.audio[constraint] = e.target.checked
              this.getMedia('audio', true)
            }}>
            <span class="pl1">${constraint}</span>
        </div>`
    )

    var videoSettings = Object.keys(this.constraints.video).map((constraint) => html `
  <div class="dib w-5r pr3">
  ${input(constraint, "", {
  value: this.constraints.video[constraint],
  onkeyup: (e) => {
    if(parseInt(e.srcElement.value)) {
      this.applyConstraints('video', { [constraint]: parseInt(e.srcElement.value) })
    }
  }
})}
  </div>`)
    console.log('audio INFO', this.trackInfo.audio);
    this.trackInfoEl = html `
    <article class="dib mt2 mb4 font-Inter b f5 tc w-90 white bg-gray br4 lh-copy pa1">
      Current Video Resolution:  ${this.trackInfo.video.width}x${this.trackInfo.video.height}, ${this.trackInfo.video.frameRate}fps
    </article>
    <article class="mt2 mb2 i yellow">${Object.keys(this.constraints.audio).map((key) => `${key}: ${this.trackInfo.audio[key]}`).join(', ')}
    </article>`

    this.videoSettingInfo = html `
      <article class="mv2 i">
      Note: Actual resolution and frame rate depend on the capabilities of your camera or input device.
      </article>
      `
    //  console.log('rendering',this.trackInfoEl)
    //  ${Object.keys(this.trackInfo.audio).map((key) => html`${key}: ${this.trackInfo.audio[key]}`)}
    var popup = html `${Modal({
    show: isOpen,
    header: "Advanced Setting",
    contents: html`
    <div class="h-70 pa3 f6 fw3">
      <div class="w-100 db flex mt4">
        <div class="w-50 h5 dib fl pa3 pl4">
        ${this.audioDropdown}
        <!--Volume Indicator takes up 48px of space: 28 in height and 10 in mt and mb-->
        <div class = "fl font-Inter f5 lh-3">volume indicator goes here volume indicator goes here </div>
        ${this.videoDropdown}
        ${this.previewVideo}
        </div>
        <div class="w-50 dib fl pa3 pl4">
         <section>
          <article class="font-Inter f4 fs-normal fw7 lh-solid pa2"> Audio Constrains </artical>
          <article>${audioSettings}</article>
         </section>
         <Section>
          <article class="font-Inter f4 fs-normal fw7 mb2 "> Video Constrains </article>
          ${this.videoSettingInfo}
          <article>
           <div class="dib w-30 ph1 pt3 fl">
            ${this.presetDropdown}
           </div>
           <div class="dib w-60 ph1 fr">
           ${videoSettings}
           </div>
          </article>
          ${this.trackInfoEl}
         </section>
        </div>
      </div>
    </div>
      <!--Signalling Server menu goes here -->
     <div class = "w-50 h-10 pa3" >
      <legend class="dib fl font-Inter f4 fs-normal fw7 pl4 pr2 ">
       <span class="w-50">signalling server</span>
      </legend>
      <legend class="dib fl font-Inter f5 fs-normal fw6 pl2 ">
       <span class="w-15 pa2 bg-livelab-orange br-leftRound pointer link dim">Default</span>
       <span class="w-15 pa2 bg-mid-gray br-rightRound pointer link dim">Customize</span>
      </legend>
     </div>
      <!--buttons go here-->
    <div class="h-10">
       <section class="f5 ph3 pv2 mb2 dib white bg-livelab-orange pointer link dim fr mb4 mr6" onclick=${this.onSave}>Save</section>
       <section class="f5 ph3 pv2 mb2 dib white bg-mid-gray pointer link dim fr mb4 mr4" onclick=${this.onClose}>Cancel</section>
    </div>`,
    close: this.onClose
  })}
  `
    //  console.log(popup)

    return popup
  }
}
