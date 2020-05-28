const html = require('choo/html')

const dropdown = (options, selected) => {
  console.log('DROPDOWN', options, selected, options[2].value == selected)
return html`
  ${options.map((opt) => html`
    <option class="dark-gray" value=${opt.value} ${opt.value == selected? 'selected':''}>${opt.label}</option>
  `)}
`
}

module.exports = (state, emit) => {
  let opts = [0, 1, 2, 3, 4].map((num) => ({ label: num, value: num }))
  return html`<div class="mw6 ttu">
    Number of switchers:
    <select class="w-100 pa2 white ttu ba b--white pointer" style="background:none" onchange=${(e)=>{
      state.layout.settings.numberOfSwitchers = e.target.value
      emit('render')
    }}>
      ${dropdown(opts, state.layout.settings.numberOfSwitchers)}
    </select>
  </div>`
}
