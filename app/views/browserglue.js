var html = require('choo/html')
var Component = require('choo/component')


module.exports = class Browserglue extends Component {
  constructor (id, state, emit) {
    super(id)

  }

  update () {
    return false
  }



  createElement (state) {
    return html`<div></div>`
  }
}
