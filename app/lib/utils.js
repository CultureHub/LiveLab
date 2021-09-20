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

  openWindow: ({ stream = null, title = '', width = 1280, height = 720 }) => {
    var windowSettings = `popup=yes,menubar=no,titlebar=no,location=no,scrollbars=no,status=no,toolbar=no,location=no,chrome=yes,width=${width},height=${height}`
    // var win = window.open('', JSON.stringify(Date.now()), windowSettings)
    var win = window.open('', title, windowSettings)
    // specifying a name for the second setting returns a reference to the same window, could be useful for setting output
    win.document.body.style.background = 'black'


    win.document.title = title

    const existingVid = win.document.querySelector('video')
    console.log('stream vid', existingVid)

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
    //if (stream !== null) {
      // clone only video tracks (when audio tracks are cloned and muted, seems to mute all instances of that audio track in the call)
      setVideo(stream)
    //}
    return { vid: vid, setVideo: setVideo, setOpacity: setOpacity }
  }
}
