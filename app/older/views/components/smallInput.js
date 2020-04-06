'use strict'

const html = require('choo/html')
const xtend = require('xtend')

module.exports = inputElement

// reusable input element
function inputElement (name, defaultText, opts) {
  if (!opts) opts = {}

  var defaultProps = {
    type: 'text',
    name: name,
    placeholder: defaultText
  }

  var inputProps = xtend(defaultProps, opts)
  var defaultClass = 'pa2 input-reset ba bg-dark-gray hover-bg-black near-white w3'
  inputProps.class = defaultClass + ' ' + inputProps.class

  return html`<div class="m3">
    <div class="fw6 lh-copy f6 mr2 dib" for=${name}>${name}:</div>
    <input ${inputProps}>
  </div>`
}
