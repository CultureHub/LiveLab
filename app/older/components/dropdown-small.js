const Nano = require('nanocomponent')
const css = require('sheetify')
const html = require('choo/html')
const xtend = require('xtend')
const shallowEqual = require('juliangruber-shallow-equal/objects')

module.exports = DropdownSmall
/* using microcomponent in order to create an element that keeps track of
its own state. custom dropdown based on:
https://tympanus.net/codrops/2012/10/04/custom-drop-down-list-styling/
 */

function DropdownSmall() {
  if (!(this instanceof DropdownSmall)) return new DropdownSmall()
  this.state = {
    active: false
  }
  this.props = {}
  Nano.call(this)
}

DropdownSmall.prototype = Object.create(Nano.prototype)

DropdownSmall.prototype.createElement = function (props) {
  this.props = props
  const style = css `
 :host {
  /* Size and position */
  position: relative; /* Enable absolute positioning for children and pseudo elements */
  width: 8rem;
  padding: 0.4rem;
  margin: 0;
  /*
  margin-top: 10px;
  margin-bottom: 10px;
  */

  /*margin: 0 auto;*/

  /* Styles */
  color: #fff;*/
  outline: none;
  cursor: pointer;

  /* Font settings */
  border: 1px dashed #FFFFFF;
  box-sizing: border-box;

 }

 :host:after {
  content: "";
  width: 0;
  height: 0;
  position: absolute;
  right: 16px;
  top: 50%;
  margin-top: -6px;
  border-width: 4px 0 4px 4px;
  border-style: solid;
  border-color: transparent #fff;
 }

 :host .dropdownSmall {
  /* Size & position */
  position: absolute;
  top: 100%;
  left: 0; /* Size */
  right: 0; /* Size */
  margin: 0px;
  padding: 0px;
  /* Styles */
  background: #fff;
  font-weight: normal; /* Overwrites previous font-weight: bold; */

  /* Hiding */
  opacity: 0;
  pointer-events: none;
  z-index: 100
 }

 :host .dropdownSmall li {
  list-style-type: none;
  display: block;
  text-decoration: none;
  color: #9e9e9e;
  padding: 10px 20px;

 }

  /* Hover state */
  :host .dropdownSmall li:hover {
      background: #f3f8f8;
  }

  :host.active .dropdownSmall {
    opacity: 1;
    pointer-events: auto;
  }

  :host.active:after {
      border-color: #9bc7de transparent;
      border-width: 4px 4px 0 4px ;
      margin-top: -3px;
  }

  :host.active {
    background: #555555;
    background: linear-gradient(to right, #9bc7de 0%, #9bc7de 78%, #ffffff 78%, #ffffff 100%);
  }

 `

  var {
    onchange,
    value,
    options
  } = this.props
  // console.log("rendering ", this.state.active)

  // var activeStyles = ""
  var tachyonsStyles = ' bg-mid-gray font-Inter f5 b fl fs-normal lh-title br3'
  if (this.props.style) tachyonsStyles = this.props.style

  return html `
    <div>
      <div class=${style + tachyonsStyles +(this.state.active===true ? ' active': '')} tabindex="0" onclick=${this.toggleActive.bind(this)} onblur=${this.deactivate.bind(this)}>
      <span class="pl3">${value}</span>

      <ul class="dropdownSmall">
          ${options.map((item)=>
             html`<li data-value=${item.value} onclick=${this.handleclick.bind(this)} >${item.label}</li>`
          )}

        </ul>

     </div>
     </div>`

}



DropdownSmall.prototype.handleclick = function (e) {
  //console.log(e)

  this.props.onchange(e.target.dataset.value)
}

DropdownSmall.prototype.toggleActive = function () {
  this.state.active = !this.state.active
  this.state.needsUpdate = true
  this.render(this.props)
}

DropdownSmall.prototype.deactivate = function () {
  this.state.active = false
  this.state.needsUpdate = true
  this.render(this.props)
}

DropdownSmall.prototype.update = function (props) {

  return !shallowEqual(props, this.props) || this.state.needsUpdate

}
