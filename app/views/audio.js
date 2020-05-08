var html = require('choo/html')
var Component = require('choo/component')
const input = require('./components/input.js')
var AudioContext = window.AudioContext || window.webkitAudioContext;


module.exports = class Audio extends Component {
  constructor (id, state, emit) {
    super(id)
    this.ctx = new AudioContext()
    this.streams = {}
    this.defaultVolume = 1
    this.masterGain = this.ctx.createGain()
    this.masterGain.connect(this.ctx.destination)

    // explicitly listen to update because not always called
    state.multiPeer.on('update', () => {
      console.log('MULTIPEER UPDATE RECEIVED', Date.now())
      this.update(state.multiPeer.streams)
    })
    //console.log('audio init', streams, emit)
  }

  update(streams) {
    console.log('new streams', streams, this.streams, Date.now())

    // Find new streams that have been added
    const newIds = streams.map((stream) => {
     if(!(stream.stream.id in this.streams)) {
       if(!stream.isLocal) {
         if(stream.settings.audio) {
           console.log('adding stream', stream, Date.now())
           const newStream = this.addStreamSource(stream)
         }
       }
    }
      return stream.stream.id
    })

    // Remove streams that have been removed
    Object.keys(this.streams).forEach((id) => {
    //  console.log('checking', newIds, id, newIds.indexOf(id))
      if(newIds.indexOf(id) < 0) {
      //  console.log('NO MORE ', id)
        this.removeStreamSource(this.streams[id])
      }
    })

    this.rerender()
    return false
  }

  removeStreamSource(streamObj) {
    delete this.streams[streamObj.id]
    streamObj.gain.disconnect()
    streamObj.src.disconnect()
  }

  addStreamSource (stream) {
    const gain = this.ctx.createGain()
    const src = this.ctx.createMediaStreamSource(stream.stream)
    src.connect(gain)
    gain.connect(this.masterGain)
    gain.gain.value = this.defaultVolume
    const streamObj = {
      id: stream.stream.id,
      gain: gain,
      src: src,
      stream: stream
    }
    this.streams[streamObj.id] = streamObj
    return streamObj
  }

  createElement(streams) {
    console.log('RENDERING')
    // console.log(streams)
    //
    // // @todo: dont use local streams
    // streams.forEach((stream) => {
    //   this.addStreamSource(stream)
    // })



    return html`<div>
      <div class ="db ma1">
        <div class="dib w3 v-mid b"> master </div>
        <input class="v-mid" type="range" min="0" max="1" value=${this.masterGain.gain.value}  step="0.01" oninput=${(e) => { this.masterGain.gain.value = e.target.value}}>
      </div>
      ${Object.entries(this.streams).map(([id, streamObj]) => {
        return html`
          <div class ="db ma1">
            <div class="dib w3 v-mid">${streamObj.stream.peer.nickname}</div>
             <input class="v-mid" type="range" min="0" max="1" value=${streamObj.gain.gain.value}  step="0.01"
             oninput=${(e) => {
               console.log(streamObj.gain)
               streamObj.gain.gain.value = e.target.value
             }}
             >
          </div>`
        })}
        <div class ="db mt4 bt">
          <div class="db i v-mid">default for new streams</div>
          <input class="v-mid" type="range" min="0" max="1" value=${this.defaultVolume}  step="0.01" oninput=${(e) => { this.defaultVolume = e.target.value}}>
        </div>
    </div>`
  }
}
