'use client'

import { useCallback, useEffect, useRef } from 'react'
import useSWR from 'swr'

interface GameScore {
  gameId: string
  teamId: string
  points: number
}

interface GameScoresState {
  scores: GameScore[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  updateScore: (gameId: string, teamId: string, points: number) => Promise<void>
  invalidateCache: () => void
}

const CACHE_KEY = '/api/games/scores'

export function useGameScores(): GameScoresState {
  const cacheInvalidateRef = useRef<() => void>()

  const { data, error, isLoading, mutate } = useSWR(CACHE_KEY, async (url) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch game scores')
    return res.json()
  })

  cacheInvalidateRef.current = mutate

  const updateScore = useCallback(
    async (gameId: string, teamId: string, points: number) => {
      try {
        const response = await fetch(`/api/games/${gameId}/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId, points }),
        })

        if (!response.ok) throw new Error('Failed to update score')

        await mutate()
      } catch (err) {
        console.error('Error updating score:', err)
        throw err
      }
    },
    [mutate]
  )

  const invalidateCache = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    scores: data?.scores || [],
    isLoading,
    error: error || null,
    refetch: mutate,
    updateScore,
    invalidateCache,
  }
}
