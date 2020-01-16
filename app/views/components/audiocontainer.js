'use strict'

const html = require('choo/html')
const xtend = require('xtend')
var Nano = require('nanocomponent')

module.exports = AudioContainer

// audio container component that accepts a mediaStreamTrack and volume parameter
function AudioContainer () {
  if (!(this instanceof AudioContainer)) return new AudioContainer()
  this.props = {
    htmlProps: {}
  }
  Nano.call(this)
}

AudioContainer.prototype = Object.create(Nano.prototype)

AudioContainer.prototype.createElement = function (props) {
    this.props = props
    var defaultHtmlProps = {
      autoplay: 'autoplay'
    }
    var _htmlProps = xtend(defaultHtmlProps, this.props.htmlProps)

    var el = html`<audio ${_htmlProps} ></audio>`
    el.volume = props.volume ? props.volume : 0

    if(this.props.id && this.props.track) addTrackToElement(this.props.track, el)
    return el

}

function addTrackToElement(track, element){
  //console.log("audio track", track)
  var tracks = []
  tracks.push(track)
  var stream = new MediaStream(tracks) // stream must be initialized with array of tracks, even though documentation says otherwise
  element.srcObject = stream
}

// update stream if track id has changed
AudioContainer.prototype.update = function (props) {


  if (props.track && props.track != null) {

  //  if(props.needsUpdate === true || props.id !== this.props.id) {
    if(props.track !== this.props.track) {

      this.props.track = props.track
      this.props.id = props.id
      addTrackToElement(this.props.track, this.element)
    }
  }

  if(props.volume !== this.props.volume){
    this.element.volume = props.volume
    this.props.volume = props.volume
  }
  return false
}
