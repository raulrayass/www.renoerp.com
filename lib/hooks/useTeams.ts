'use client'

import { useCallback, useEffect, useState } from 'react'
import { getTeams } from '@/app/actions/teams'
import { useSession } from '@/lib/auth-client'
import { useEventContext } from '@/lib/contexts/event-context'

export interface Team {
  id: number
  name: string
  color: string
  country?: string | null
  useCountry?: boolean
  userId: string
  eventId: number
  createdAt?: Date
}

interface UseTeamsState {
  teams: Team[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useTeams(): UseTeamsState {
  const session = useSession()
  const { currentEventId } = useEventContext()
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadTeams = useCallback(async () => {
    if (!userId || !currentEventId) {
      setTeams([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getTeams(userId, currentEventId)
      setTeams(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch teams'))
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentEventId])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  return {
    teams,
    isLoading,
    error,
    refetch: loadTeams,
  }
}
