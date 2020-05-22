var html = require('choo/html')
var Component = require('choo/component')

module.exports = class AudioVis extends Component {
  constructor () {
    super()
    this.stream = null
  }

  update(stream) {
    this.setStream(stream)
    return false
  }

  load() {
    this.visualize()
  }

  unload() {
    window.cancelAnimationFrame(this.animation)
  }

  setStream(stream) {
    if(stream !== this.stream) {
      if(this.source) this.source.disconnect()
      if(stream !== null) {
        if(stream.getAudioTracks().length > 0) {
          this.source = this.audioCtx.createMediaStreamSource(stream)
            // console.log('setting stream', stream, this.analyser, this.source)
          this.source.connect(this.analyser)
          this.stream = stream
        }
      }
    }
  }

  visualize() {
     // console.log('visualizing')
    this.analyser.getByteFrequencyData(this.dataArray)
    this.animation = requestAnimationFrame(this.visualize.bind(this))
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    var bufferLength = this.analyser.frequencyBinCount
    var barWidth = (this.canvas.width / bufferLength) ;
    var barHeight;
    var x = 0
    for(var i = 0; i < bufferLength; i++) {
            barHeight = this.dataArray[i]/2;

            this.ctx.fillStyle = 'rgb(' + (barHeight+100) + ',250,250)';
            this.ctx.fillRect(x,this.canvas.height-barHeight/2,barWidth,barHeight);

            x += barWidth + 1;
      }
  }

  createElement(stream) {
    this.audioCtx = window.audioCtx
    this.audioCtx.resume()
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.smoothingTimeConstant = 0.8
    this.analyser.fftSize = 512
    this.canvas = html`<canvas></canvas>`
    this.ctx = this.canvas.getContext('2d')
    var bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength)
    this.isActive = false
    this.setStream(stream)
    return this.canvas
  }
}
