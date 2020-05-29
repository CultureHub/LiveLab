// @todo: how to select no media
var html = require('choo/html')
const Modal = require('./components/modal.js')
var Component = require('choo/component')
const input = require('./components/input.js')
const Dropdown = require('./components/dropdown.js')
const Video = require('./components/funvideocontainer.js')
const enumerateDevices = require('enumerate-devices')

const AudioDropdown = Dropdown()
const VideoDropdown = Dropdown()

module.exports = class MediaSettings extends Component {
  constructor (opts) {
    super(opts)
    this.previewVideo = null
    this.onSave = opts.onSave
    this.onClose = opts.onClose
    this.isOpen = true
    this.devices = { audio: [], video: [] }
    this.selectedDevices = { audio: {label: 'initial', deviceId: ''}, video:  {label: 'initial', deviceId: ''} }
    this.tracks = { audio: null, video: null }
    this.trackInfo = { audio: {}, video: {} }
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
      this.devices.audio.push({label: 'no audio', deviceId: false})
      this.devices.video.push({label: 'no video', deviceId: false})
      if(this.devices.audio.length > 0) {
        this.selectedDevices.audio = this.devices.audio[0]
      }
      if(this.devices.video.length > 0) {
        this.selectedDevices.video = this.devices.video[0]
      }
      this.rerender()
    }).catch((err) =>this.log('error', err))
  }

  log ( type, message) {
    console[type](message)
  }

  load (element) {

  }

  update (isOpen, opts = {}) {
    if(isOpen !== this.isOpen) {
      if(isOpen == true) {
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
    // this.trackInfoEl.innerHTML = `Actual video dimensions:  ${this.trackInfo.video.width}x${this.trackInfo.video.height}, ${this.trackInfo.video.frameRate}fps`
    this.rerender()
  }

  getMedia(kind, applyConstraintsOnInit) {
    const initialConstraints = { audio: false, video: false}
    if(this.selectedDevices[kind].deviceId !== false) {
     initialConstraints[kind] =  { deviceId: this.selectedDevices[kind].deviceId }
     if(applyConstraintsOnInit) {
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


  createElement (isOpen) {
  //  console.log('rerendering', isOpen)
    this.isOpen = isOpen

    var self = this

    this.audioDropdown = AudioDropdown.render({
      value: 'Audio:  ' + (this.selectedDevices.audio === null ? '' :this.selectedDevices.audio.label),
      options: this.devices.audio.map((device, index) => (  { value: index,  label: device.label })),
      onchange:  (value) => {
        this.selectedDevices.audio = this.devices.audio[value]
        this.getMedia('audio', true)
      }
    })

    this.videoDropdown = VideoDropdown.render({
      value: 'Video:  ' + (this.selectedDevices.video === null ? '' : this.selectedDevices.video.label),
      options: this.devices.video.map((device, index) => (  { value: index, label: device.label})),
      onchange: (value) => {
        this.selectedDevices.video = this.devices.video[value]
        this.getMedia('video')
        //this.updateVideo()
      }
    })
    //
    this.previewVideo = Video({
      htmlProps: { class: 'w-100 h-100', style: 'object-fit:contain;'},
      index: "login-settings-video",
      track: this.tracks.video,
      id: this.tracks.video === null ? null : this.tracks.video.id
    })
    //this.previewVideo = html`<video></video>`

    var audioSettings = Object.keys(this.constraints.audio).map((constraint) =>
    html`<div class="pv1 dib mr3">
            <input type="checkbox" id=${constraint} name=${constraint} checked=${this.constraints.audio[constraint]}
            onchange=${(e) => {
            //  this.applyConstraints('audio', { [constraint]: e.target.checked } ) // bug, seems that applyConstraints does not work for audio. must retrigger call to getUserMedia()
              this.constraints.audio[constraint] = e.target.checked
              this.getMedia('audio', true)
            }}>
            <span class="pl1">${constraint}</span>
        </div>`
      )

  var videoSettings = Object.keys(this.constraints.video).map((constraint) => html`
  <div class="dib w4 pr3">
  ${input(constraint, "", {
      value: this.constraints.video[constraint],
      onkeyup: (e) => {
        if(parseInt(e.srcElement.value)) {
          this.applyConstraints('video', { [constraint]: parseInt(e.srcElement.value) })
        }
      }
    })}
  </div>`
)
//console.log('audio INFO', this.trackInfo.audio)
this.trackInfoEl =  html` <div class="mt2 mb4 i">
  Actual video dimensions:  ${this.trackInfo.video.width}x${this.trackInfo.video.height}, ${this.trackInfo.video.frameRate}fps
   <br>${Object.keys(this.constraints.audio).map((key) => `${key}: ${this.trackInfo.audio[key]}`).join(', ')}
</div>`
//  console.log('rendering',this.trackInfoEl)
//  ${Object.keys(this.trackInfo.audio).map((key) => html`${key}: ${this.trackInfo.audio[key]}`)}
  var popup = html`${Modal({
    show: isOpen,
    header: "Media Settings",
    contents: html`
    <div id="add broadcast" class="pa3 f6 fw3">
      ${this.audioDropdown}
      ${this.videoDropdown}
      <div class="w-100 db flex mt4">
        <div class="w-40 h5 dib fl">
          ${this.previewVideo}
        </div>
        <div class="w-60 dib fl pa3 pl4">
          <h3>Media Settings</h3>
          <h4> Audio </h4>
          ${audioSettings}
          <h4 class="mt4 mb0"> Video </h4>
          ${videoSettings}
        </div>
      </div>
      ${this.trackInfoEl}
      <!--buttons go here-->
      <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer fr mb4 mr6" onclick=${this.onSave}>Save</div>
      <div class="f6 link dim ph3 pv2 mb2 dib white bg-gray pointer fr mb4 mr4" onclick=${this.onClose}>Cancel</div>
    </div>`,
    close: this.onClose
  })}
  `
//  console.log(popup)

    return popup
  }
}
