const html = require('choo/html')

module.exports = (multiPeer) => {

  return html`
  <div class="">
      ${multiPeer.user.nickname}
      ${Object.entries(multiPeer.peers).map(([id, peer]) => html `<div>${peer.nickname}</div>`)}
  </div>
  `
}
