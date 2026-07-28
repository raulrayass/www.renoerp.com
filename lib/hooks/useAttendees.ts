'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAttendees } from '@/app/actions/attendees'
import { useSession } from '@/lib/auth-client'
import { useEventContext } from '@/lib/contexts/event-context'

export interface Attendee {
  id: number
  name: string
  age?: number | null
  shirtSize?: string | null
  sex?: string | null
  phone: string
  church: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactName2?: string | null
  emergencyContactPhone2?: string | null
  allergies: string
  roomId?: number | null
  teamId?: number | null
  totalAmount: number
  amountPaid: number
  discount: number
  status: string
  checkedIn: boolean
  notes: string
  userId: string
  eventId: number
  createdAt?: Date
  updatedAt?: Date
}

interface UseAttendeesState {
  attendees: Attendee[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAttendees(): UseAttendeesState {
  const session = useSession()
  const { currentEventId } = useEventContext()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadAttendees = useCallback(async () => {
    if (!userId || !currentEventId) {
      setAttendees([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getAttendees(userId, currentEventId)
      setAttendees(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch attendees'))
      setAttendees([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentEventId])

  useEffect(() => {
    loadAttendees()
  }, [loadAttendees])

  return {
    attendees,
    isLoading,
    error,
    refetch: loadAttendees,
  }
}
