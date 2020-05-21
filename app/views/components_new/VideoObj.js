const Component = require('choo/component')
const html = require('choo/html')

const css = (style, el) => {
  Object.entries(style).forEach(([key, value]) => {
    el.style[key] = value
  })
}

module.exports = class VideoObj extends Component {
  constructor(opts) {
    super(opts)
  }

  update(srcObject = null, style = {}) {
    console.log('video src2', srcObject, this._el.srcObject)
    if(srcObject !== this._el.srcObject) {
      console.log('setting src object')
      this._el.srcObject = srcObject
      this._el.play()
    }
    window.stream = srcObject
  //  if(srcObject !== null) console.log('video src2 tracks', srcObject.getVideoTracks())
    css(style, this._el)
    return false
  }

  createElement(srcObject = "", style = {}) {
    //this.srcObject = srcObject
    this._el = html`<video autoplay=true loop=true controls=false muted=true class="w-100 h-100"></video>`
    this._el.srcObject = srcObject
    css(style, this._el)

    // console.log('video src', srcObject)
    this._el.oncanplay = () => {
      this._el.muted = true
      this._el.play()
    }
    return this._el
  }
}
