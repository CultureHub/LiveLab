'use strict'
const html = require('choo/html')

module.exports = oscView

function oscView (state, emit) {
  var localOsc = state.osc.local

  var localOscEl =
    Object.keys(localOsc).map((port) => {
      // console.log("poo", port, localOsc[port])
      var oscArgs = localOsc[port].message == null ? '' : JSON.stringify(localOsc[port].message)
      return html`
      <tr >
        <td class="pa1" >${state.user.nickname}</td>
        <td class="pa1" >${localOsc[port].name}</td>
        <td class="pa1" >${port}</td>
        <td class="pa1" >--</td>
        <td class="pa1 f7"><div style="width:80px;overflow:hidden;height:20px">${oscArgs}</div></td>
        <td class="pa1" >
          <i class="fas fa-times-circle dim pointer" aria-hidden="true" onclick=${() => (emit('osc:removeLocalOscBroadcast', port))}></i>
        </td>
      </tr>
    `
    })

//  console.log("OSC", localOsc, localOscEl)
  var remoteOsc = state.osc.remote

  var remoteOscEl = []
  Object.keys(remoteOsc).forEach((peerId) => {
  //  console.log("poo", id, localOsc[id])
    var peerStreams = remoteOsc[peerId]
  // <input type="text" name="fname" value=${remoteOsc[id].port} onkeyup=${(e)=>{emit('user:setLocalOscForward', {port: e.target.value, id: id})}}>
  // <div class="f6 fr ma2 link ph3 pv2 mb2 white pointer" onclick=${() => (emit('ui:StartForward'))}>Start Forward</div>
    Object.keys(peerStreams).forEach((id) => {
      var oscArgs = peerStreams[id].message == null ? '' : JSON.stringify(peerStreams[id].message)
      remoteOscEl.push(html`
      <tr>
        <td class="pa1" >${state.peers.byId[peerId].nickname}</td>
        <td class="pa1" >${peerStreams[id].name}</td>
        <td class="pa1" > -- </td>
        <td class="pa1" >${state.osc.forwarding[peerId + id] ? state.osc.forwarding[peerId + id].port : null}</td>
        <td class="pa1 f7" ><div style="width:80px;overflow:hidden;height:20px">${oscArgs}</div></td>
        <td class="pa1" >
          <i class="fas fa-link dim pointer" aria-hidden="true" onclick=${() => (emit('osc:configureForwarding', peerId+id))}></i>
          </td>


      </tr>
      `)
    })
  })

  var addBroadcast = html`<div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('osc:addOSC', true))}>+ Add OSC Broadcast</div>`

   // var headerStyle = "width:20%;font-size:11px;padding:2px"
  var headerStyle = 'font-size:12px;font-weight:200;padding:4px;border-bottom: solid white 1px'
  return html`<div class="pa2">
      <div style="max-height:180px;overflow-y:auto">
  <table style="max-width:100%;word-wrap:break-word;table-layout:fixed;font-size:12px" cellspacing="0" cellpadding="1" >
    <thead>
      <tr>
        <th style=${headerStyle}>Peer</th>
        <th style=${headerStyle}>Name</th>
        <th style=${headerStyle}>Listening on Local Port</th>
        <th style=${headerStyle}>Forwarding to Local Port</th>
        <th style=${headerStyle}>Params</th>
      </tr>
    </thead>
        <tbody>
      ${localOscEl}
      ${remoteOscEl}
      </tbody>
  </table>
  </div>
    ${addBroadcast}
  </div>`
}
