// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

function countReducer(state, action) {
  if (typeof action === 'function') {
    return {...state, ...action(state)}
  } else if (typeof action === 'object') {
    return {...state, ...action}
  }
  throw new Error(
    `Unsupported type for parameter 'action': '${typeof action}'. Supported types are 'object' and 'function'`,
  )
}

function Counter({initialCount = 0, step = 1}) {
  const [state, setState] = React.useReducer(countReducer, {
    count: initialCount,
  })

  const {count} = state

  const increment = () => setState('test')
  return <button onClick={increment}>{count}</button>
}

function App() {
  return <Counter />
}

export default App
