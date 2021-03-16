const html = require('choo/html')
const Component = require('choo/component')
const browserglue = require('browserglue')

module.exports = class Browserglue extends Component {
  constructor (id, state, emit) {
    super(id)
    const bg = new browserglue.Client()
    this.isConnected = false
    console.log('created browserglue', bg)
    bg.on('connect', event => {
      console.log("[connect]", event)
      this.isConnected = true
      this.rerender()
    });
    bg.on('disconnect', event => {
      console.log("[disconnect]", event)
      this.isConnected = false
      this.rerender()
    });
    bg.on('change', channels => console.log("[change]", channels));
    bg.on('add-channel', ({ path }) => console.log("[add-channel]", path));
    bg.on('remove-channel', ({ path }) => console.log("[remove-channel]", path));
    bg.on('bind-port', ({ path, port }) => console.log("[bind-port]", path, port));
    bg.on('subscribe-port', ({ path, port }) => console.log("[subscribe-port]", msg));
    bg.on('unsubscribe-port', ({ path, port }) => console.log("[unsubscribe-port]", msg));
    this.bg = bg
  }

  update () {
    return false
  }



  createElement (state) {
    return html`<div>
      ${this.isConnected ? `connected to browserglue at ${this.bg.url}` : `browserglue not connected`}
    </div>`
  }
}
