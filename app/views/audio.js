var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Audio extends Component {
  constructor (id, state, emit) {
    super(id)
    this.streams = {}
    this.defaultGain = 1
    this.masterGain = 1

    // explicitly listen to update because not always called
    state.multiPeer.on('update', () => {
      this.update(state.multiPeer.streams)
    })
  }

  update (streams) {
    // Find new streams that have been added
    const newIds = streams.map(stream => {
      if (!(stream.stream.id in this.streams)) {
        if (!stream.isLocal) {
          if (stream.settings && stream.settings.audio) {
            this.addStreamSource(stream)
          }
        }
      }
      return stream.stream.id
    })

    // Remove streams that have been removed
    Object.keys(this.streams).forEach(id => {
      if (newIds.indexOf(id) < 0) {
        this.removeStreamSource(this.streams[id])
      } else {
        this.streams[id].stream = streams.filter(
          stream => stream.stream.id === id
        )[0]
      }
    })
    this.rerender()
    return false
  }

  removeStreamSource (streamObj) {
    document.body.removeChild(streamObj.el)
    delete this.streams[streamObj.id]
  }

  updateStreamVolumes () {
    Object.entries(this.streams).forEach(([id, streamObj]) => {
      streamObj.el.volume = streamObj.streamGain * this.masterGain
    })
  }

  addStreamSource (stream) {
    var audio = document.createElement('audio')
    audio.autoplay = true
    audio.srcObject = stream.stream
    audio.volume = this.defaultGain * this.masterGain
    document.body.appendChild(audio)
    const streamObj = {
      id: stream.stream.id,
      streamGain: this.defaultGain,
      el: audio,
      stream: stream
    }
    this.streams[streamObj.id] = streamObj

    return streamObj
  }

  createElement (streams) {
    const slider = (
      { label, value, oninput, onmute, description = '', muted = null }
    ) => {
      return html`<div class="db pv0 flex items-center" title=${description}>
          <div class="dib w4 v-mid mr2" title=${description}>${label}  </div>
          <div class="pa2" style="flex:1"><input type="range" class="w-100 v-mid slider" title=${description} min="0" max="100" value="${value}" step="1" oninput=${oninput}></div>
          <i class="pa2 pointer fas ${value === 0
          ? 'fa-volume-mute'
          : 'fa-volume-up'}" onclick=${onmute}></i>
        </div>
      `
    }

    return html`<div class="ttl">
      <div class="pb2" title="master volume">
        ${slider({
          description: 'master output volume',
          label: 'Output volume',
          value: this.masterGain * 100,
          oninput: e => {
            this.masterGain = e.target.value / 100
            this.updateStreamVolumes()
            this.rerender()
          },
          onmute: () => {
            this.masterGain = this.masterGain === 0 ? 1 : 0
            this.updateStreamVolumes()
            this.rerender()
          }
        })}
      </div>
      ${Object.entries(this.streams).length > 0 ? html`<div class="pv1">
        ${Object.entries(this.streams).map(
        ([id, streamObj]) => slider({
          description: 'volume control for individual streams',
          label: streamObj.stream.peer.nickname,
          value: streamObj.streamGain * 100,
          muted: streamObj.stream.isAudioMuted,
          oninput: e => {
            streamObj.streamGain = e.target.value / 100
            streamObj.el.volume = streamObj.streamGain * this.masterGain
            this.rerender()
          },
          onmute: () => {
            streamObj.streamGain = streamObj.streamGain === 0 ? 1 : 0
            streamObj.el.volume = streamObj.streamGain * this.masterGain
            this.rerender()
          }
        })
      )}
      </div>` : ''}
    </div>`
  }
}
