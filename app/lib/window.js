class Window {
  constructor({ isOpen = false, stream, onClose, title, fullscreen = false, opacity}) {
    this.isOpen = open
    this.stream = stream
    this.onClose = onClose
    this.fullscreen = fullscreen
    this.title = ''
    this.opacity = opacity
  }

  open() {
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
    })(win.document.createElement("style"))

    addRule("::-webkit-media-controls", {
      display: "none"
    })

    var self = this
  setTimeout(function () {
    //  self.document.write('<title>My PDF File Title</title>')
    //this.win.onload = function () {
    self.div = self.win.document.createElement('div')
    self.div.innerHTML = '<i>'+ self.title + ':</i> click in this window to init. press any key to make full screen.'
    self.div.style.fontSize = '30px'
    self.div.style.textAlign = 'center'
    self.div.style.margin = '100px'
    self.div.style.width = '100%'
    self.div.style.height = '100%'
    self.win.document.body.appendChild(self.div)

  //  self.win.document.html.style.backgroundColor = 'black'
    self.win.document.body.style.backgroundColor = 'black'
    self.win.document.body.style.color = 'white'
    // self.win.document.body.style.display = 'flex'
    // self.win.document.body.style.justifyContent = 'center'
    // self.win.document.body.style.alignItems = 'center'

      self.video = self.win.document.createElement('video')
      self.video.autoplay = true
      self.video.setAttribute('controls', false)
      self.video.setAttribute('allowFullScreen', true)
      self.video.style.width = "100%"
      self.video.style.height = "100%"
      self.video.volume = 0
      //self.video.style.objectFit = "fill"
      self.win.document.body.style.padding = "0px"
      self.win.document.body.style.margin = "0px"
      self.win.document.body.appendChild(self.video)

      window.vid = self.video

      console.log('loaded video', self.video, self.video.videoWidth)


  //  }

    self.win.document.body.onclick = function () {
      console.log('click!')
      self.win.document.body.removeChild(self.div)
      self.setStream(self.stream)
    }
    self.win.document.body.onkeydown = function(){
      //console.log("key")
      if(!self.fullscreen) {
        self.video.webkitRequestFullScreen()
        self.fullscreen = true
      } else {
        self.video.webkitExitFullScreen()
        self.fullscreen = false
      }
    }

    self.setTitle(self.title)
    self.setOpacity(self.opacity)
    self.setStream(self.stream)
  }, 100)
    //console.log('track is', this.track)
  }

  update(opts) {

    // how to improve this part?
    if (!this.stream) this.stream = null
    if (this.stream === null) this.stream = {id :null}
    if (!opts.stream) opts.stream = null
    if (opts.stream === null) opts.stream = {id :null}

    console.log('UPDATE', opts, this.stream.id, opts.stream.id)

    if (opts.isOpen !== this.isOpen) {
      if(opts.isOpen === true) {
        this.open()
      } else {
        this.close()
      }
      this.isOpen = opts.isOpen
    }

    if (opts.stream.streamId !== this.stream.streamId) {
        if(this.isOpen) this.setStream(opts.stream)
        this.stream = opts.stream
    }

    if (opts.title !== this.title) {
        if(this.isOpen) this.setTitle(opts.title)
        this.title = opts.title
    }

    if (opts.opacity !== this.opacity) {
      if(this.isOpen) this.setOpacity(opts.opacity)
      this.opacity = opts.opacity
    }
  }

  setOpacity(opacity) {
    console.log("setting opactity", opacity)
    this.video.style.opacity = parseFloat(opacity)/100
  }
  setStream(stream) {
   //this.win.document.body.click()
    if (stream && stream !== null) {
      if (stream.id === null) {
        this.video.srcObject = null
      } else {
        // var tracks = []
        // tracks.push(track.track)
        // var stream = new MediaStream(tracks) // stream must be initialized with array of tracks, even though documentation says otherwise
        // console.log('!! setting track ', track)
        this.video.srcObject = stream.stream
      }
    //  this.win.document.title = track.id
    } else {
      // to do: remove track
    }
  }

  // to do
  setTitle(title) {
    console.log('set title')
    this.win.document.title = title
  }

  remove() {
    this.close()
  }

  close() {
    if(this.win) if(!this.win.closed) this.win.close()
  }
}


module.exports = Window
