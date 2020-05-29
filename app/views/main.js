'use strict'

const html = require('choo/html')
const Login = require('./login.js')
const communication = require('./communication.js')
const menu = require('./menu.js')
const peersList = require('./peersList.js')
const settingsPanel = require('./settings.js')
const onload = require('on-load')

const Chat = require( './chat.js')
const Audio = require( './audio.js')
const Switcher = require( './switcher.js')
const AddMedia = require('./addMedia.js')


// const chat = new Chat()
// const audio = new Audio()
//const workspace = require('./workspace.js')


const modal = (content, name, label, state, emit) => {
  if(state.layout.panels[name]) {
    return html`
      <div class="pa2 pa4-ns fixed w-100 h-100 top-0 left-0" style="pointer-events:all;background:rgba(213, 0, 143, 0.8);">
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
  const settings = state.layout.settings
  // older layout
  //   <div class="pa4 bg-mid-gray w-100 ma2 shadow-2" style="pointer-events:all;flex:${settings.columnLayout?'1':'0'}">
  const floating = (content, name, label, type = 'panels') => {
    let showPanel = (state.layout[type][name] && (state.layout.collapsed !== 0 || name === 'chat'))
    let hidden = showPanel ? 'max-height:1000px;' :  "max-height:0px;overflow:hidden;border:none;"
    // if(showPanel) {
       const panel = html`
        <div class="${showPanel?'w-100 ':'pv0'} panel bg-dark-gray ba ma0 flex flex-column"
         style="border:1px solid #555;pointer-events:all;flex:${settings.columnLayout?'1':'0'};${hidden}">
          <div class="flex justify-between pa1">
            <div class="ttu">   <!-- my title  -->  </div>
            <i
                  class="fas fa-times self-end dim pointer pa1 mid-gray"
                  title="close ${label}"
                  aria-hidden="true"
                  onclick=${() =>{ emit('layout:toggleMenuItem', name, type)}} >
            </i>
          </div>
          <div class="pa3 pt0">
            ${content}
          </div>
        </div>
      `
      // listen for panel resize events in order to calculate panel margin
      onload(panel, () => {
        console.log('PANEL LOADED')
        const resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
          //  emit('layout:panelResize')
             emit('render')
          }
        })
        resizeObserver.observe(panel)
      })
      return panel
    // } else {
    //   return html`<div style="display:none">${content}</div>`
    // }
  }

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
      return html`<div class="w-100 h-100 courier">
          ${communication(state, emit)}
          <div class="w-100 h-100 top-0 left-0 fixed flex flex-row-reverse-ns flex-column-reverse" style="pointer-events:none">
            ${menu(state, emit)}
            <div class="flex flex-column flex-wrap-reverse-ns flex-wrap justify-end w-100 w6-ns">
              ${['a', 'b', 'c', 'd'].splice(0, state.layout.settings.numberOfSwitchers).map((switcher) => floating(
                state.cache(Switcher, `switcher-${switcher}`).render(switcher, state), switcher, `switcher ${switcher}`, 'switchers')
              )}
              ${floating(state.cache(Audio, 'audio-el').render(state.multiPeer.streams), 'audio', 'volume controls')}
               ${floating(settingsPanel(state, emit), 'settings', 'settings')}
              ${floating(state.cache(Chat, 'chat-el').render(state.multiPeer), 'chat', 'chat')}
              ${floating(peersList(state.multiPeer), 'users', 'participants currently in room')}
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
//    ${modal(html`<div>SETTINGS</div>`, 'settings', 'settings', state, emit)}
   // ${floating(state.cache(Switcher, 'switcher-a').render('switcherA', state), 'switcherA', 'switcher A', state, emit)}
   // ${floating(state.cache(Switcher, 'switcher-b').render('switcherB', state), 'switcherB', 'switcher B', state, emit)}
     // ${peersList(state, emit)}
  // return html`<div>${grid(state, emit)}</div>`
}
