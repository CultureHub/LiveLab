const html = require('choo/html')
const Component = require('choo/component')
const browserglue = require('browserglue')
const { button } = require('./formElements.js')

module.exports = class Browserglue extends Component {
  constructor (id, state, emit) {
    super(id)
    const bg = new browserglue.Client()
    this.isConnected = false
    this.channelDialogIsShowing = false

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

    this.localChannels = []
    this.remoteChannels = []
  }

  update () {
    return false
  }

  async addChannel({name = '/test', port = '54321'}) {
    const thisChannel = await this.bg.addChannel(name, port)

    thisChannel.on('message', async blob => {
      console.log('got message')
      const text = await blob.text();
      console.log("[/bar]", text);
      // how to parse to an object?
    });

    console.log('created channel', thisChannel)
    this.localChannels.push({ name, port, thisChannel, messages: ''})
    this.channelDialogIsShowing = false
    this.rerender()
  }

  showAddChannel() {
    this.channelDialogIsShowing = true
    this.rerender()
  }

  createElement (state) {
    let content = ''
    if(this.channelDialogIsShowing) {
      content = html`<div>
        Add a channel
        <span> Port </span>
        <input placeholder="port"></input>
        <span> Name </span>
        <input placeholder="name"></input>
        ${button({
          text: 'add',
          onClick: this.addChannel.bind(this),
          classes: 'bg-dark-pink b fr mv2'
        })}
      </div>`
    } else {
      content =  html`
      ${this.isConnected ? html`<div>connected to browserglue at ${this.bg.url}
      ${button({
        text: 'add channel',
        onClick: this.showAddChannel.bind(this),
        classes: 'bg-dark-pink b fr mv2'
      })}
        </div>`
      : `browserglue not connected`}
      <div class="br pt2"> Local </div>
      ${this.localChannels.map((channel) => html`<div class="ba pa2">${channel.name} | ${channel.port}</div>`)}`
    }
    return html`<div>
     ${content}
    </div>`
  }
}
