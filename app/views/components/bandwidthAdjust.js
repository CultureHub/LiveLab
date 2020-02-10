'use strict'

const html = require('choo/html')
const PeerConnectionStats = require('./peerConnectionStats.js')

module.exports = bandWidthView

var p

//display "Bandwidth Adjustment"
function bandWidthView(state,emit) {
  return html `
       <script>var bv = document.getElementById("bwSelect")</script>
       <div class="pa3 dib" style="width:100%">
       <p id="bitrate">Current Local Bitrate: </p>
       <!-- <label>Bandwidth:
       <select id="bwSelect">
         <option value="original">original bandwidth</option>
         <option value="2000">2000</option>
         <option value="1000">1000</option>
         <option value="500">500</option>
         <option value="250">250</option>
         <option value="125">125</option>
     </select>
          kps
         </label> -->
       <!-- <button onclick=${() => {console.log(bv.options[bv.selectedIndex].value)}}>confirm</button> -->
       ${// Use caching to insure that new DOM elements are not created. more about caching components: https://github.com/choojs/choo#caching-components
         Object.values(state.peers.byId).filter((peer) => peer.pc).map((peer) =>  state.cache(PeerConnectionStats, peer.peerId).render(peer))
       }
       </div>`

}
