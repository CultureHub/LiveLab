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

  update(srcObject = "", style = {}) {
  //  console.log('video src2', srcObject, this.element.srcObject)
    if(srcObject !== this.element.srcObject) {
  //    console.log('setting src object', srcObject, this._el)
      this.element.srcObject = srcObject
      this.element.oncanplay = () => {
        this.element.muted = true
        this.element.play()
      }
    }
    window.stream = srcObject
    css(style, this.element)
    return false
  }

  load(){
    this.element.oncanplay = () => {
      this.element.muted = true
      this.element.play()
    }
  }

  createElement(srcObject = "", style = {}) {
    //this.srcObject = srcObject
    let el = html`<video autoplay=true loop=true controls=false muted=true class="w-100 h-100"></video>`
    if(srcObject !== "")  el.srcObject = srcObject
    css(style, el)
    return el
  }
}
