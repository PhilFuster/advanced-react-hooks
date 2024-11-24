// useContext: Caching response data in context
// 💯 caching in a context provider (exercise)
// http://localhost:3000/isolated/exercise/03.extra-2.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'
import {useAsync} from '../utils'

// #region PokemonCacheContext
const PokemonCacheContext = React.createContext()

const debug = false

function pokemonCacheReducer(cache, action) {
  debug && console.log(`pokemonCacheReducer action: `)
  debug && console.dir(action)
  switch (action.type) {
    case 'ADD_POKEMON': {
      const updatedCache = {...cache, [action.pokemonName]: action.pokemonData}
      debug && console.log(`updatedCache after action: `)
      debug && console.dir(updatedCache)
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
// #endregion PokemonCacheContext

// #region PokemonSection
function PokemonInfo({pokemonName, pokemon, status, error}) {
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

function PreviousPokemon({onSelect, onRemove}) {
  const [cache] = usePokemonCache()
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
                onRemove(pokemonName)
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
  const [cache, pokemonCacheDispatcher] = usePokemonCache()

  const {data: pokemon, status, error, run, setData, reset} = useAsync()

  /**
   * Handle removing a pokemon name from cache
   */
  function handleRemove(pokemonNameToRemove) {
    pokemonCacheDispatcher({
      type: 'REMOVE_POKEMON',
      pokemonName: pokemonNameToRemove,
    })
    // just removed a pokemon from cache. if there
    // are pokemon left cache display it
    const cacheKeys = Object.keys(cache)
    const filteredCacheKeys = cacheKeys.filter(
      key => key !== pokemonNameToRemove,
    )
    if (pokemonName !== pokemonNameToRemove) {
      // pokemon removed is not the one being displayed
      // no need to try and show different pokemon
      return
    }
    if (filteredCacheKeys.length > 0) {
      const [key] = Object.keys(cache)
      if (key != null) {
        onSelect(key)
        setData(cache[key])
        return
      }
    }
    onSelect('')
    reset()
  }

  React.useEffect(() => {
    if (!pokemonName) {
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
  }, [cache, pokemon, reset, pokemonCacheDispatcher, pokemonName, run, setData])

  return (
    <div style={{display: 'flex'}}>
      <PreviousPokemon onRemove={handleRemove} onSelect={onSelect} />
      <div className="pokemon-info" style={{marginLeft: 10}}>
        <PokemonErrorBoundary
          onReset={() => onSelect('')}
          resetKeys={[pokemonName]}
        >
          <PokemonInfo
            status={status}
            pokemon={pokemon}
            pokemonName={pokemonName}
            error={error}
          />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}
// #endregion PokemonSection

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
      <PokemonCacheProvider>
        <PokemonSection onSelect={handleSelect} pokemonName={pokemonName} />
      </PokemonCacheProvider>
    </div>
  )
}

export default App
