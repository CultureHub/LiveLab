const Component = require('choo/component')
const html = require('choo/html')

const css = (style, el) => {
  Object.entries(style).forEach(([key, value]) => {
    el.style[key] = value
  })
}

module.exports = class Video extends Component {
  constructor(opts) {
    super(opts)
  }

  update(src = "", style = {}) {
    if(src !== this._el.src) this._el.src = src
    css(style, this._el)

    return false
  }

  createElement(src = "", style = {}) {
    //this.src = src
    this._el = html`<video autoplay=true loop=true controls=false muted=true class="w-100 h-100"></video>`
    this._el.src = src
    css(style, this._el)

    console.log(this._el.style, style)
    this._el.oncanplay = () => {
      this._el.muted = true
      this._el.play()
    }
    return this._el
  }
}
