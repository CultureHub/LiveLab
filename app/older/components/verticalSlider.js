'use strict'
const html = require('choo/html')

module.exports = verticalSlider

function verticalSlider ({min = 1, max = 100, value, onChange}) {
  return html`
      <div class="slider-container">
          <input
            type="range"
            orient="vertical"
            min="1"
            max="100"
            value=${value}
            class="slider"
            oninput=${onChange}>
      </div>
  `
}
