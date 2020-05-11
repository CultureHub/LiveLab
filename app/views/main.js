'use strict'

const html = require('choo/html')
const Login = require('./login.js')
const communication = require('./communication.js')
const menu = require('./menu.js')
//const peersList = require('./peersList.js')
const Chat = require( './chat.js')
const Audio = require( './audio.js')

// const chat = new Chat()
// const audio = new Audio()
//const workspace = require('./workspace.js')
const floating = (content, isVisible) => {
  if(isVisible) {
    return html`
      <div class="pa4 bg-mid-gray db w-100 mt2" style="pointer-events:all">
        ${content}
      </div>
    `
  } else {
    return html`<div style="display:none">${content}</div>`
  }
}

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
        <div class="fixed bottom-0 pb2 right-0 pr5 h-100 flex flex-column justify-end" style="width:25rem;pointer-events:none">
          ${floating(state.cache(Audio, 'audio-el').render(state.multiPeer.streams), state.layout.menu.audio)}
          ${floating(state.cache(Chat, 'chat-el').render(state.multiPeer), state.layout.menu.chat)}
        </div>
        ${menu(state, emit)}
    </div>`
   }
     // ${peersList(state, emit)}
  // return html`<div>${grid(state, emit)}</div>`
}
