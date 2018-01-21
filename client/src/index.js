import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { compose, applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger'
import rootReducer from './util/reducer'
import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { PersistGate } from 'redux-persist/lib/integration/react'

const logger = createLogger({
  'predicate': () => window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
})

const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['user']
}

const store = createStore(
  persistReducer(persistConfig, rootReducer),
  undefined,
  compose(
    applyMiddleware(thunk, logger)
  )
)
const persistor = persistStore(store)

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
)
