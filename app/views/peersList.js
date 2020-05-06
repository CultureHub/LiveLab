const html = require('choo/html')

module.exports = (state, emit) => {

  return html`
  <div class="fixed bottom-0 right-0 pa4">
      ${Object.entries(state.multiPeer.peers).map(([id, peer]) => html `<div>${peer.nickname}</div>`)}
  </div>
  `
}
