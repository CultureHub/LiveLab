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
  //  console.log('new streams', streams, this.streams, Date.now())

    // Find new streams that have been added
    const newIds = streams.map((stream) => {
     if(!(stream.stream.id in this.streams)) {
       if(!stream.isLocal) {
         if(stream.settings && stream.settings.audio) {
        //   console.log('adding stream', stream, Date.now())
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
    // onmute event never calles
    // Object.entries(this.streams).forEach(([id, stream]) => {
    //   const tracks =  stream.stream.stream.getAudioTracks()
    //   tracks.forEach((track) => track.onmute = (e)=> {
    //     console.log('TRACK WAS MUTES')
    //   })
    // })

    return streamObj
  }

  createElement(streams) {
  //  console.log('RENDERING', this)
  //  Object.entries(this.streams).forEach(([id, stream]) => console.log('TRACKS', stream.stream.stream.getAudioTracks()))
    // console.log(streams)
    //
    // // @todo: dont use local streams
    // streams.forEach((stream) => {
    //   this.addStreamSource(stream)
    // })

    // const section = (content, classes="") => html`<div class="${classes}">${content}</div>`

    const slider = ({ label, value, oninput, labelClass="", inputClass="", description=""}) => html`<div class="db pv2" title=${description}>
          <div class="dib w3 v-mid ${labelClass}" title=${description}>${label}</div>
          <input class="v-mid ${inputClass}" type="range" title=${description} min="0" max="100" value="${value}" step="1" oninput=${oninput}>
        </div>
      `

    return html`<div>
      <div class="pb2" title="master volume">
        ${slider({
          description: "master volume",
          label: "master volume",
          value: this.masterGain.gain.value*100,
          oninput: (e) => { this.masterGain.gain.value = e.target.value/100},
          labelClass: "b w4",
          inputClass: "w5"
        })}
      </div>
      ${Object.entries(this.streams).length > 0 ? html`<div class="pv1">
        ${Object.entries(this.streams).map(([id, streamObj]) => slider({
          description: "volume control for individual streams",
          label: streamObj.stream.peer.nickname,
          value: streamObj.gain.gain.value*100,
          oninput: (e) => { streamObj.gain.gain.value = e.target.value/100}
        }))}
      </div>`: ''}
      <div class="pt0">
        ${slider({
          description: "default volume when a new stream is added",
          label: "default",
          labelClass: "i",
          value: this.defaultVolume*100,
          oninput: (e) => {
            this.defaultVolume = e.target.value/100
            this.rerender()
          }
        })}
      </div>
    </div>`
  }
}
