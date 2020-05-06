const Video = require('./components_new/Video.js')
const html = require('choo/html')

const videoList = [
   "https://media.giphy.com/media/39GAXpLVKvYRO/giphy.mp4",
   "https://media.giphy.com/media/3o7ZerwmoQUdMdPE7S/giphy.mp4",
   "https://media.giphy.com/media/39GAXpLVKvYRO/giphy.mp4",
  "https://media.giphy.com/media/aCKMaeduKfFXG/giphy.mp4",
   "https://media.giphy.com/media/39GAXpLVKvYRO/giphy.mp4",
   "https://media.giphy.com/media/39GAXpLVKvYRO/giphy.mp4",
   "https://media.giphy.com/media/39GAXpLVKvYRO/giphy.mp4"
]

// "https://media.giphy.com/media/3oKIPga3j5mFzFpYic/giphy.mp4",
// "https://media.giphy.com/media/biKilc2r3kGOyXNiDq/giphy.mp4",
//function css(obj) => (Object.entries(obj).map(([key, value]) => )

const getGrid = (num, ratio, outerWidth, outerHeight) => {
  let w = 0
  let cols = 0
  // find number of columns that generates biggest size of rectangles
  new Array(num).fill().forEach((s, _c) => {
    let numCols = _c + 1
    let numRows = Math.ceil(num/numCols)
    let max_w = Math.min(outerWidth / numCols, outerHeight / numRows * ratio)
  //  console.log('trying', numCols, numRows, outerWidth / numCols, outerHeight / numRows * ratio)
    if (max_w >= w) {
      w = max_w
      cols = numCols
    }
  })

  return ({ width: w, height: w/ratio, cols: cols, rows: Math.ceil(num/cols), ratio: ratio })
}

const css = (el, style) => {
  Object.entries(style).forEach(([key, value]) => {
    el.style[key] = value
  })
  return el
}



module.exports = (state, emit) => {
  let num = state.layout.num
  let outerWidth = window.innerWidth
  let outerHeight = window.innerHeight
  let ratio = state.layout.select.ratio.value.split(':')
  let grid = getGrid(num, ratio[0]/ratio[1], outerWidth, outerHeight)

   const styleObj = ({width = grid.width, height = grid.height, marginX = 0, marginY = 0}) => (row, col) => ({
     top: `${marginY + row*height}px`,
     left: `${marginX + col*width}px`,
     width: `${width}px`,
     height: `${height}px`,
     textAlign: 'center',
     transition: 'all 0.3s',
     // resize: 'both',
     // overflow: 'auto'
   })

  // const styleObj =

//  const baseStyles = (row, col) => {width: grid.width, height: grid.height, marginX: 0, marginY: 0}
  const styleMargins = {marginX: (outerWidth - grid.cols*grid.width) / 2, marginY: (outerHeight  - grid.rows*grid.height) / 2}
  const styleNoMargin ={width: outerWidth/grid.cols, height: outerHeight/grid.rows}

  // style="top:${row*grid.height};left:${col*grid.width};width:${grid.width};height:${grid.height}"
  const videos =  new Array(num).fill().map((_, index) => {
      const row = Math.floor(index/grid.cols)
      const col = index%grid.cols
      const style = styleObj(state.layout.select.stretchToFit.value === true? styleNoMargin : styleMargins )(row, col)
      console.log(style)
      const el = html`<div class="absolute ba">
              ${state.cache(Video, `video-${index}`).render(videoList[index%videoList.length], {objectFit: state.layout.select.objectFit.value})}
          </div>`
    //  draggable(el)
      return css(el, style)
        })

  const controls = html`<div class="fixed pa4 bottom-1 right-1" style="background:rgba(0, 0, 0, 0.5)">
    <button type="button" onclick=${() => emit("layout:increase")}>add</button>
    <button type="button" onclick=${() => emit("layout:decrease")}>remove</button>

    ${Object.entries(state.layout.select).map(([key, value]) => {
      console.log(value)
      return html`<form>
        ${value.label}:
        ${value.options.map((label) => html`
          <input class="ma2" type="radio" name=${key} value=${label} id=${label} onchange=${() => emit('layout:selectProp', key, label)} ${label === value.value? 'checked':''}>
          <label for=${label}">${label}</label>
        `)}
      </form>`
    })}
    </div>`

  // ${key}
  // <!--${value.options.map((label) => html`<input type="radio" name="${key}" id="${label}">${label}</input>`)}-->

//  console.log(videos)
  return html`<div class="fixed w-100 h-100">
    ${videos}
    ${controls}
  </div>`
}


// /**
//  * Makes an element draggable.
//  *
//  * @param {HTMLElement} element - The element.
//  */
// function draggable(element) {
//   var isMouseDown = false;
//
//   // initial mouse X and Y for `mousedown`
//   var mouseX;
//   var mouseY;
//
//   // element X and Y before and after move
//   var elementX = 0;
//   var elementY = 0;
//
//   // mouse button down over the element
//   element.addEventListener('mousedown', onMouseDown);
//
//   /**
//    * Listens to `mousedown` event.
//    *
//    * @param {Object} event - The event.
//    */
//   function onMouseDown(event) {
//     mouseX = event.clientX;
//     mouseY = event.clientY;
//     isMouseDown = true;
//   }
//
//   // mouse button released
//   element.addEventListener('mouseup', onMouseUp);
//
//   /**
//    * Listens to `mouseup` event.
//    *
//    * @param {Object} event - The event.
//    */
//   function onMouseUp(event) {
//     isMouseDown = false;
//     elementX = parseInt(element.style.left) || 0;
//     elementY = parseInt(element.style.top) || 0;
//   }
//
//   // need to attach to the entire document
//   // in order to take full width and height
//   // this ensures the element keeps up with the mouse
//   document.addEventListener('mousemove', onMouseMove);
//
//   /**
//    * Listens to `mousemove` event.
//    *
//    * @param {Object} event - The event.
//    */
//   function onMouseMove(event) {
//     if (!isMouseDown) return;
//     var deltaX = event.clientX - mouseX;
//     var deltaY = event.clientY - mouseY;
//     element.style.left = elementX + deltaX + 'px';
//     element.style.top = elementY + deltaY + 'px';
//   }
//
// //  return element
// }
