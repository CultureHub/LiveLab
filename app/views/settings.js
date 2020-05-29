const html = require('choo/html')

const dropdown = (options, selected) => {
  console.log('DROPDOWN', options, selected, options[2].value == selected)
return html`
  ${options.map((opt) => html`
    <option class="dark-gray" value=${opt.value} ${opt.value == selected? 'selected':''}>${opt.label}</option>
  `)}
`
}

    // ${toggle('show communication info', 'showCommunicationInfo')}

module.exports = (state, emit) => {
  const settings = state.layout.settings
  const toggle = (label, setting) => html`
  <div class="flex w-100 mv2 justify-between">
    <div class="">${label}</div>
    <input type="checkbox" checked=${settings[setting]} onchange=${(e) => {
      state.layout.settings[setting] = e.target.checked
      emit('render')
    }} />
    </div
  `

  let opts = [0, 1, 2, 3, 4].map((num) => ({ label: num, value: num }))
  return html`<div class="mw6 ttu">
    Number of output switchers:
    <select class="w-100 pa2 white ttu ba b--white pointer mv2" style="background:none" onchange=${(e)=>{
      state.layout.settings.numberOfSwitchers = e.target.value
      emit('render')
    }}>
      ${dropdown(opts, settings.numberOfSwitchers)}
      </select>

      ${toggle('stretch to fit', 'stretchToFit')}
  </div>`
}
