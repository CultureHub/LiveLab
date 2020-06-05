const html = require('choo/html')

const getGrid = (num, ratio, outerWidth, outerHeight) => {
  let w = 0
  let cols = 0
  // find number of columns that generates biggest size of rectangles
  new Array(num).fill().forEach((s, _c) => {
    const numCols = _c + 1
    const numRows = Math.ceil(num / numCols)
    const maxW = Math.min(outerWidth / numCols, outerHeight / numRows * ratio)
    if (maxW >= w) {
      w = maxW
      cols = numCols
    }
  })

  return {
    width: w,
    height: w / ratio,
    cols: cols,
    rows: Math.ceil(num / cols)
  }
}

const css = (el, style) => {
  Object.entries(style).forEach(([key, value]) => {
    el.style[key] = value
  })
  return el
}

module.exports = (
  {
    elements = [],
    ratio = '4:3',
    stretchToFit = true,
    outerWidth = window.innerWidth,
    outerHeight = window.innerHeight
  } = {},
  emit
) => {
  const num = elements.length
  const _ratio = ratio.split(':')
  const grid = getGrid(num, _ratio[0] / _ratio[1], outerWidth, outerHeight)

  const styleObj = (
    { width = grid.width, height = grid.height, marginX = 0, marginY = 0 }
  ) =>
    (row, col) => ({
      top: `${marginY + row * height}px`,
      left: `${marginX + col * width}px`,
      width: `${width}px`,
      height: `${height}px`,
      textAlign: 'center',
      transition: 'width 0.3s, height 0.3s, top 0.3s, left 0.3s'
    })

  const styleMargins = {
    marginX: (outerWidth - grid.cols * grid.width) / 2,
    marginY: (outerHeight - grid.rows * grid.height) / 2
  }
  const styleNoMargin = {
    width: outerWidth / grid.cols,
    height: outerHeight / grid.rows
  }

  const divs = elements.map((innerEl, index) => {
    const row = Math.floor(index / grid.cols)
    const col = index % grid.cols
    const style = styleObj(
      stretchToFit === true ? styleNoMargin : styleMargins
    )(row, col)
    const el = html`<div class="absolute">
              ${innerEl}
          </div>`
    return css(el, style)
  })

  return html`<div class="fixed w-100 h-100">
    ${divs}
  </div>`
}
