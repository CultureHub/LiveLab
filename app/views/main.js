'use strict'
const html = require('choo/html')
const Login = require('./login.js')
const communication = require('./communication.js')
const menu = require('./menu.js')
const onload = require('on-load')

/* panels */
const peersList = require('./peersList.js')
const settingsPanel = require('./settings.js')
const Chat = require('./chat.js')
const Audio = require('./audio.js')
const Switcher = require('./switcher.js')
const AddMedia = require('./addMedia.js')

const modal = (content, name, label, state, emit) => {
  if (state.layout.panels[name]) {
    return html`
      <div class="pa2 pa4-ns fixed w-100 h-100 top-0 left-0" style="pointer-events:all;background:rgba(51, 51, 51, 0.8);">
        <i
                class="fas fa-times absolute top-0 right-0 ma1 ma4-ns fr f4 dim pointer"
                title="close ${label}"
                aria-hidden="true"
                onclick=${() => {
                  emit('layout:toggleMenuItem', name, 'panels')
                }} >
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
  const floating = (
    content,
    { name, label, type = 'panels', flex = '1' } = {}
  ) => {
    let showPanel = state.layout[type][name] && !state.layout.collapsed
    if (name === 'chat' && state.layout.forceChatOpen) showPanel = true
    // open chat even if menu is collapsed
    const hidden = showPanel
      ? 'max-height:1000px;'
      : 'max-height:0px;overflow:hidden;border:none;'
    const panel = html`
        <div class="${showPanel
        ? 'w-100 '
        : 'pv0'} panel bg-dark-gray ba flex flex-column ${settings.columnLayout ||
        !showPanel
        ? 'ma0'
        : 'mv2 ma2-ns shadow-2'}"
         style="border:1px solid #555;pointer-events:all;flex:${settings.columnLayout
        ? flex
        : '0'};${hidden};">
          <div class="flex justify-between pa1">
            <div class="ttu">   <!-- my title  -->  </div>
            <i
                  class="fas fa-times self-end dim pointer pa1 mid-gray"
                  title="close ${label}"
                  aria-hidden="true"
                  onclick=${() => {
                    emit('layout:toggleMenuItem', name, type)
                  }} >
            </i>
          </div>
          <div class="pa3 pt0">
            ${content}
          </div>
        </div>
      `
    // listen for panel resize events in order to calculate panel margin
    onload(panel, () => {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          emit('render')
        }
      })
      resizeObserver.observe(panel)
    })
    return panel
  }

  if (!state.user.loggedIn) {
    return html`
    <div>
      ${state.cache(Login, 'login').render(state, emit)}
    </div>
    `
  } else {
    if (state.user.callEnded === true) {
      return html`<div class="pa5 f-headline">bye .... :] </div>`
    } else {
      return html`<div class="w-100 h-100" style="color:${state.style.colors.text1}">
          ${communication(state, emit)}
          <div class="w-100 h-100 top-0 left-0 fixed flex flex-row-reverse-ns flex-column-reverse" style="pointer-events:none">
            ${menu(state, emit)}
            <div class="flex flex-column flex-wrap-reverse-ns flex-wrap justify-end w-100 w6-ns">
              ${['a', 'b', 'c', 'd']
                .map(switcher => floating(state.cache(Switcher, `switcher-${switcher}`).render(switcher, state), { name: switcher, label: `switcher ${switcher}`, type: 'switchers' }))}
              ${floating(settingsPanel(state, emit), { name: 'settings', label: 'settings' })}
              ${floating(state.cache(Audio, 'audio-el').render(state.multiPeer.streams), { name: 'audio', label: 'volume controls' })}
              ${floating(state.cache(Chat, 'chat-el').render(state), { name: 'chat', label: 'chat', flex: '1' })}
              ${floating(peersList(state.multiPeer), { name: 'users', label: 'participants currently in room' })}
              <div></div>
            </div>

            ${modal(state.cache(AddMedia, 'add-audio').render({
                saveText: 'add media stream',
                onCancel: () => { emit('layout:toggleMenuItem', 'addMedia', 'panels') },
                showLabel: true,
                state: state,
                onSave: ({ stream, mediaObj }) => {
                  emit('layout:toggleMenuItem', 'addMedia', 'panels')
                  emit('user:addStream', stream, mediaObj.label)
                }
              }), 'addMedia', 'add media', state, emit
            )}
          </div>
      </div>`
    }
  }
}
