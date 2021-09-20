// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
module.exports = {
  debounce: (func, wait, immediate) => {
    var timeout
    return () => {
      var context = this, args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  },

  openWindow: ({ stream = null, title = '', id = Date.now(), width = 1280, height = 720 }) => {
    var windowSettings = `popup=yes,menubar=no,titlebar=no,location=no,scrollbars=no,status=no,toolbar=no,location=no,chrome=yes,width=${width},height=${height}`
  
    // if id is the same as an existing window, will access an existing window with that name
    var win = window.open('', id, windowSettings)
    win.document.body.style.background = 'black'
    win.document.title = title

    const existingVid = win.document.querySelector('video')
    var vid = existingVid === null ? win.document.createElement('video') : existingVid
    vid.autoplay = 'autoplay'
    vid.loop = 'loop'
    // vid.controls = true
    vid.muted = 'muted'
    vid.style.width = '100%'
    vid.style.height = '100%'
    vid.style.objectFit = 'contain'
    win.document.body.style.padding = '0px'
    win.document.body.style.margin = '0px'
    win.document.body.appendChild(vid)

    function setVideo(stream) {
      console.log('setting video', stream)
      if(stream !== null) {
        const tracks = stream.getVideoTracks()
        //.map((track) =>track.clone())
        const streamCopy = new MediaStream(tracks)

        vid.srcObject = streamCopy
      } else {
        vid.srcObject = null
      }
    }

    function setOpacity(opacity) {
      vid.style.opacity = opacity / 100
    }
    
    setVideo(stream)
    
    return { vid: vid, setVideo: setVideo, setOpacity: setOpacity }
  }
}
