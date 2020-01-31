/* global MediaStream */
'use strict'

const html = require('choo/html')
const xtend = require('xtend')
const component = require('fun-component')
const spawn = require('fun-component/spawn')

const VideoContainer = component(function element (ctx, props) {
  // console.log('rendering', ctx, props)
  var defaultHtmlProps = {
    autoplay: 'autoplay',
  //  muted: 'muted'
  }
  ctx.prev = Object.assign({}, props)
  var _htmlProps = xtend(defaultHtmlProps, props.htmlProps)
  var el = html`<video ${_htmlProps}></video>`
  ctx.el = el
//  console.log('NEW PEER CONTAINER', props)
  initMedia(props, el)
  if(props.includeAudio) {
    el.volume = props.volume
    console.log('setting volume', el, props.volume)
  }
  return el
})

// Eventually should only contain streams, during migration contains tracks
function initMedia(props, el) {
  if(props.stream) {
    addStreamToElement(props.stream, el, props.includeAudio)
  } else if (props.id && props.track) {
    addTrackToElement(props.track, el)
  }
}

VideoContainer.on('update', function (ctx, props) {
//  console.log('updating video', ctx, props)
  if (props[0].id) {
    if (props[0].id !== ctx.prev.id) {
      if (props[0].id !== null) {
    //    console.log('adding ', props[0].id, ctx.prev.id, ctx)
      //  addTrackToElement(props[0].track, ctx.el)
        initMedia(props[0], ctx.el)
      } else {
    //    console.log('removing ', props[0].id, ctx.prev.id)
        ctx.el.srcObject = null
      }
    }
  } else {
    // console.log('removing null', props[0].id, ctx.prev.id)
    ctx.el.srcObject = null
  }
  if(props[0].includeAudio) {
    ctx.el.volume = props[0].volume
    //  console.log('setting volume', ctx.el, props.volume)
  }
  ctx.prev = Object.assign({}, props[0])
  // return false
   return false
})

VideoContainer.use(spawn((props) => props.index))

function addTrackToElement (track, element) {
  // console.log('adding ', track, element)
  var tracks = []
  tracks.push(track)
  var stream = new MediaStream(tracks) // stream must be initialized with array of tracks, even though documentation says otherwise
  element.srcObject = stream
}

// hack: only add video stream
function addStreamToElement (stream, element, includeAudio) {
if(includeAudio) {
    element.srcObject = stream
} else {
  var tracks = stream.getVideoTracks()
  var videoStream = new MediaStream(tracks)
   element.srcObject = videoStream
}

}

module.exports = VideoContainer
