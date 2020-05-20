const Nano = require('nanocomponent')
const css = require('sheetify')
const html = require('choo/html')
const xtend = require('xtend')
const shallowEqual = require('juliangruber-shallow-equal/objects')

module.exports = Dropdown
/* using microcomponent in order to create an element that keeps track of
its own state. custom dropdown based on:
https://tympanus.net/codrops/2012/10/04/custom-drop-down-list-styling/
 */

function Dropdown () {
  if (!(this instanceof Dropdown)) return new Dropdown()
  this.state = {
    active: false
  }
  this.props = {}
  Nano.call(this)
}

Dropdown.prototype = Object.create(Nano.prototype)

Dropdown.prototype.createElement = function (props) {
  this.props = props
  const style = css`
 :host {
  /* Size and position */
  position: relative; /* Enable absolute positioning for children and pseudo elements */
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
  border: solid 2px;
  /*margin: 0 auto;*/

  /* Styles */
  /*background: #9bc7de;
  color: #fff;*/
  /* background: #555555; */
  background: none;
  outline: none;
  cursor: pointer;

  /* Font settings */
 /* font-weight: bold;*/
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

 :host .dropdown {
  /* Size & position */
  position: absolute;
  top: 100%;
  left: 0; /* Size */
  right: 0; /* Size */
  margin: 0px;
  padding: 0px;
  /* Styles */
  /* background: #fff; */
  background: none;
  font-weight: normal; /* Overwrites previous font-weight: bold; */

  /* Hiding */
  opacity: 0;
  pointer-events: none;
  z-index: 100
 }

 :host .dropdown li {
  list-style-type: none;
  display: block;
  text-decoration: none;
  /* color: #9e9e9e; */
  padding: 10px 20px;

 }

  /* Hover state */
  :host .dropdown li:hover {
      /* background: #f3f8f8; */
      background: rgba(255, 255, 255, 0.9)
  }

  :host.active .dropdown {
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

  var { onchange, value, options } = this.props
 // console.log("rendering ", this.state.active)

 // var activeStyles = ""
  var tachyonsStyles = ' bg-mid-gray f6 mw6 w-100'
if(this.props.style) tachyonsStyles = this.props.style

    return html`
    <div>
      <div class=${style + tachyonsStyles +(this.state.active===true ? ' active': '')} tabindex="0" onclick=${this.toggleActive.bind(this)} onblur=${this.deactivate.bind(this)}>
      <span>${value}</span>

      <ul class="dropdown">
          ${options.map((item)=>
             html`<li data-value=${item.value} onclick=${this.handleclick.bind(this)} >${item.label}</li>`
          )}

        </ul>

     </div>
     </div>`

}



Dropdown.prototype.handleclick = function (e){
  //console.log(e)

  this.props.onchange(e.target.dataset.value)
}

Dropdown.prototype.toggleActive = function (){
  this.state.active = !this.state.active
  this.state.needsUpdate = true
  this.render(this.props)
}

Dropdown.prototype.deactivate = function (){
  this.state.active = false
  this.state.needsUpdate = true
  this.render(this.props)
}

Dropdown.prototype.update = function (props) {

  return !shallowEqual(props, this.props) || this.state.needsUpdate

}
