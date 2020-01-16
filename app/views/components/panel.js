'use strict'

const html = require('choo/html')
const xtend = require('xtend')
const assert = require('assert')

module.exports = Panel

// reusable panel element
// {
//   content: DOMobject // html object w/content,
//   htmlProps: object containing htmlprops,
//   closable: Boolean // whether has a close button
//   onClose: // (optional) what to do when closed
// }

function Panel (opts) {
  assert.equal(typeof opts, 'object', 'Panel: opts should be of type object')

  var defaultProps = {

  }

  var inputProps = xtend(defaultProps, opts.htmlProps)
  var defaultClass = 'bg-dark-gray ba bw1 b--gray dib'
  inputProps.class = defaultClass + ' ' + inputProps.class

    // to do: utf-8 special character is not working, ideally would be &times; for close button
    return html`
          <div ${inputProps}>
            <div class="bg-gray pa2">
              ${opts.closable ===true ? html`<span class="fr f4 fw4 pointer" onclick=${opts.onClose}> x </span>` : null }
              <h3 class="f6 fw4 pa0 ma0"> ${opts.header} </h3>
            </div>
            ${opts.contents}
          </div>
    `

}
