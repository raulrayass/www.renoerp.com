'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface AppContextType {
  // Events que pueden dispararse entre módulos
  events: {
    onGameCreated: (gameId: string) => void
    onScoreAdded: (gameId: string, teamId: string, points: number) => void
    onTeamUpdated: (teamId: string) => void
    onAttendeeCheckIn: (attendeeId: string) => void
    onAttendeeCheckOut: (attendeeId: string) => void
    onPaymentAdded: (attendeeId: string, amount: number) => void
  }
  
  // Listeners para cada evento
  listeners: {
    gameCreated: Set<(gameId: string) => void>
    scoreAdded: Set<(gameId: string, teamId: string, points: number) => void>
    teamUpdated: Set<(teamId: string) => void>
    attendeeCheckIn: Set<(attendeeId: string) => void>
    attendeeCheckOut: Set<(attendeeId: string) => void>
    paymentAdded: Set<(attendeeId: string, amount: number) => void>
  }
  
  // Subscribe/unsubscribe methods
  subscribe: (event: keyof AppContextType['listeners'], callback: Function) => () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [listeners] = useState<AppContextType['listeners']>({
    gameCreated: new Set(),
    scoreAdded: new Set(),
    teamUpdated: new Set(),
    attendeeCheckIn: new Set(),
    attendeeCheckOut: new Set(),
    paymentAdded: new Set(),
  })

  const events: AppContextType['events'] = {
    onGameCreated: (gameId) => {
      listeners.gameCreated.forEach(callback => callback(gameId))
    },
    onScoreAdded: (gameId, teamId, points) => {
      listeners.scoreAdded.forEach(callback => callback(gameId, teamId, points))
    },
    onTeamUpdated: (teamId) => {
      listeners.teamUpdated.forEach(callback => callback(teamId))
    },
    onAttendeeCheckIn: (attendeeId) => {
      listeners.attendeeCheckIn.forEach(callback => callback(attendeeId))
    },
    onAttendeeCheckOut: (attendeeId) => {
      listeners.attendeeCheckOut.forEach(callback => callback(attendeeId))
    },
    onPaymentAdded: (attendeeId, amount) => {
      listeners.paymentAdded.forEach(callback => callback(attendeeId, amount))
    },
  }

  const subscribe = useCallback((event: keyof AppContextType['listeners'], callback: Function) => {
    listeners[event].add(callback as any)
    
    // Return unsubscribe function
    return () => {
      listeners[event].delete(callback as any)
    }
  }, [listeners])

  const value: AppContextType = {
    events,
    listeners,
    subscribe,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
