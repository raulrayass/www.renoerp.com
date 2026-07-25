'use client'

import { useCallback } from 'react'
import useSWR from 'swr'

export interface Game {
  id: string
  name: string
  description?: string
  gameDate?: string
}

interface UseGamesState {
  games: Game[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  addGame: (game: Omit<Game, 'id'>) => Promise<Game>
  updateGame: (id: string, game: Partial<Game>) => Promise<void>
  deleteGame: (id: string) => Promise<void>
}

export function useGames(): UseGamesState {
  const { data, error, isLoading, mutate } = useSWR('/api/games', async (url) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch games')
    return res.json()
  })

  const addGame = useCallback(
    async (game: Omit<Game, 'id'>) => {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
      })

      if (!response.ok) throw new Error('Failed to add game')
      const newGame = await response.json()
      await mutate()
      return newGame
    },
    [mutate]
  )

  const updateGame = useCallback(
    async (id: string, updates: Partial<Game>) => {
      const response = await fetch(`/api/games/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update game')
      await mutate()
    },
    [mutate]
  )

  const deleteGame = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/games/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete game')
      await mutate()
    },
    [mutate]
  )

  return {
    games: data?.games || [],
    isLoading,
    error: error || null,
    refetch: mutate,
    addGame,
    updateGame,
    deleteGame,
  }
}
