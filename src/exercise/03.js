// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'

const CountContext = React.createContext([0, () => {}])

function CountProvider({children, ...restProps}) {
  const [count, setCount] = React.useState(0)
  const value = [count, setCount]

  return (
    <CountContext.Provider value={value} {...restProps}>
      {children}
    </CountContext.Provider>
  )
}

function useCount() {
  const context = React.useContext(CountContext)

  if (!context) {
    throw new Error('useCount must be used within the CountProvider')
  }

  return context
}

function CountDisplay() {
  const [count] = useCount()
  return <div>{`The current count is ${count}`}</div>
}

function Counter() {
  const [, setCount] = useCount()
  const increment = () => setCount(c => c + 1)
  return <button onClick={increment}>Increment count</button>
}

function App() {
  return (
    <div>
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  )
}

export default App
