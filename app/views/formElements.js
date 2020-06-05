var html = require('choo/html')

module.exports = {
  button: (
    {
      text = '',
      title = '',
      onClick = () => {
      },
      classes = 'bg-dark-pink'
    }
  ) => html`
    <div class="ttu dim pointer pa2 ${classes}" style="width:fit-content" onclick=${onClick}>
      ${`>> ${text}`}
    </div>`
}
