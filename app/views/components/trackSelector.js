'use strict'
const html = require('choo/html')
const Video = require('./funvideocontainer.js')

module.exports = trackSelector

function trackSelector (selectorInfo, selectorIndex, state, emit) {
  return html`
    <div class="row">
      ${selectorInfo.streams.map((media, index) => {
        return html`
          <div class="video-holder selectable"
          onclick=${() => (emit('show:setActiveVideo', {
            displayIndex: selectorIndex,
            streamIndex: index
          }))}

          draggable = "true"

          ondragstart=${() => (emit('show:clearVideoStream', {displayIndex: selectorIndex, streamIndex: index}))}

          ondragover=${(ev) => (ev.preventDefault())}

          ondrop=${(ev) => (emit('show:setVideoStream', {displayIndex: selectorIndex, streamIndex: index}))}
          >
            <div class="video">
              ${Video({
                htmlProps: {
                  class: 'h-100 w-100'
                },
                index: 'selector'+'video'+selectorIndex+index,
                stream: media !== null  ? media.stream : null,
                id: media !== null ?  media.stream.id : null
              })}
            </div>
            <div class="video-title ${selectorInfo.active === index ? 'selected' : ''}">
              ${media === null ? '' : state.peers.byId[media.peerId].nickname + '-' + media.name }
            </div>
          </div>
        `
      }
      )}
    </div>
  `
}
