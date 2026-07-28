'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAllGameScores } from '@/app/actions/games'
import { useSession } from '@/lib/auth-client'
import { useEventContext } from '@/lib/contexts/event-context'

export interface GameScore {
  id: number
  gameId: number
  teamId: number
  points: number
  userId: string
  eventId: number
  createdAt?: Date
}

interface GameScoresState {
  scores: GameScore[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useGameScores(): GameScoresState {
  const session = useSession()
  const { currentEventId } = useEventContext()
  const [scores, setScores] = useState<GameScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadScores = useCallback(async () => {
    if (!userId || !currentEventId) {
      setScores([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getAllGameScores(userId, currentEventId)
      setScores(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch game scores'))
      setScores([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentEventId])

  useEffect(() => {
    loadScores()
  }, [loadScores])

  return {
    scores,
    isLoading,
    error,
    refetch: loadScores,
  }
}
