'use strict'

const html = require('choo/html')
const mediaList = require('./mediaList.js')

module.exports = testView

function testView (state, emit) {

    return html`
    <div>
      ${mediaList(state, emit)}
    </div>
    `
  
}
