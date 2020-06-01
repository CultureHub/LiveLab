var html = require('choo/html')
var Component = require('choo/component')
const input = require('./components/input.js')
// var AudioContext = window.AudioContext || window.webkitAudioContext;


module.exports = class Audio extends Component {
  constructor (id, state, emit) {
    super(id)
    // this.ctx = new AudioContext()
    this.streams = {}
    this.defaultGain = 1
    this.masterGain = 1

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
      } else {
        console.log('updated stream', streams.filter((stream) => stream.stream.id === id))
        this.streams[id].stream = streams.filter((stream) => stream.stream.id === id)[0]
      }
    })
    console.log('UPDATE', this.streams)
    this.rerender()
    return false
  }

  removeStreamSource(streamObj) {
    document.body.removeChild(streamObj.el)
    delete this.streams[streamObj.id]
    // streamObj.gain.disconnect()
    // streamObj.src.disconnect()
  }

  updateStreamVolumes() {
    Object.entries(this.streams).forEach(([id, streamObj]) => {
      streamObj.el.volume = streamObj.streamGain * this.masterGain
    })
  }

  addStreamSource (stream) {
    // const gain = this.ctx.createGain()
    // const src = this.ctx.createMediaStreamSource(stream.stream)

    var audio = document.createElement('audio')
    audio.autoplay = true
    // var tracks = []
    // tracks.push(track)
    // var stream = new MediaStream(tracks) // stream must be initialized with array of tracks, even though documentation says otherwise
    audio.srcObject = stream.stream
  //  console.log("setting volume", volume)
  //  audio.volume = volume
    audio.volume = this.defaultGain * this.masterGain
    document.body.appendChild(audio)
  //  return audio

  //  src.connect(gain)
    // gain.connect(this.masterGain)
    // gain.gain.value = this.defaultGain
    const streamObj = {
      id: stream.stream.id,
        // gain: gain,
        // src: src,
      streamGain: this.defaultGain,
      el: audio,
      stream: stream
    }
    this.streams[streamObj.id] = streamObj

    return streamObj
  }
  // <i class="fas ${muted? fa-microphone-slash red':'fa-microphone'}"></i>

  createElement(streams) {
    console.log('STREAM rendering', streams)
    // const slider = ({ label, value, oninput, labelClass="", inputClass="", description="", muted=null}) => {
    //   console.log('MUTE', muted)
    //   return html`<div class="db pv2" title=${description}>
    //       <div class="dib w3 v-mid ${labelClass}" title=${description}>${label}</div>
    //       ${muted==null?'': html`<i class="fas mr1 ${muted ? 'fa-microphone-slash red':'fa-microphone'}"></i>`}
    //       <input class="v-mid w3 ${inputClass}" type="range" title=${description} min="0" max="100" value="${value}" step="1" oninput=${oninput}>
    //       <i class="fas fa-volume-up"></i>
    //     </div>
    //   `
    // }

    const slider = ({ label, value, oninput, onmute, description="", muted=null}) => {
      // ${muted==null?'': html`<i class="fas mr1 ${muted ? 'fa-microphone-slash red':'fa-microphone'}"></i>`}
      return html`<div class="db pv0 flex items-center" title=${description}>
          <div class="dib w4 v-mid pa1 " title=${description}>${label}  </div>
          <div class="pa2" style="flex:1"><input type="range" class="w-100" title=${description} min="0" max="100" value="${value}" step="1" oninput=${oninput}></div>
          <i class="pa2 pointer fas ${value==0 ?'fa-volume-mute':'fa-volume-up'}" onclick=${onmute}></i>
        </div>
      `
    }

    return html`<div>
      <div class="pb2" title="master volume">
        ${slider({
          description: "master output volume",
          label: "output volume",
          value: this.masterGain*100,
          oninput: (e) => {
            this.masterGain = e.target.value/100
            this.updateStreamVolumes()
            this.rerender()
          },
          onmute: () => {
            console.log('calling ')
            this.masterGain = this.masterGain === 0 ? 1 : 0
            console.log('gain', this.masterGain)
            this.updateStreamVolumes()
            this.rerender()
          }
          // labelClass: "w4",
          // inputClass: "w5"
        })}
      </div>
      <!-- <div class="pt0">
        ${slider({
          description: "default volume for new streams",
          label: "default volume when new user joins",
          // labelClass: "w-100 db",
          // inputClass: "w5",
          value: this.defaultGain*100,
          oninput: (e) => {
            this.defaultGain = e.target.value/100
            this.rerender()
          }
        })}
      </div> -->
      ${Object.entries(this.streams).length > 0 ? html`<div class="pv1">
        ${Object.entries(this.streams).map(([id, streamObj]) => slider({
          description: "volume control for individual streams",
          label: streamObj.stream.peer.nickname,
          value: streamObj.streamGain*100,
          muted: streamObj.stream.isAudioMuted,
          oninput: (e) => {
            streamObj.streamGain = e.target.value/100
            streamObj.el.volume = streamObj.streamGain * this.masterGain
            this.rerender()
          },
          onmute: () => {
            streamObj.streamGain = streamObj.streamGain === 0 ? 1 : 0
            streamObj.el.volume = streamObj.streamGain * this.masterGain
            this.rerender()
          }
        }))}
      </div>`: ''}
    </div>`
  }
}
