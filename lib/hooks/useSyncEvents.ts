'use client'

import { useEffect, useCallback } from 'react'
import { useAppContext } from '@/lib/context/app-context'

type EventType = 
  | 'gameCreated' | 'gameUpdated' | 'gameDeleted'
  | 'scoreAdded' | 'scoreDeleted'
  | 'attendeeCheckIn' | 'attendeeCheckOut' | 'paymentAdded'
  | 'teamUpdated'

interface EventData {
  timestamp: Date
  userId?: string
  [key: string]: any
}

export function useSyncEvents(
  eventType: EventType,
  callback: (data: EventData) => void
) {
  const { subscribe, unsubscribe } = useAppContext()

  useEffect(() => {
    const unsubscribeFn = subscribe(eventType, callback)
    return () => unsubscribeFn()
  }, [eventType, callback, subscribe, unsubscribe])
}

export function useEmitEvent() {
  const { emit } = useAppContext()

  const emitEvent = useCallback((eventType: EventType, data: EventData) => {
    emit(eventType, {
      ...data,
      timestamp: new Date(),
    })
  }, [emit])

  return emitEvent
}
