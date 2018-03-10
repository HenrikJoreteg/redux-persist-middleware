// trick it into thinking this is a browser
global.window = {}

const test = require('tape')
const getPersistMiddleware = require('./dist/redux-persist-middleware')
const { createStore, applyMiddleware, combineReducers } = require('redux')

const getBooleanReducer = actionType => (state = false, action) => {
  if (action.type === actionType) {
    return true
  }
  return state
}

const rootReducer = combineReducers({
  isCool: getBooleanReducer('MAKE_COOL'),
  isNeat: getBooleanReducer('MAKE_NEAT'),
  isSilly: getBooleanReducer('MAKE_SILLY'),
  isAmazing: getBooleanReducer('MAKE_AMAZING')
})

const getStore = middleware =>
  createStore(rootReducer, applyMiddleware(middleware))

test('basic functionality', t => {
  let callCount = 0

  const actionMap = {
    MAKE_COOL: ['isCool'],
    MAKE_NEAT: ['isNeat', 'isSilly']
  }

  const middleware = getPersistMiddleware({
    actionMap,
    cacheFn: (key, value) => {
      callCount++

      if (callCount === 1) {
        t.equal(key, 'isCool')
        t.equal(value, true)
      }
      if (callCount === 2) {
        t.equal(key, 'isNeat')
        t.equal(value, true)
      }
      if (callCount === 3) {
        t.equal(key, 'isSilly')
        t.equal(value, false)
      }
      if (callCount > 3) {
        t.fail('should never get here')
      }

      return Promise.resolve()
    }
  })

  const store = getStore(middleware)

  store.dispatch({ type: 'MAKE_COOL' })
  store.dispatch({ type: 'MAKE_NEAT' })
  store.dispatch({ type: 'MAKE_SILLY' })
  store.dispatch({ type: 'MAKE_AMAZING' })
  setTimeout(t.end, 200)
})
