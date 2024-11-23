// useContext: Caching response data in context
// 💯 caching in a context provider (exercise)
// http://localhost:3000/isolated/exercise/03.extra-2.js

// you can edit this here and look at the isolated page or you can copy/paste
// this in the regular exercise file.

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'
import {useAsync} from '../utils'

const PokemonCacheContext = React.createContext()

function pokemonCacheReducer(cache, action) {
  console.log(`pokemonCacheReducer action: `)
  console.dir(action)
  switch (action.type) {
    case 'ADD_POKEMON': {
      const updatedCache = {...cache, [action.pokemonName]: action.pokemonData}
      console.log(`updatedCache after action: `)
      console.dir(updatedCache)
      return updatedCache
    }
    case 'REMOVE_POKEMON': {
      const {pokemonName} = action
      const updatedCache = {...cache}

      delete updatedCache[pokemonName]

      return updatedCache
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function PokemonCacheProvider({children}) {
  const [cache, dispatch] = React.useReducer(pokemonCacheReducer, {})
  return (
    <PokemonCacheContext.Provider value={[cache, dispatch]}>
      {children}
    </PokemonCacheContext.Provider>
  )
}

function usePokemonCache() {
  const context = React.useContext(PokemonCacheContext)

  if (context == null) {
    throw new Error(
      `usePokemonCacheContext must be used within a PokemonCacheProvider`,
    )
  }

  return context
}

function PokemonInfo({pokemonName}) {
  const [cache, pokemonCacheDispatcher] = usePokemonCache()

  const {data: pokemon, status, error, run, setData, setIdle} = useAsync()

  React.useEffect(() => {
    if (!pokemonName) {
      if (pokemon) {
        setIdle()
      }
      return
    } else if (cache[pokemonName]) {
      setData(cache[pokemonName])
    } else {
      run(
        fetchPokemon(pokemonName).then(pokemonData => {
          pokemonCacheDispatcher({
            type: 'ADD_POKEMON',
            pokemonName,
            pokemonData,
          })
          return pokemonData
        }),
      )
    }
  }, [
    cache,
    pokemon,
    setIdle,
    pokemonCacheDispatcher,
    pokemonName,
    run,
    setData,
  ])

  if (status === 'idle') {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={pokemon} />
  }
}

function PreviousPokemon({onSelect}) {
  const [cache, dispatch] = usePokemonCache()
  return (
    <div>
      Previous Pokemon
      <ul style={{listStyle: 'none', paddingLeft: 0}}>
        {Object.keys(cache).map(pokemonName => (
          <li
            key={pokemonName}
            style={{
              margin: '4px auto',
              display: 'grid',
              gridAutoFlow: 'column',
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            <button
              style={{width: '100%'}}
              onClick={() => onSelect(pokemonName)}
            >
              {pokemonName}
            </button>
            <button
              style={{
                width: '100%',
                backgroundColor: 'black',
                color: 'white',
              }}
              onClick={() => {
                onSelect('')
                dispatch({type: 'REMOVE_POKEMON', pokemonName})
              }}
            >
              remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PokemonSection({onSelect, pokemonName}) {
  return (
    <div style={{display: 'flex'}}>
      <PokemonCacheProvider>
        <PreviousPokemon onSelect={onSelect} />
        <div className="pokemon-info" style={{marginLeft: 10}}>
          <PokemonErrorBoundary
            onReset={() => onSelect('')}
            resetKeys={[pokemonName]}
          >
            <PokemonInfo pokemonName={pokemonName} />
          </PokemonErrorBoundary>
        </div>
      </PokemonCacheProvider>
    </div>
  )
}

function App() {
  const [pokemonName, setPokemonName] = React.useState(null)

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleSelect(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <PokemonSection onSelect={handleSelect} pokemonName={pokemonName} />
    </div>
  )
}

export default App
