const html = require('choo/html')
const Component = require('choo/component')
const browserglue = require('browserglue')

module.exports = class Browserglue extends Component {
  constructor (id, state, emit) {
    super(id)
    const bg = new browserglue.Client()
    console.log('created browserglue', bg)
  }

  update () {
    return false
  }



  createElement (state) {
    return html`<div></div>`
  }
}
