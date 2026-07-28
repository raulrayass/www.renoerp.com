'use client'

import { useCallback, useEffect, useState } from 'react'
import { getUserEvents } from '@/app/actions/events'
import { useSession } from '@/lib/auth-client'

export interface Event {
  id: number
  name: string
  description?: string | null
  startDate: string
  endDate: string
  location?: string | null
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

interface UseEventsState {
  events: Event[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useEvents(): UseEventsState {
  const session = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadEvents = useCallback(async () => {
    if (!userId) {
      setEvents([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getUserEvents(userId)
      setEvents(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'))
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  return {
    events,
    isLoading,
    error,
    refetch: loadEvents,
  }
}
