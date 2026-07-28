'use client'

import { useCallback, useEffect, useState } from 'react'
import { getGames } from '@/app/actions/games'
import { useSession } from '@/lib/auth-client'
import { useEventContext } from '@/lib/contexts/event-context'

export interface Game {
  id: number
  name: string
  description?: string | null
  gameDate?: string | null
  userId: string
  eventId: number
  createdAt?: Date
}

interface UseGamesState {
  games: Game[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useGames(): UseGamesState {
  const session = useSession()
  const { currentEventId } = useEventContext()
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadGames = useCallback(async () => {
    if (!userId || !currentEventId) {
      setGames([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getGames(userId, currentEventId)
      setGames(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch games'))
      setGames([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentEventId])

  useEffect(() => {
    loadGames()
  }, [loadGames])

  return {
    games,
    isLoading,
    error,
    refetch: loadGames,
  }
}
