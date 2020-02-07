'use strict'
const html = require('choo/html')
const Video = require('./funvideocontainer.js')
const slider = require('./verticalSlider.js')

module.exports = displayPreview

function displayPreview (display, index, emit) {
  var stream = display.streams[display.active]
  return html`
    <div class="display row">
      <div class="video-holder">
        <div class="video" style="opacity:${parseFloat(display.opacity)/100}">
        ${Video({
          htmlProps: {
            class: 'h-100 w-100'
          },
          index: 'display-video-' +index,
          stream: stream !== null  ? stream.stream : null,
          id: stream !== null ?  stream.stream.id : null
        })}
        </div>
        <div class="video-title display-title">
          <span
            contenteditable="true"
            onblur=${(e)=> {
              console.log(e, e.target.value)
              emit('show:updateDisplayProperty', {
              displayIndex: index,
              property: 'title',
              value: e.target.innerHTML
            })
            }}>${display.title}</span>
          <i
            onclick=${()=>(emit('show:toggleWindow', index))}
            style="margin-left:6px" class="far fa-clone dim pointer ${display.isOpen?" active": ""}" title="${display.isOpen? 'close ': 'open '} window">
          </i>
          <i
            onclick=${()=>(emit('show:removeDisplay', index))}
            style="margin-left:2px"
            class="far fa-times-circle dim pointer" title="remove display">
          </i>
        </div>
      </div>
      ${slider({
        value: display.opacity,
        onChange: (e) => {
        //  console.log("changing", val)
          emit('show:updateDisplayProperty', {
          displayIndex: index,
          property: 'opacity',
          value: e.target.value
        })}})}
    </div>
  `
}
