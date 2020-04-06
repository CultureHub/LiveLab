'use strict'

const html = require('choo/html')
const xtend = require('xtend')
const radioSelect = require("./radioSelect.js")
const slider = require("./slider.js")

module.exports = settingsUI

// generate ui based on JSON object
function settingsUI (opts) {
  var uiArray = []
  for(var key in opts.settings){
    if(opts.settings[key] && opts.settings[key].type){
      var obj = opts.settings[key]
      if(obj.type==="boolean"){
        uiArray.push(createBooleanElement(key, obj, opts.onChange))
      } else if(obj.type === "range"){
        uiArray.push(
          slider(
            {
              label: key,
              onChange: handleSettingChange.bind(obj, opts.onChange),
              value: obj.value,
              min: obj.min,
              max: obj.max
            }
          )
        )
      }
    }
  }
  return html`<div>
    ${uiArray}
    </div>`
}

function handleSettingChange(callback, e){
  var update = {}
  var val = e.target.value
  //convert from string to bool if type = boolean
  if(this.type==="boolean"){
    val = (val === "true")
  } else if(this.type==="range"){
    val = parseFloat(val)
  }
  update[e.target.name] = {
    value: val
  }
  callback(update)
}

//to do: abstract into its own class that inherits from radio element
function createBooleanElement(label, obj, callback){
  return radioSelect({
    label: label,
    options:  [
          { name: label,
            checked: obj.value,
            value: "true" },
          { name: label,
            checked: !obj.value,
            value: "false" }
        ],
        onChange: handleSettingChange.bind(obj, callback)
  })
}
