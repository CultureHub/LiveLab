const html = require('choo/html')

let dropdownOptions = (options, selected) => {
  return html `
  ${options.map(
    opt => html`
    <option class="dark-gray" value=${opt.value} ${opt.value == selected
      ? 'selected'
      : ''}>${opt.label}</option>
  `
  )}
`
}

module.exports = (state, emit) => {
  const settings = state.layout.settings

  const settingItem = (labelEl, itemEl) => html `
  <div class="flex w-100 mv2 justify-between items-center">
    <div class="w5">${labelEl}</div>
   <div class="w4 tr">${itemEl}</div>
    </div
  `
  const toggle = (label, setting) => settingItem(
    label,
    html `
    <input type="checkbox" class="mv2" checked=${settings[setting]} onchange=${e => {
      state.layout.settings[setting] = e.target.checked
      emit('render')
    }} />`
  )

  const dropdown = ({
    onChange,
    label,
    value,
    opts
  }, setting) => settingItem(
    label,
    html `
      <select class="w-100 pa2 ttu ba b--white pointer" style="background:none;color:${state.style.colors.text1};border:solid 1px ${state.style.colors.text1}" onchange=${onChange}>
        ${dropdownOptions(opts, value)}
      </select>
  `
  )

  const opts = [0, 1, 2, 3, 4].map(num => ({
    label: num,
    value: num
  }))
  return html `<div class="mw6 ttl">
      ${dropdown({
        label: 'Number of output switchers',
        value: state.layout.settings.numberOfSwitchers,
        opts: opts,
        onChange: e => {
          
          // state.layout.settings.numberOfSwitchers = e.target.value
          // emit('render')
          emit('layout:setSettings', 'numberOfSwitchers', e.target.value);
          //console.log("After// e value: " + e.target.value + " #ofswtichers: " + state.layout.settings.numberOfSwitchers)
        }
      }, 'numberOfSwitchers')}
      ${toggle('Stretch to fit', 'stretchToFit')}
      ${toggle('Column layout', 'columnLayout')}
  </div>`
}