const html = require('choo/html')

module.exports = (state, emit) => {
  return html`
  <div class="fixed top-0 right-0 pa4">

    <i
     class="fas fa-desktop dim pointer fr mr3"
     title="Share Screen"
     onclick= ${() => emit('user:shareScreen')}
     ></i>
     <i
      class="fas fa-th-large dim pointer fr mr3"
      title="Stretch To Fit"
      onclick= ${() => emit('user:shareScreen')}
      ></i>
  </div>
  `
}

// <i
//   style="margin-left:3px"
//   class="fas fa-plus-circle dim pointer fr"
//   onclick=${() => emit('devices:addNewMedia', true)}
//   title="Add Media Broadcast"
// >
// </i>
