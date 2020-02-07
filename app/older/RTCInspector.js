'use strict'

const html = require('choo/html')
const xtend = require('xtend')
var Nano = require('nanocomponent')

module.exports = RTCInspector

// Receives an RTCPeerConnection and deisplays stats
function RTCInspector (peer) {
  if (!(this instanceof RTCInspector)) return new RTCInspector()
  this.props = {
    htmlProps: {},
    pc: null,
    stats: "",
    isActive: true
  }
  this.active = true
  Nano.call(this)
}

RTCInspector.prototype = Object.create(Nano.prototype)

RTCInspector.prototype.createElement = function (props) {
  console.log('CREATING', props)
    this.props = props
    var defaultHtmlProps = {

    }
    var _htmlProps = xtend(defaultHtmlProps, this.props.htmlProps)

    var el = html`<div ${_htmlProps}></div>`
    if(props.pc) this.startMonitoring(props.pc)
    return el
}


// update stream if track id has changed
RTCInspector.prototype.update = function (props) {
  this.props.trackId = props.trackId
  this.props.pc = props.pc
  //console.log("INSPECT", props)
  //if(props.isActive !== this.props.isActive){
    //start or stop checking for stats
    if(props.pc && props.pc !== null) {
      if(this.active !== true) {

        this.startMonitoring(props.pc)
      }
    } else {
      if(this.active) {
        this.stopMonitoring()
      }
    }
    return false
  //}
}


RTCInspector.prototype.startMonitoring = function (pc) {
  this.stopMonitoring()
  //console.log("starting", this)
  this.active = true
  var el = this.element
  this.interval = setInterval(function(){

    this.props.pc.getStats(null).then(function(res) {
    //console.log("STATS", res)
  //    this.props.stats =
    //  el.innerHTML = JSON.stringify(res)
    console.log("STATS", res)
    // if(this.element){
    //   while (this.element.hasChildNodes()) this.element.removeChild(this.element.lastChild)
    // }
      var outputString = this.props.trackId + '\n'
      var statsObj
      res.forEach(function(report){
        if(report.type === 'ssrc') {
          if(report.googTrackId === this.props.trackId) {
          //  Object.keys(report).forEach((key)=>{console.log(key)})
            statsObj = html`<div>${Object.keys(report).map((key) => html`<p>${key} : ${report[key]}</p>`)}</div>`
          //  outputString += JSON.stringify(report)
          }
        }
      }.bind(this))
    //  this.element.innerHTML = outputString
  //  console.log("STATS OBJ", statsObj)
      this.element.appendChild(statsObj)
      //  console.log("got stats", res)
      }.bind(this))
  }.bind(this), 1000)
}

RTCInspector.prototype.stopMonitoring = function() {
  this.active = false
  if(this.element) {
    while (this.element.hasChildNodes()) this.element.removeChild(this.element.lastChild)
  }
  clearInterval(this.interval)
}
