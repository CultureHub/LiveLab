'use strict'

const html = require('choo/html')
const Login = require('./login.js')
const communication = require('./communication.js')
const menu = require('./menu.js')
//const peersList = require('./peersList.js')
const Chat = require( './chat.js')

//const workspace = require('./workspace.js')

module.exports = mainView
function mainView (state, emit) {
  if (!state.user.loggedIn) {
    return html`
    <div>
      ${state.cache(Login, 'login').render(state, emit)}
    </div>
    `
  }
  else {
    console.log(state.multiPeer.streams)
    return html`<div>
        ${communication(state, emit)}
        ${menu(state, emit)}
        ${state.cache(Chat, 'chat').render(state.multiPeer)}
    </div>`
   }
     // ${peersList(state, emit)}
  // return html`<div>${grid(state, emit)}</div>`
}
