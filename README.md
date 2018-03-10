# redux-persist-middleware

![](https://img.shields.io/npm/dm/redux-persist-middleware.svg)![](https://img.shields.io/npm/v/redux-persist-middleware.svg)![](https://img.shields.io/npm/l/redux-persist-middleware.svg)

Generates Redux middleware that will trigger an asynchronous write to cache on a `requestIdleCallback`.

* You supply a map of action types to reducers that should be persisted as a result of a given action.
* You supply the function to be called for persisting (must return a Promise).

That's it!

Works really well with the tiny cache library [money-clip](https://github.com/HenrikJoreteg/money-clip) for versioned, async, IndexedDB backed caching for Redux apps.

## Why?

* I think caching should to be a seamless asynchronous side effect in Redux, done when the browser is not busy with other things (hence the use of `requestIdleCallback`).
* Lets you bring your own persistance library. I use [money-clip](https://github.com/HenrikJoreteg/money-clip) because it's tiny, async, IndexedDB-powered (not sync and blocking like `localStorage`), and supports versioning and max age.
* I don't like the idea of dispatching special persistance related actions. Such actions are likely to trigger unnecessary renders. The work of persisting data has no direct impact on the UI and in my opinion and should be done lazily to keep app performing smoothly.
* I don't want to write on every action, I want to pick what reducers get persisted on what actions in an opt-in sort of way.
* It should be inert if running in node where IndexedDB is irrelevant.

## install

```
npm install redux-persist-middleware
```

## Example

```js
import { h, render } from 'preact'
import { Provider } from 'preact-redux'
import ms from 'milliseconds'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './state/root'
import RootComponent from './components/root'
import config from './config'

// The relevant stuff
import getPersistMiddleware from 'redux-persist-middleware'
import { getConfiguredCache } from 'money-clip'

// Here we use the money-clip library to
// creates an object of cache functions with
// these options pre-applied
const cache = getConfiguredCache({
  version: config.cacheVersion,
  maxAge: ms.days(30)
})

// A mapping of actions to reducers we should
// persist after those actions occur
const actionMap = {
  FETCH_USERS_SUCCESS: ['users'],
  FETCH_TOKEN_SUCCESS: ['auth']
}

// Configure our middleware
const persistMiddleware = getPersistMiddleware({
  // a function to call to persist stuff.
  // This *must* return a Promise and
  // *must take two arguments: (key, value)*
  cacheFunction: cache.set,
  // optionally logs out which action triggered
  // something to be cached and what reducers
  // were persisted as a result.
  logger: console.info,
  // We pass in the mapping of action types to
  // reducers that should be persisted
  actionMap
})

// Load everything from cache when the app
// boots up.
cache.getAll().then(data => {
  // You can manually do any sort of data merging
  // you'd like to do here. Say you have some
  // bootstrapped data from the server or whatnot
  // that part is up to you.

  // Then set up store
  const store = createStore(
    rootReducer,
    data,
    // apply our middleware
    applyMiddleware(persistMiddleware)
  )

  // Carry on as usual
  render(
    <Provider store={store}>
      <RootComponent />
    </Provider>,
    document.getElementById('app')
  )
})
```

## Tests

```
$ npm i && npm test
```

## Change log

* `1.0.1`: bugfix to make it work in a web worker
* `1.0.0`: initial release

## credits

If you like this follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.

## license

[MIT](http://mit.joreteg.com/)
