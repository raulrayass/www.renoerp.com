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
 * 2. "Campamento 2026" (tiene todos los módulos y datos migrados actuales)
 * 3. Primer evento disponible
 * 
 * FLUJO:
 * Login → getUserEvents() → buscar en localStorage → 
 * si no existe → buscar "Campamento 2026" → setCurrentEventId → 
 * localStorage.setItem('lastEventId', id)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from '@/lib/auth-client'
import { getUserEvents } from '@/app/actions/events'

// Nombre del evento principal que contiene todos los módulos y datos del campamento actual
const CURRENT_EVENT_NAME = `Permanece ${new Date().getFullYear()}`

export interface EventContextType {
  currentEventId: number | null
  events: Array<{ id: number; name: string; role: string }>
  isLoading: boolean
  isInitialized: boolean
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
  const [isInitialized, setIsInitialized] = useState(false)

  // Cargar eventos del usuario
  // Prioridad de selección:
  // 1. Evento guardado en localStorage (último seleccionado)
  // 2. Evento "Permanece 2026" (tiene todos los datos actuales)
  // 3. Primer evento disponible
  const refetchEvents = React.useCallback(async () => {
    console.log('[v0] EventContext: refetchEvents called, userId:', userId)
    
    if (!userId) {
      console.log('[v0] EventContext: No userId, returning')
      setIsLoading(false)
      setIsInitialized(true)
      return
    }

    try {
      setIsLoading(true)
      const userEvents = await getUserEvents(userId)
      console.log('[v0] EventContext: Got events:', userEvents)
      setEvents(userEvents || [])
      
      // Siempre seleccionar un evento si hay disponibles y no hay uno seleccionado
      if (userEvents && userEvents.length > 0) {
        console.log('[v0] EventContext: Found', userEvents.length, 'events, currentEventId:', currentEventId)
        if (!currentEventId) {
          // Intentar obtener el último evento seleccionado del localStorage
          const savedEventId = localStorage.getItem('lastEventId')
          const savedId = savedEventId ? parseInt(savedEventId, 10) : null
          
          let eventToSelect: number | null = null

          // Prioridad 1: Usar evento guardado si existe y está disponible
          if (savedId && userEvents.some(e => e.id === savedId)) {
            eventToSelect = savedId
          } 
          // Prioridad 2: Buscar "Campamento 2026" (evento con todos los módulos y datos)
          else {
            const mainEvent = userEvents.find(e => e.name === CURRENT_EVENT_NAME)
            eventToSelect = mainEvent?.id || userEvents[0]?.id
          }
          
          if (eventToSelect) {
            console.log('[v0] EventContext: Setting event:', eventToSelect)
            setCurrentEventId(eventToSelect)
            localStorage.setItem('lastEventId', String(eventToSelect))
          }
        }
      }
    } catch (error) {
      console.error('[v0] EventContext Error fetching events:', error)
      setEvents([])
    } finally {
      console.log('[v0] EventContext: Finished, isInitialized set to true')
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [userId])

  // Cargar eventos cuando userId cambia
  useEffect(() => {
    if (userId) {
      refetchEvents()
    }
  }, [userId])

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
        isInitialized,
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
