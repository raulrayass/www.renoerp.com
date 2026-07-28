'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'

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
  const [currentEventId, setCurrentEventId] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [userEvents, setUserEvents] = useState<any[]>([])

  useEffect(() => {
    // Get event ID from URL search params
    const eventId = searchParams.get('eventId')
    
    if (eventId) {
      const parsed = parseInt(eventId, 10)
      if (!isNaN(parsed)) {
        setCurrentEventId(parsed)
      }
    }
    
    setIsInitialized(true)
  }, [searchParams])

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
