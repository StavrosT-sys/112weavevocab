// src/lib/useDuelSync.ts
import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

interface Duel {
  path: number[]
  opponentScore: number
  timestamp: number
}

export const useDuelSync = () => {
  const [duel, setDuel] = useLocalStorage<Duel | null>('currentDuel', null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const duelData = params.get('duel')
    if (duelData) {
      const [path, opponentScore] = duelData.split('|')
      setDuel({ path: path.split('-').map(Number), opponentScore: Number(opponentScore), timestamp: Date.now() })
    }
  }, [])

  const createDuel = (path: number[], myScore: number) => {
    const url = `${location.origin}?duel=${path.join('-')}|${myScore}`
    navigator.clipboard.writeText(url)
    return url
  }

  return { duel, createDuel }
}
