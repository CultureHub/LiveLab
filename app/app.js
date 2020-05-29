/* global nw */
var devtools = require('choo-devtools')
const choo = require('choo')

const app = choo({hash: true})

//localStorage.setItem('logLevel', 'warn')
//localStorage.setItem('debug', null)
//localStorage.setItem('debug', 'simple-peer')
if (process.env.NODE_ENV !== 'production') {
  app.use(devtools())
}

localStorage.setItem('logLevel', 'debug')

window.grid = require('./views/videogrid.js')

// console.log("type", typeof nw)
if(typeof nw === 'object'){
  const WIN_WIDTH = 1280
  const WIN_HEIGHT = 720
  // if in dev mode, show logging in console and expose global app object
  // if (process.env.NODE_ENV === 'development') {
  // calculate screen dimensions to center window
  nw.Screen.Init()
  console.log('screens', nw.Screen.screens)

  var screenPos = nw.Screen.screens[0].work_area

  var winX = screenPos.x + (screenPos.width - WIN_WIDTH) / 2
  var winY = screenPos.y + (screenPos.height - WIN_HEIGHT) / 2

  var win = nw.Window.get()
  win.width = WIN_WIDTH
  win.height = WIN_HEIGHT
  // console.log(win)
  win.x = Math.floor(winX)
  win.y = Math.floor(winY)

  // var screenCB = {
  //   onDisplayBoundsChanged: function(screen) {
  //     console.log('displayBoundsChanged', screen);
  //   },
  //
  //   onDisplayAdded: function(screen) {
  //     console.log('displayAdded', screen);
  //   },
  //
  //   onDisplayRemoved: function(screen) {
  //     console.log('displayRemoved', screen)
  //   }
  // }
  //
  // // listen to screen events
  // nw.Screen.on('displayBoundsChanged', screenCB.onDisplayBoundsChanged)
  // nw.Screen.on('displayAdded', screenCB.onDisplayAdded)
  // nw.Screen.on('displayRemoved', screenCB.onDisplayRemoved)
}

// app.use(require('./models/devicesModel.js'))
app.use(require('./stores/userStore.js'))
app.use(require('./stores/layoutStore.js'))

// app.use(require('./stores/mediaStore.js'))
//app.use(require('./stores/peerStore.js'))
// app.use(require('./stores/uiModel.js'))
// app.use(require('./models/oscModel.js'))
// app.use(require('./models/showModel.js'))


// Routing
// base URL is different for nw.js, gh-pages, and local versions
// @todo: how to make this more concise / not repeat routes?

app.route('/', require('./views/main.js'))
//


// app.route('#sendOnly', require('./views/sendOnly/landing.js'))
// app.route('#sendonly', require('./views/sendOnly/landing.js'))

// routes for nw.js
app.route('/public/index.html', require('./views/main.js'))

// routes for github pages, starting with /LiveLab
app.route('/LiveLab', require('./views/main.js'))
// app.route('/LiveLab#sendonly', require('./views/sendOnly/landing.js'))
// app.route('/LiveLab/sendonly', require('./views/sendOnly/landing.js'))



app.mount('body div')
