'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { getUserEvents } from '@/app/actions/events'

interface EventContextType {
  currentEventId: number | null
  setCurrentEventId: (eventId: number) => void
  isInitialized: boolean
  userEvents: any[]
  setUserEvents: (events: any[]) => void
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const session = useSession()
  const [currentEventId, setCurrentEventId] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [userEvents, setUserEvents] = useState<any[]>([])
  const userId = session?.data?.user?.id

  useEffect(() => {
    const initializeEventId = async () => {
      const eventIdParam = searchParams.get('eventId')
      
      if (eventIdParam) {
        // Use event ID from URL if provided
        const parsed = parseInt(eventIdParam, 10)
        if (!isNaN(parsed)) {
          setCurrentEventId(parsed)
        }
        setIsInitialized(true)
        return
      }

      // No event ID in URL, load user's first event
      if (!userId) {
        setIsInitialized(true)
        return
      }

      try {
        const events = await getUserEvents(userId)
        setUserEvents(events || [])
        
        if (events && events.length > 0) {
          const firstEventId = events[0].id
          setCurrentEventId(firstEventId)
          console.log('[v0] Loaded first event:', firstEventId)
        } else {
          console.log('[v0] No events found for user')
        }
      } catch (error) {
        console.error('[v0] Error loading user events:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeEventId()
  }, [searchParams, userId])

  return (
    <EventContext.Provider value={{ 
      currentEventId, 
      setCurrentEventId, 
      isInitialized,
      userEvents,
      setUserEvents 
    }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEventContext() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useEventContext must be used within EventProvider')
  }
  return context
}
