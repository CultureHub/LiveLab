const html = require('choo/html')

const dropdown = (options, selected) => {
  console.log('DROPDOWN', options, selected, options[2].value == selected)
return html`
  ${options.map((opt) => html`
    <option class="dark-gray" value=${opt.value} ${opt.value == selected? 'selected':''}>${opt.label}</option>
  `)}
`
}

const toggle = (name, val, onChange) => html`
<div class="flex w-100 justify-between">
  <div class="">${name}</div>
  <input type="checkbox" checked=${val} onchange=${onChange} />
  </div
`

module.exports = (state, emit) => {
  const settings = state.layout.settings
  let opts = [0, 1, 2, 3, 4].map((num) => ({ label: num, value: num }))
  return html`<div class="mw6 ttu">
    Number of output switchers:
    <select class="w-100 pa2 white ttu ba b--white pointer" style="background:none" onchange=${(e)=>{
      state.layout.settings.numberOfSwitchers = e.target.value
      emit('render')
    }}>
      ${dropdown(opts, settings.numberOfSwitchers)}
      </select>
      ${toggle('show communication info', settings.showCommunicationInfo, (e) => {
         state.layout.settings.showCommunicationInfo = e.target.checked
         emit('render')
      })}
  </div>`
}
