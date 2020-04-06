'use strict'

const html = require('choo/html')
const xtend = require('xtend')
var Nano = require('nanocomponent')

module.exports = Popup

//Popup window component that displays content passed in
function Popup () {
  if (!(this instanceof Popup)) return new Popup()
  this.props = {
    htmlProps: {}
  }
  Nano.call(this)
}

Popup.prototype = Object.create(Nano.prototype)

Popup.prototype.createElement = function (props) {
    this.props = props
    // var defaultHtmlProps = {
    //   autoplay: 'autoplay',
    //   muted: 'muted'
    // }
    // var _htmlProps = xtend(defaultHtmlProps, this.props.htmlProps)
    //
    // var el = html`<video ${_htmlProps}></video>`
    // if(this.props.id && this.props.track) addTrackToElement(this.props.track, el)

    this.window = window.open(null, "SHOW", 'fullscreen=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no')
    var div = html`<div>test div</div>`
    this.window.document.body.appendChild(div)
    return div

}

// function addTrackToElement(track, element){
//   var tracks = []
//   tracks.push(track)
//   var stream = new MediaStream(tracks) // stream must be initialized with array of tracks, even though documentation says otherwise
//   element.srcObject = stream
// }

// update stream if track id has changed
Popup.prototype.update = function (props) {


  // if (props.track && props.track != null) {
  //
  // //  if(props.needsUpdate === true || props.id !== this.props.id) {
  //   if(props.track !== this.props.track) {
  //     console.log("rendering", props.track)
  //     this.props.track = props.track
  //     this.props.id = props.id
  //     addTrackToElement(this.props.track, this.element)
  //   }
  // }

  return false
}
