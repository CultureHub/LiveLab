// @todo: how to select no media
var html = require('choo/html')
var Component = require('choo/component')
const input = require('./components/input.js')
const Dropdown = require('./components_new/dropdown.js')
// const Video = require('./components/funvideocontainer.js')
const enumerateDevices = require('enumerate-devices')
const AudioVis = require('./components_new/audioVis.js')

const AudioDropdown = Dropdown()
// const VideoDropdown = Dropdown()

module.exports = class AddAudio extends Component {
  constructor (opts) {
    super(opts)
    this.previewVideo = null
    this.onSave = opts.onSave
    this.onClose = opts.onClose
    this.isOpen = false
    this.audioVis = new AudioVis()
    this.devices = { audio: [], video: [] }
    this.selectedDevices = { audio: {label: 'initial', deviceId: ''}, video:  {label: 'initial', deviceId: ''} }
    this.tracks = { audio: null, video: null }
    this.stream = null
    this.label = ''
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
    console.log('loading add audio', isOpen, this.isOpen)
    if(isOpen && this.stream == null) {
    //  if(isOpen == true)
      //  this.updateVideo()
      //  this.tracks = Object.assign({}, this.tracks, opts.tracks)
      //  this.selectedDevices = Object.assign({}, this.selectedDevices, opts.selectedDevices)
        // this.getMedia('video')

        this.getMedia('audio')

    //  }

      //return true
    }
    this.isOpen = isOpen
    return true
  }

  applyConstraints(kind, obj = {}) {
    this.constraints[kind] = Object.assign({}, this.constraints[kind], obj)
    console.log(`%c applying ${kind} constraints `, 'background: #ff9900; color: #fff', this.constraints[kind])
    this.tracks[kind].applyConstraints(this.constraints[kind])
    this.trackInfo[kind] = this.tracks[kind].getSettings()
    console.log('settings', this.tracks[kind].getSettings())
    console.log('constraints', this.tracks[kind].getConstraints()) // not always consistent with settings
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
       console.log(`%c got user media (${kind})`, 'background: #0044ff; color: #f00', stream.getTracks())
       this.tracks[kind] = stream.getTracks().filter((track) => track.kind == kind)[0]
       this.stream = stream
       this.applyConstraints(kind)
      // console.log('settings', this.tracks[kind].getSettings())
      // console.log('constraints', this.tracks[kind].getConstraints())
     }).catch((err) => {
       //this.emit('log:error', err)
       this.log('error', err)
     })
   } else {
     this.tracks[kind] = null
     this.stream = null
     this.rerender()
   }
  }


  createElement (isOpen, emit) {
    console.log('rerendering', isOpen)
  //  this.isOpen = isOpen

    var self = this

    this.audioDropdown = AudioDropdown.render({
      value: 'Audio:  ' + (this.selectedDevices.audio === null ? '' :this.selectedDevices.audio.label),
      options: this.devices.audio.map((device, index) => (  { value: index,  label: device.label })),
      onchange:  (value) => {
        this.selectedDevices.audio = this.devices.audio[value]
        this.getMedia('audio', true)
      }
    })

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

this.trackInfoEl =  html` <div class="mt2 mb4 i">
   <br>${Object.keys(this.constraints.audio).map((key) => `${key}: ${this.trackInfo.audio[key]}`).join(', ')}
</div>`
//  console.log('rendering',this.trackInfoEl)
//  ${Object.keys(this.trackInfo.audio).map((key) => html`${key}: ${this.trackInfo.audio[key]}`)}
  var popup = html`
    <div class="mw7 h-100 flex flex-column center overflow-y-auto">
      <h3> Add audio stream </h3>
      <div>${this.audioDropdown}</div>
      ${this.audioVis.render(this.stream, this.isOpen)}
      <div class="flex flex-column">
        <h3>Settings</h3>
        <div class="flex flex-wrap">${audioSettings}</div>
      </div>
      <div class="mw6">
      ${input('Label', 'Label', {  style:'border:solid 2px', value: this.label,  onkeyup: (e) => { this.label = e.target.value } })}
      </div>
      <!--buttons go here-->
      <div class="flex flex-wrap mt4">
        <div class="f6 link dim ph3 pv2 mr2 white bg-dark-pink pointer" onclick=${() => {
          emit('user:addStream', this.stream, this.label)
          emit('layout:toggleMenuItem', 'addAudio', 'panels')
        }}>Add</div>
        <div class="f6 link dim ph3 pv2 white bg-gray pointer" onclick=${() => emit('layout:toggleMenuItem', 'addAudio', 'panels')}>Cancel</div>
      </div>
    </div>`
//  console.log(popup)

    return popup
  }
}
