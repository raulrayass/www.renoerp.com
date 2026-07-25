'use client'

import { useCallback } from 'react'
import useSWR from 'swr'

export interface Team {
  id: string
  name: string
  country?: string
  color?: string
  totalPoints?: number
}

interface UseTeamsState {
  teams: Team[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  addTeam: (team: Omit<Team, 'id'>) => Promise<Team>
  updateTeam: (id: string, team: Partial<Team>) => Promise<void>
  deleteTeam: (id: string) => Promise<void>
}

export function useTeams(): UseTeamsState {
  const { data, error, isLoading, mutate } = useSWR('/api/teams', async (url) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch teams')
    return res.json()
  })

  const addTeam = useCallback(
    async (team: Omit<Team, 'id'>) => {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
      })

      if (!response.ok) throw new Error('Failed to add team')
      const newTeam = await response.json()
      await mutate()
      return newTeam
    },
    [mutate]
  )

  const updateTeam = useCallback(
    async (id: string, updates: Partial<Team>) => {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update team')
      await mutate()
    },
    [mutate]
  )

  const deleteTeam = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete team')
      await mutate()
    },
    [mutate]
  )

  return {
    teams: data?.teams || [],
    isLoading,
    error: error || null,
    refetch: mutate,
    addTeam,
    updateTeam,
    deleteTeam,
  }
}
