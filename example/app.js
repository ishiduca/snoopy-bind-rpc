var yo = require('yo-yo')
var xtend = require('xtend')
var { pipeline, through } = require('mississippi')

module.exports = ({ rpc }) => ({
  init () {
    return {
      model: {
        inputValue: '',
        result: {
          sum: 0,
          average: 0
        },
        errors: []
      }
    }
  },
  update (model, action) {
    if (action == null) return { model }
    if (action.onInputValue != null) {
      var inputValue = action.onInputValue
      var onInputValue = inputValue.split(' ').filter(Boolean).map(Number)
      return {
        model: xtend(model, { inputValue }),
        effect: { onInputValue }
      }
    }
    if (action.onResponse != null) {
      return {
        model: xtend(model, action.onResponse)
      }
    }
    return { model }
  },
  run (effect, srcs) {
    if (effect.onInputValue) {
      return pipeline.obj(
        rpc([
          { sum: effect.onInputValue },
          { average: effect.onInputValue }
        ]),
        through.obj((response, _, done) => {
          var errors = response.filter(r => r.error).map(r => r.error)
          var results = response.filter(r => r.result)
          var result = results.reduce((a, b) => {
            return xtend(a, { [b.request.method]: b.result })
          }, {})
          done(null, { onResponse: { errors, result } })
        })
      )
    }
  },
  view (model, actionsUp) {
    return yo`
      <div>
        <div>
          <input
            type="text"
            size=30
            value=${model.inputValue}
            oninput=${e => actionsUp({ onInputValue: e.target.value })}
          />
        </div>
        <div>
          ${model.errors.map(error => yo`
            <div>
              <h3>${error.message}</h3>
              <p>${JSON.stringify(error.data)}</p>
            </div>
          `)}
        </div>
        <div>
          <ul>
            <li>sum: <b>${model.result.sum}</b></li>
            <li>average: <b>${model.result.average}</b></li>
          </ul>
        </div>
      </div>
    `
  }
})
