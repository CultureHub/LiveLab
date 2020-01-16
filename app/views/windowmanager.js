'use strict'
const html = require('choo/html')
const Window = require('./components/showwindow.js')
const Dropdown = require('./components/dropdown.js')

module.exports = windowManagerView

var NUM_WINDOWS = 3

var show = []
const trackDropdown = []

for(var i = 0; i < NUM_WINDOWS; i++){
  show[i] = new Window()
  trackDropdown[i] = Dropdown()
}

function windowManagerView (state, emit) {

  var windowControls = state.ui.windows.map((win, index)=>
  {

    var el =''
    if(!win.open){
      el = html`<div
        class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim"
        onclick=${() => {
          emit('ui:openWindow', index)
          show[index].directOpen()
        }}
        >+ Open Window</div>`
    } else {
      var trackId = ''
      if(win.track!==null) trackId = win.track.id
      el = html`<div>


        ${
          trackDropdown[index].render({
            value: index+ ':: ' + trackId,
            options: state.media.all.filter((trackId)=>{
              //console.log("checking ", trackId, state.media.byId[trackId])
              return state.media.byId[trackId].track.kind==="video"
            }).map((id)=>({
              value: id,
              label: id
            })),
            onchange: (value) => {
              emit('ui:updateWindowTrack', {value: value, index: index})
            },
            style: ' bg-mid-gray f7'
          })
        }
      <div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('ui:closeWindow', index))}>close window ${index}</div>

      </div>`
    }

    return html`
      <div  style = "width:100%;height:60px">
        ${el}
        ${show[index].render(state.ui.windows[index], ()=>{
            // console.log("window closing")
             emit('ui:closeWindow', index)
           })}

      </div>`
  })

  return html`
    <div class="pa3 dib" style="width:100%">

    ${windowControls}
       Click on an open window and press any key to make fullscreen
    </div>
    `
}
