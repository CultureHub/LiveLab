'use strict'

const html = require('choo/html')
const Modal = require('./components/modal.js')
const input = require('./components/input.js')

module.exports = addOscBroadcast

function addOscBroadcast (oscInfo, emit, showElement) {
  return html`
    ${Modal({
      show: showElement,
      header: 'Add OSC Broadcast',
      contents: html`<div class="pa3 f6 fw3">
          ${input('Name', 'name others will see for this osc channel', {
            value: oscInfo.name,
            onkeyup: (e) => {
              emit('osc:setOSCBroadcastName', e.target.value)
            }
          })}
          ${input('Local Port', 'Listen for osc messages on this port', {
            value: oscInfo.port,
            onkeyup: (e) => {
              emit('osc:setOSCBroadcastPort', e.target.value)
            }
          })}
          <div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('osc:listenOnLocalPort'))}>Start Listening</div>
        </div>`,
      close: () => (emit('osc:closeAddOscBroadcast'))
    })}
    `
}
