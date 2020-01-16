const html = require('choo/html')

function showControlHeader ({
  title, subtitle, showAddButton
}, emit) {
  var addButton = null
  if (showAddButton === true) {
    addButton = html`
      <i
        style="margin-left:3px"
        class="fas fa-plus-circle dim pointer"
        onclick=${() => emit('show:addDisplay')}
        title="add new display"
      >
      </i>
    `
  }
  return html`
    <div class="header">
      <div class="col-sticky">
        <div class="header-text">
          <span>${title}</span>
          ${addButton}
        </div>
      </div>
      <div class="col-scrollable">
        <div class="header-text">
          ${subtitle}
        </div>
      </div>
    </div>
  `
}

module.exports = showControlHeader
