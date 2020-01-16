'use strict'

const html = require('choo/html')
const login = require('./login.js')
const workspace = require('./workspace.js')

module.exports = mainView
//  <!--${AddBroadcast(state, emit)}-->
//  ${login(state, emit)}
// ${allVideos(state, emit)}
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
// test
