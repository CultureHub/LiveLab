'use strict'

const html = require('choo/html')
const xtend = require('xtend')
var Nano = require('nanocomponent')

module.exports = VideoContainer

// Video container component that accepts a mediaStreamTrack as well as display parameters
function VideoContainer () {
  if (!(this instanceof VideoContainer)) return new VideoContainer()
  this.props = {
    htmlProps: {}
  }
  Nano.call(this)
}

VideoContainer.prototype = Object.create(Nano.prototype)

VideoContainer.prototype.createElement = function (props) {
    this.props = props
    var defaultHtmlProps = {
      autoplay: 'autoplay',
      muted: 'muted'
    }
    var _htmlProps = xtend(defaultHtmlProps, this.props.htmlProps)

    var el = html`<video ${_htmlProps}></video>`
    if(this.props.id && this.props.track) addTrackToElement(this.props.track, el)
    return el

}

function addTrackToElement(track, element){
  var tracks = []
  tracks.push(track)
  var stream = new MediaStream(tracks) // stream must be initialized with array of tracks, even though documentation says otherwise
  element.srcObject = stream
}

// update stream if track id has changed
VideoContainer.prototype.update = function (props) {


  if (props.track) {

  //  if(props.needsUpdate === true || props.id !== this.props.id) {
    if(props.track !== null) {
      if(props.track !== this.props.track) {

        this.props.track = props.track
        this.props.id = props.id
        addTrackToElement(this.props.track, this.element)
      }
    } else {
      this.element.srcObject = null
      this.props.track = props.track
      this.props.id = props.id
    //  return true
    }
  } else {
      this.element.srcObject = null
      this.props.track = props.track
      this.props.id = props.id
  }

  return false
}
