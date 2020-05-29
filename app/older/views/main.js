'use strict'

const html = require('choo/html')
const login = require('./login.js')
const workspace = require('./workspace.js')

module.exports = mainView
function mainView (state, emit) {
  if (!state.user.loggedIn) {
    return html`
    <div>
      ${login(state, emit)}
    </div>
    `
  } else {
    return html`
    <div class="w-100 h-100 mw-100 dt">
      ${workspace(state, emit)}
    </div>
    `
  }
}
// 
// ${state.user.isOnline === false ?
//     html`
//       <div class='absolute bg-red w-100 pa3 tc'>
//         You are not connected to the internet :(
//       </div>` : ''
//     }
