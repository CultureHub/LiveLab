'use strict'
const html = require('choo/html')
const input = require('./input.js')

module.exports = chatView

function chatView (state, emit) {
  var scrollEl = html`<div id="testScroll" style="bottom:0px">
    ${state.ui.chat.messages.map((obj)=>{
      return html`
        
        <tr>
          <th class="pa1">${obj.nickname}:</th>
          <td class="pa1">${obj.message}</td>
        </tr>
      `
    })}
  </div>`

var container =  html
`<div  id="scroll-container" class="overflow-y-scroll" style="max-height:140px;">
${scrollEl}
</div>`

var overall =  html`  <div  class="pa3 dib w-100">
      ${container}
      ${input('', 'message', {
        value: state.ui.chat.current,
        onkeyup: (e) => {
          if(e.keyCode=== 13){
            emit('ui:sendChatMessage')
          } else {
            emit('ui:updateChat', e.target.value)
          }
        }
      })}
      <div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer" onclick=${() => (emit('ui:sendChatMessage'))}>Send</div>
    </div>
    `
    container.scrollTop = container.scrollHeight

    //var t = document.getElementById("scrollTest")
  //  console.log("SCROLL", container.scrollHeight, container.clientHeight)

    return overall
}
