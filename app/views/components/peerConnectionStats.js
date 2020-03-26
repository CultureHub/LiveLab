// component that receives a peer opject and renders stats related to that peer. The data structure for the pper object is defined in /models/peersModel.js
// Uses https://github.com/choojs/choo#components to create a component with a self-contained state

// questions -- what other information is useful from these reports?
// How to correlate the information contained in these reports to the tracks or streams that they apply to?
// Does trackIdentifier correspond to trackId?
// @todo: clear interval when element is unloaded

var html = require('choo/html')
var Component = require('choo/component')


module.exports = class PeerConnectionStats extends Component {
  constructor (peerId, emit) {
  //  console.log('constructiong', peerId, emit)
    super(peerId)
  }

  // called whenever application state is changed. Returning false means that createElement will not be called again
  update (peer) {
    this.nameEl.innerHTML = peer.nickname // directly mutate properties rather than re-rendering element
    if(!this.pc && peer.pc) {
      this.pc = peer.pc
      this.startMonitoring(peer.pc)
    }
    return false // do not rerender
  }

  createElement (peer) {
    this.nameEl = html`<span>${peer.nickname}</span>`
    this.bitrateEl = html`<span></span>`
     if(peer.pc) {
       this.pc = peer.pc
       this.startMonitoring(peer.pc)
     }
    return html`<div>${this.nameEl}: ${this.bitrateEl}</div>`
  }

  // start monitoring peer connection stats
  startMonitoring (pc) {
    var senders = pc.getSenders()
    var self = this
    this.bytesSent = 0
    this.packetsSent = 0
    this.reportTime = 0
    this.interval = setInterval(function () {
     var bytesSent = 0
     var packetsSent = 0
     var reportTime = 0
     // for each track sent, add bytes and packets that have been updated
     var promises = senders.map((sender) => {
        return sender.getStats().then((res) => {
            res.forEach(report => {
              if (report.type === 'outbound-rtp') {
              //  console.log(report)
                if (report.isRemote) {
                  return;
                }
                reportTime = report.timestamp; // does each sender have a different timestamp?
                bytesSent += report.bytesSent;
                packetsSent += report.packetsSent;
              }
            })
       })
     })

       Promise.all(promises).then(() => {
        const bitRate = (8 * (bytesSent - self.bytesSent))/(reportTime - self.reportTime)
        self.bitrateEl.innerHTML = bitRate

        // update information
        self.bytesSent = bytesSent
        self.packetsSent = packetsSent
        self.reportTime = reportTime
       });
    }, 1000)
  }
}
