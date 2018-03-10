import ric from 'ric-shim'
const IS_BROWSER = !!(
  typeof window !== 'undefined' || typeof self !== 'undefined'
)

export default ({ cacheFn, actionMap, logger }) => ({
  getState
}) => next => action => {
  const reducersToPersist = actionMap[action.type]
  const res = next(action)
  const state = getState()
  if (IS_BROWSER && reducersToPersist) {
    ric(() => {
      Promise.all(reducersToPersist.map(key => cacheFn(key, state[key]))).then(
        () => {
          if (logger) {
            logger(
              `cached ${reducersToPersist.join(', ')} due to ${action.type}`
            )
          }
        }
      )
    })
  }
  return res
}
