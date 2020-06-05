'use strict'

const html = require('choo/html')

module.exports = radioSelect


function radioSelect(opts) {
  return html `<div  class="mv3">
    <span> ${opts.label} </span>
    <div>${opts.options.map((opt)=>(
      html`<span ><input class="ml3 mr2" type="radio" checked=${opt.checked} onclick=${opts.onChange} value=${opt.value} name=${opt.name} /> ${opt.value}</span>`
    ))}</div>
  </div>`
}
