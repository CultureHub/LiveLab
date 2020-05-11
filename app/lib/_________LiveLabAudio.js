class LiveLabAudio {
  constructor() {

  }

  addTrack(track, volume, deviceId){
    console.log('adding track', track)
    var audio = document.createElement('audio')
    audio.autoplay = true
    var tracks = []
    tracks.push(track)
    var stream = new MediaStream(tracks) // stream must be initialized with array of tracks, even though documentation says otherwise
    audio.srcObject = stream
    console.log("setting volume", volume)
    audio.volume = volume
    document.body.appendChild(audio)
    return audio
  }
}

module.exports = LiveLabAudio
