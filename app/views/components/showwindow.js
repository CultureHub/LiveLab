'use strict'

const html = require('choo/html')
const xtend = require('xtend')
const Nano = require('nanocomponent')

module.exports = ShowWindow

// Video container component that accepts a mediaStreamTrack as well as display parameters
function ShowWindow () {
  if (!(this instanceof ShowWindow)) return new ShowWindow()
  this.props = {
    fullscreen: false,
    track: null,
    open: false,

  }
  this.video=  null,
  this.win = null
  Nano.call(this)
}

ShowWindow.prototype = Object.create(Nano.prototype)

ShowWindow.prototype.createElement = function (props, onClose) {
    this.onClose = onClose
  //  console.log("creating el", props, this.props.open, this)
    if(props.open===true){
      this.initWindow()
    }

    this.props.open = props.open
    this.props.track = props.track
    // var defaultHtmlProps = {
    //   autoplay: 'autoplay',
    //   muted: 'muted'
    // }
    // var _htmlProps = xtend(defaultHtmlProps, this.props.htmlProps)
    //
    // var el = html`<video ${_htmlProps}></video>`
    // if(this.props.id && this.props.track) addTrackToElement(this.props.track, el)
    return html`<div></div>`

}

ShowWindow.prototype.directOpen = function(){
  this.initWindow()
  if(this.props.track!==null) this.displayTrack(this.props.track)
  this.props.open = true
}
//to do: check whether popup blocked
ShowWindow.prototype.initWindow = function(){
//  console.log("initing window")
  var windowSettings = "popup=yes,menubar=no,location=no,resizable=no,scrollbars=no,status=no,toolbar=no,location=no,chrome=yes";
  this.win = window.open('', JSON.stringify(Date.now()), windowSettings)

  this.win.onbeforeunload = this.onClose


  //hacky way to remove default controls: https://css-tricks.com/custom-controls-in-html5-video-full-screen/
  // https://stackoverflow.com/questions/4481485/changing-css-pseudo-element-styles-via-javascript
  var win = this.win
  var addRule = (function (style) {
    var sheet = win.document.head.appendChild(style).sheet;
    return function (selector, css) {
        var propText = typeof css === "string" ? css : Object.keys(css).map(function (p) {
            return p + ":" + (p === "content" ? "'" + css[p] + "'" : css[p]);
        }).join(";");
        sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
    };
})(win.document.createElement("style"));

addRule("::-webkit-media-controls", {
  display: "none"
});

  this.video = this.win.document.createElement('video')
  this.video.autoplay = true
  this.video.setAttribute('controls', false)
  this.video.setAttribute('allowFullScreen', true)
  this.video.style.width = "100%"
  this.video.style.height = "100%"
  this.video.style.objectFit = "fill"
  this.win.document.body.style.padding = "0px"
  this.win.document.body.style.margin = "0px"
  this.win.document.body.appendChild(this.video)
  var vid = this.video
  this.win.document.body.onkeydown = function(){
    //console.log("key")
    vid.webkitRequestFullScreen()
  }
//  this.win.document.getElementBy
}

ShowWindow.prototype.displayTrack = function(track){
//  console.log("CHANGING TRACK", track)
  var tracks = []
  tracks.push(track)
  var stream = new MediaStream(tracks) // stream must be initialized with array of tracks, even though documentation says otherwise
  this.video.srcObject = stream
  this.win.document.title = track.id
}

// update stream if track id has changed
ShowWindow.prototype.update = function (props) {
//  console.log("update win", props, this.props)

  if(props.open===true){
    if(this.props.open !== true){
      this.props.track = props.track
      this.initWindow()
      if(props.track) this.displayTrack(props.track)
    }
    if(props.track!==null){
      if(this.props.track===null){
        this.displayTrack(props.track)
      } else if (props.track.id!==this.props.track.id){
         this.displayTrack(props.track)
       }
    }
    // if(props.fullscreen!==this.props.fullscreen){
    //   if(props.fullscreen===true){
    //   //  console.log(this.win.document.documentElement)
    //     this.video.webkitRequestFullScreen()
    //     this.win.document.documentElement.webkitRequestFullScreen()
    //   } else {
    //   //  this.video.exitFullscreen()
    //   }
    // }
  } else {
    if(this.win) if(!this.win.closed) this.win.close()
  }
  this.props.open = props.open
  this.props.track = props.track
  this.props.fullscreen = props.fullscreen
  //
  //
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
