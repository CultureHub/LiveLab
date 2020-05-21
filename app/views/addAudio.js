// @todo: how to select no media
const html = require('choo/html')
const Video = require('./components_new/VideoObj.js')
const Component = require('choo/component')
const input = require('./components/input.js')
const enumerateDevices = require('enumerate-devices')
const AudioVis = require('./components_new/audioVis.js')

const dropdown = (options, selected) => html`
  ${options.map((opt) => html`
    <option value=${opt.value} ${opt.value === selected? 'selected':''}>${opt.label}</option>
  `)}
`

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
    this.streams = { audio: null, video: null}
    // this.stream = null
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
      this.devices.audio.push({label: 'no audio', deviceId: 'false'})
      this.devices.video.push({label: 'no video', deviceId: 'false'})
      if(this.devices.audio.length > 0) {
        this.selectedDevices.audio = this.devices.audio[this.devices.audio.length-1]
      }
      if(this.devices.video.length > 0) {
        this.selectedDevices.video = this.devices.video[this.devices.video.length-1]
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
    // if(isOpen && this.stream == null) {
    //   //  if(isOpen == true)
    //   //  this.updateVideo()
    //   //  this.tracks = Object.assign({}, this.tracks, opts.tracks)
    //   //  this.selectedDevices = Object.assign({}, this.selectedDevices, opts.selectedDevices)
    //   // this.getMedia('video')
    //   this.getMedia('video')
    //   this.getMedia('audio')
    //
    //   //  }
    //
    //   //return true
    // }
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
    if(this.selectedDevices[kind].deviceId !== 'false') {
      initialConstraints[kind] =  { deviceId: this.selectedDevices[kind].deviceId }
      if(applyConstraintsOnInit) {
        initialConstraints[kind] = Object.assign({}, initialConstraints[kind], this.constraints[kind])
      }
      console.log(initialConstraints)
      navigator.mediaDevices.getUserMedia(initialConstraints)
      .then((stream) => {
        console.log(`%c got user media (${kind})`, 'background: #0044ff; color: #f00', stream.getTracks())
        this.tracks[kind] = stream.getTracks().filter((track) => track.kind == kind)[0]
        this.streams[kind] = stream
        this.applyConstraints(kind)
        // this.rerender()
        // console.log('settings', this.tracks[kind].getSettings())
        // console.log('constraints', this.tracks[kind].getConstraints())
      }).catch((err) => {
        //this.emit('log:error', err)
        this.log('error', err)
      })
    } else {
      this.tracks[kind] = null
      this.streams[kind] = null
      this.rerender()
    }
  }

  createElement (isOpen, state, emit) {
    console.log('rerendering', this.selectedDevices.audio, this.devices.audio)
    //  this.isOpen = isOpen

    var self = this
    this.audioDropdown = html`<select onchange=${(e)=>{

      this.selectedDevices.audio = this.devices.audio.filter((device) => device.deviceId === e.target.value)[0]
      this.getMedia('audio')
    }}>
    ${dropdown(
      this.devices.audio.map((device, index) => (  { value: device.deviceId,  label: device.label })),
      this.selectedDevices.audio.deviceId
    )}
    </select>`

    this.videoDropdown = ''

    // this.videoDropdown = VideoDropdown.render({
    //   value: 'Video:  ' + (this.selectedDevices.video === null ? '' : this.selectedDevices.video.label),
    //   options: this.devices.video.map((device, index) => ({
    //     value: index,
    //     label: device.label
    //   })),
    //   onchange: (value) => {
    //     this.selectedDevices.video = this.devices.video[value]
    //     this.getMedia('video')
    //     //this.updateVideo()
    //   }
    // })

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
  var videoSettings = Object.keys(this.constraints.video).map((constraint) => html `
  <div class="flex-auto">
  ${input(constraint, "", { value: this.constraints.video[constraint],
  onkeyup: (e) => {
    if(parseInt(e.srcElement.value)) { this.applyConstraints('video', { [constraint]: parseInt(e.srcElement.value) })}}
  })}
  </div>`)


  this.trackInfoEl =  html` <div class="mt2 mb4 i">
  <br>${Object.keys(this.constraints.audio).map((key) => `${key}: ${this.trackInfo.audio[key]}`).join(', ')}
  </div>`

  const mediaSelected = this.selectedDevices.audio.deviceId === 'false' && this.selectedDevices.video.deviceId === 'false'? false : true
  //  console.log('rendering',this.trackInfoEl)
  //  ${Object.keys(this.trackInfo.audio).map((key) => html`${key}: ${this.trackInfo.audio[key]}`)}
  var popup = html`
  <div class="mw7 h-100 flex flex-column center overflow-y-auto">
    <h3> Add media </h3>
    <div>${this.audioDropdown}</div>
    ${this.selectedDevices.audio.deviceId === 'false' ? '' : html`
    ${this.audioVis.render(this.streams.audio, this.isOpen)}
    <div class="flex flex-column">
      <h3>Settings</h3>
      <div class="flex flex-wrap">${audioSettings}</div>
    </div>
    `}

    <div class="mw6">
    </div>
    <div>${this.videoDropdown}</div>
    ${this.selectedDevices.video.deviceId === 'false' ? '' : html`
      <div class="mw6 h6">${state.cache(Video, 'settings-preview').render(this.streams.video, {objectPosition: 'left'})}</div>
      <div class="flex flex-wrap">${videoSettings} </div>`
    }

  <!--buttons go here-->
    <div class="flex flex-wrap mt4">
      ${mediaSelected ? html`
      <div class="f6 link dim ph3 pv2 mr2 dark-gray bg-white pointer" onclick=${() => {
           var tracks = Object.values(this.tracks).filter((track) => track !== null)
          emit('user:addStream', new MediaStream(tracks), this.label)
          emit('layout:toggleMenuItem', 'addAudio', 'panels')
        }}>Add</div>
      ` :''}
      <div class="f6 link dim ph3 pv2 white bg-gray pointer" onclick=${() => emit('layout:toggleMenuItem', 'addAudio', 'panels')}>Cancel</div>
    </div>
  </div>`
  //  console.log(popup)
//   ${mediaSelected ? input('Label', 'Label', {  style:'border:solid 2px', value: this.label,  onkeyup: (e) => { this.label = e.target.value } })}

  return popup
}
}
