'use strict'
const html = require('choo/html')
const displayPreview = require('./components/displayPreview.js')
const trackSelector = require('./components/trackSelector.js')
const showControlHeader = require('./components/showControlHeader.js')

function showControlView (state, emit) {
  return html`
  <div class="flex-container">
    ${showControlHeader({
      title: 'Displays',
      subtitle: 'Video streams (Drag from shared media to add to workspace)',
      showAddButton: true
    }, emit)}
    <div class="content-scrollable">
      <div class="col-sticky">
        ${state.show.displays.map((el, index) => displayPreview(el, index, emit))}
      </div>
      <div class="col-scrollable">
         ${state.show.displays.map((el, index) => trackSelector(el, index, state, emit))}
      </div>
    </div>
  </div>
  `
}

module.exports = showControlView
