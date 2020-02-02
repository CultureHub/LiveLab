'use strict'

const html = require('choo/html')
const Modal = require('./components/modal.js')
const Dropdown = require('./components/dropdown.js')
const Video = require('./components/funvideocontainer.js')
const radioSelect = require('./components/radioSelect.js')
const settingsUI = require('./components/settingsUI.js')
const input = require('./components/smallInput.js')

module.exports = addBroadcast

const audioDropdown = Dropdown()
const videoDropdown = Dropdown()

//const deviceDropdown = Dropdown()
//const previewVid = VideoEl()

function addBroadcast (devices, emit, showElement) {
  var bState = devices.addBroadcast

  var audioinput = devices.audioinput
  var videoinput = devices.videoinput
  var defaultAudio = devices.default.inputDevices.audio
  var defaultVideo = devices.default.inputDevices.video

  // } else {
  //     constraintOptions = html`<div id="screen-constraints"></div>`
  // }

  console.log('DEVICES', devices)

  return html`

    ${Modal({
      show: showElement,
      header: "Media Settings",
      contents: html`<div id="add broadcast" class="pa3 f6 fw3">

      ${input('name', 'name', {
        value:bState.name,
        onkeyup: (e) => {
          emit('devices:setBroadcastName', e.target.value)
        }
      })}
            ${videoDropdown.render({
              value: 'Video:  ' + (defaultVideo === null ? '' : videoinput.byId[defaultVideo].label),
              options: videoinput.all.map((id) => (
                {
                  value: id,
                  label: videoinput.byId[id].label
                }
              )),
              onchange: (value) => {
                emit('devices:setDefaultVideo', value)
              }
            })}

          <!--  <p class="red">${bState.errorMessage}</p> -->
            <div class="w-100 db flex mt4">
              <div class="w-60 h5 dib fl">
               ${Video({
                 htmlProps: {
                   class: 'w-100 h-100',
                   style: 'object-fit:contain;'
                 },
                 index: "addMedia",
                 track: devices.default.previewTracks.video,
                 id: devices.default.previewTracks.video === null ? null : devices.default.previewTracks.video.id
               })}
              </div>
              <div class="w-30 dib fl pa4">
                <h4>Apply constraints</h4>
              ${Object.keys(devices.default.constraints.video).map((constraint) => input(constraint, "",
                    {
                      value: devices.default.constraints.video[constraint],
                      onkeyup: (e) => updateBroadcastConstraint(constraint, e.srcElement.value)
                    })
                  )}
                  </div>
                  </div>
                  <div class="mt2 mb4 i">Actual video dimensions:  ${devices.default.trackInfo.video.width}x${devices.default.trackInfo.video.height}, ${devices.default.trackInfo.video.frameRate}fps</div>
                  <div class="f6 link dim ph3 pv2 m2 mb2 dib white bg-gray pointer" onclick=${() => (emit('devices:toggleSettings', true))}>Cancel</div>
                  <div class="f6 link dim ph3 pv2 m2 mb2 dib white bg-dark-pink pointer" onclick=${() => (emit('devices:addNewMediaToBroadcast'))}>Add Media to Current Call</div>
        </div>`,
      close: () => (emit('devices:toggleSettings', false))
    })}
    `

    function setBroadcastKind(e){
      emit('devices:setBroadcastKind', e.target.value)
    }

    function updateBroadcastConstraint(constraint, value){
      console.log('updating', constraint, value)
      emit('devices:updateBroadcastConstraint', {
        kind: 'video',
        constraint: constraint,
        value: parseInt(value)
      })
    }

    function updateBroadcastConstraints(updateObject){
      emit('devices:updateBroadcastConstraints', updateObject)
    }


}
