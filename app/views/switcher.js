var html = require('choo/html')
var Component = require('choo/component')
const Video = require('./components_new/VideoObj.js')

module.exports = class Switcher extends Component {
  constructor (id, state, emit) {
    super(id)
    this.stream = null
    this.opacity = 50
    this.window = null
    this.windowVideo = null

    // explicitly listen to update because not always called
    state.multiPeer.on('update', () => {
      console.log('MULTIPEER UPDATE RECEIVED', Date.now())
      this.update(state.multiPeer.streams)
    })
    //console.log('audio init', streams, emit)
  }

  update(streams) {
    return true
  }

  setWindowVideo() {
    if(this.windowVideo) {
      if(this.stream) {
        this.windowVideo.srcObject = this.stream.stream
      } else {
        this.windowVideo.srcObject = null
      }
    }
  }

  clear() {
    this.state.layout.settings[this.name] = null
    this.rerender()
  }

  openWindow(title) {
    const settings = {width: 1280, height: 720}
    var windowSettings = `popup=yes,menubar=no,titlebar=no,location=no,scrollbars=no,status=no,toolbar=no,location=no,chrome=yes,width=${settings.width},height=${settings.height}`;
   var win = window.open('', title, windowSettings)
   // specifying a name for the second setting returns a reference to the same window, could be useful for setting output
  // var win = window.open('', 'hey', windowSettings)
    win.document.body.style.background = 'black'
    win.document.title = title
    win.document.body.innerHTML = ''
      var vid = win.document.createElement('video')
      vid.autoplay = "autoplay"
      vid.loop = "loop"
      vid.muted = "muted"
      vid.style.width = "100%"
      vid.style.height = "100%"
      vid.style.objectFit = "contain"
      vid.style.opacity = this.opacity/100
      win.document.body.style.padding = "0px"
      win.document.body.style.margin = "0px"
      win.document.body.appendChild(vid)
      this.window = win
      this.windowVideo = vid
      this.setWindowVideo()
  }

  setOpacity(opacity) {
    this.opacity = opacity
    if(this.windowVideo) this.windowVideo.style.opacity = this.opacity/100
    this.rerender()
  }

  createElement(name, state) {
    this.name = name
    this.state = state
    const stream = state.layout.settings[name]
    if(stream !== this.stream) {
      this.stream = stream
      this.setWindowVideo()
    }
    return html`<div class="relative">
      <div class='relative bg-black' style='height:140px'>
        ${state.cache(Video, `video-${name}`).render(stream?stream.stream:null, {objectFit: 'contain', background:'black', opacity: this.opacity/100, position: 'absolute', width:'calc(100%-20px)'})}
        <div class="absolute bottom-0 pa2">${stream ? `${stream.peer.nickname} -  ${stream.name}`: ''}</div>
        <div class='slider-container'>
          <input type="range" orient="vertical" value=${this.opacity} min="1" max="100" class="slider" style='right:20px;top:0px;width:140px' onchange=${(e)=>{this.setOpacity(e.target.value)}}>
        </div>
      </div>
      Switcher A
      <span class="mh2"> | </span>
      <i
        onclick=${()=> this.openWindow('Live Lab - Output A')}
        class="far fa-clone dim pointer ma2" title="open video into it's own window">
      </i>
       <i
         onclick=${()=> this.clear()}
         class="fas fa-times-circle dim pointer ma2" title="clear switcher">
       </i>
      </div>`
  }

}
