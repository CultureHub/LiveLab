'use strict'

const html = require('choo/html')

module.exports = bandWidthView

//display "Bandwidth Adjustment"
function bandWidthView(state,emit) {
  return html `
       <script>var bv = document.getElementById("bwSelect")</script>
       <div class="pa3 dib" style="width:100%">
       <p id="bitrate">Current Local Bitrate: </p>
       <label>Bandwidth:
       <select id="bwSelect">
         <option value="original">original bandwidth</option>
         <option value="2000">2000</option>
         <option value="1000">1000</option>
         <option value="500">500</option>
         <option value="250">250</option>
         <option value="125">125</option>
     </select>
          kps
         </label>
       <button onclick=${() => {console.log(bv.options[bv.selectedIndex].value)}}>confirm</button>
       </div>`

}

