'use strict'

const html = require('choo/html')
const Login = require('./login.js')
const communication = require('./communication.js')
const menu = require('./menu.js')
const peersList = require('./peersList.js')
const Chat = require( './chat.js')
const Audio = require( './audio.js')
const Switcher = require( './switcher.js')
const AddMedia = require('./addMedia.js')

// const chat = new Chat()
// const audio = new Audio()
//const workspace = require('./workspace.js')
const floating = (content, name, label, state, emit) => {
  if(state.layout.panels[name] && (state.layout.collapsed !== 0 || name === 'chat')) {
    return html`
      <div class="pa4 bg-mid-gray w-100 ma2 shadow-2" style="pointer-events:all; flex:0">
      <i
              class="fas fa-times relative fr dim pointer"
              title="close ${label}"
              style="top:-20px;right:-20px"
              aria-hidden="true"
              onclick=${() =>{ emit('layout:toggleMenuItem', name, 'panels')}} >
      </i>
        ${content}
      </div>
    `
  } else {
    return html`<div style="display:none">${content}</div>`
  }
}

const modal = (content, name, label, state, emit) => {
  if(state.layout.panels[name]) {
    return html`
      <div class="pa2 pa4-ns fixed w-100 h-100 top-0 left-0" style="pointer-events:all;background:rgba(213, 0, 143, 0.8)">
      <i
              class="fas fa-times absolute top-0 right-0 ma1 ma4-ns fr f4 dim pointer"
              title="close ${label}"
              aria-hidden="true"
              onclick=${() =>{ emit('layout:toggleMenuItem', name, 'panels')}} >
      </i>
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
  } else {
      console.log('call en')
    if(state.user.callEnded === true) {
      return html`<div class="pa5 f-headline">bye .... :] </div>`
    } else {
      //console.log(state.multiPeer.streams)
      return html`<div class="w-100 h-100">
          ${communication(state, emit)}
          <div class="w-100 h-100 top-0 left-0 fixed flex flex-row-reverse-ns flex-column-reverse" style="pointer-events:none">
            ${menu(state, emit)}
            <div class="flex flex-column flex-wrap-reverse-ns flex-wrap justify-end w-100 w6-ns">
              ${floating(state.cache(Audio, 'audio-el').render(state.multiPeer.streams), 'audio', 'volume controls', state, emit)}
              ${floating(state.cache(Switcher, 'switcher-a').render('switcherA', state), 'switcherA', 'switcher A', state, emit)}
              ${floating(state.cache(Switcher, 'switcher-b').render('switcherB', state), 'switcherB', 'switcher B', state, emit)}
              ${floating(state.cache(Chat, 'chat-el').render(state.multiPeer), 'chat', 'chat', state, emit)}
              ${floating(peersList(state.multiPeer), 'users', 'participants currently in room', state, emit)}
              <div></div>
            </div>

            ${modal(state.cache(AddMedia, 'add-audio').render({
              saveText: "add media stream",
              onCancel: () => { emit('layout:toggleMenuItem', 'addMedia', 'panels')},
              onSave: ({ stream, mediaObj }) => {
                emit('layout:toggleMenuItem', 'addMedia', 'panels')
                emit('user:addStream', stream)
              }
            }), 'addMedia', 'add media', state, emit)}
          </div>
      </div>`
    }
   }
     // ${peersList(state, emit)}
  // return html`<div>${grid(state, emit)}</div>`
}
