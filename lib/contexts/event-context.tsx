'use client'

/**
 * EventContext - Gestión del evento/campamento actual
 * 
 * ALMACENAMIENTO DEL EVENTO ACTUAL:
 * 1. localStorage: Guarda el ID del último evento seleccionado
 *    - Persiste entre refreshes y cierres (mismo dispositivo)
 *    - Clave: 'lastEventId'
 *    - Se restaura automáticamente al login
 * 
 * 2. Estado React: currentEventId en memoria
 *    - Disponible en toda la app via useEventContext()
 *    - Se pierde si recarga la página (pero localStorage lo restaura)
 * 
 * PRIORIDAD DE AUTO-CARGA AL LOGIN:
 * 1. Evento en localStorage (último que usó el usuario)
 * 2. "Campamento Default" (tiene todos los datos migrados actuales)
 * 3. Primer evento disponible
 * 
 * FLUJO:
 * Login → getUserEvents() → buscar en localStorage → 
 * si no existe → buscar "Campamento Default" → setCurrentEventId → 
 * localStorage.setItem('lastEventId', id)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from '@/lib/auth-client'
import { getUserEvents } from '@/app/actions/events'

export interface EventContextType {
  currentEventId: number | null
  events: Array<{ id: number; name: string; role: string }>
  isLoading: boolean
  setCurrentEventId: (eventId: number) => void
  refetchEvents: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  const session = useSession()
  const userId = session?.data?.user?.id
  
  const [currentEventId, setCurrentEventId] = useState<number | null>(null)
  const [events, setEvents] = useState<Array<{ id: number; name: string; role: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar eventos del usuario
  // Prioridad de selección:
  // 1. Evento guardado en localStorage (último seleccionado)
  // 2. Evento "Campamento Default" (tiene todos los datos actuales)
  // 3. Primer evento disponible
  const refetchEvents = React.useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const userEvents = await getUserEvents(userId)
      setEvents(userEvents || [])
      
      // Si no hay evento seleccionado y hay eventos disponibles
      if (!currentEventId && userEvents && userEvents.length > 0) {
        // Intentar obtener el último evento seleccionado del localStorage
        const savedEventId = localStorage.getItem('lastEventId')
        const savedId = savedEventId ? parseInt(savedEventId, 10) : null
        
        let eventToSelect: number | null = null

        // Prioridad 1: Usar evento guardado si existe y está disponible
        if (savedId && userEvents.some(e => e.id === savedId)) {
          eventToSelect = savedId
        } 
        // Prioridad 2: Buscar "Campamento Default" (evento con datos migrados)
        else {
          const defaultEvent = userEvents.find(e => e.name === 'Campamento Default')
          eventToSelect = defaultEvent?.id || userEvents[0]?.id
        }
        
        if (eventToSelect) {
          setCurrentEventId(eventToSelect)
          localStorage.setItem('lastEventId', String(eventToSelect))
        }
      }
    } catch (error) {
      console.error('[EventContext] Error fetching events:', error)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentEventId])

  // Cargar eventos cuando userId cambia
  useEffect(() => {
    refetchEvents()
  }, [userId, refetchEvents])

  // Guardar evento seleccionado en localStorage
  const handleSetCurrentEventId = (eventId: number) => {
    setCurrentEventId(eventId)
    localStorage.setItem('lastEventId', String(eventId))
  }

  return (
    <EventContext.Provider 
      value={{
        currentEventId,
        events,
        isLoading,
        setCurrentEventId: handleSetCurrentEventId,
        refetchEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEventContext() {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEventContext must be used within EventProvider')
  }
  return context
}
