'use server'

import { db } from '@/lib/db'
import { teams, attendees } from '@/lib/db/schema'
import { eq, and, asc, desc, count } from 'drizzle-orm'

const TEAMS_PER_PAGE = 20

// Get ALL teams (no pagination)
export async function getAllTeams(userId: string, eventId: number) {
  return db
    .select()
    .from(teams)
    .where(and(eq(teams.userId, userId), eq(teams.eventId, eventId)))
    .orderBy(asc(teams.name))
}

export async function getTeams(userId: string, eventId: number, page: number = 1) {
  const offset = (page - 1) * TEAMS_PER_PAGE
  return db
    .select()
    .from(teams)
    .where(and(eq(teams.userId, userId), eq(teams.eventId, eventId)))
    .orderBy(asc(teams.name))
    .limit(TEAMS_PER_PAGE)
    .offset(offset)
}

export async function getTeamsCount(userId: string, eventId: number) {
  const result = await db
    .select({ count: count() })
    .from(teams)
    .where(and(eq(teams.userId, userId), eq(teams.eventId, eventId)))
  return result[0].count || 0
}

export async function createTeam(
  userId: string,
  eventId: number,
  data: { name: string; color?: string; country?: string | null; useCountry?: boolean }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del equipo es requerido')
  }

  const existing = await db
    .select()
    .from(teams)
    .where(and(eq(teams.userId, userId), eq(teams.eventId, eventId), eq(teams.name, data.name.trim())))
    .limit(1)
    .then(r => r[0])

  if (existing) {
    throw new Error('Este equipo ya existe')
  }

  await db.insert(teams).values({
    userId,
    eventId,
    name: data.name.trim(),
    color: data.color || '#4a9d67',
    country: data.useCountry ? data.country || null : null,
  })
}

export async function updateTeam(
  userId: string,
  eventId: number,
  teamId: number,
  data: { name: string; color?: string; country?: string | null; useCountry?: boolean }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del equipo es requerido')
  }

  const existing = await db
    .select()
    .from(teams)
    .where(and(eq(teams.userId, userId), eq(teams.eventId, eventId), eq(teams.name, data.name.trim())))
    .limit(1)
    .then(r => r[0])

  if (existing && existing.id !== teamId) {
    throw new Error('Este equipo ya existe')
  }

  await db
    .update(teams)
    .set({
      name: data.name.trim(),
      color: data.color || '#4a9d67',
      country: data.useCountry ? data.country || null : null,
      updatedAt: new Date(),
    })
    .where(and(eq(teams.userId, userId), eq(teams.eventId, eventId), eq(teams.id, teamId)))
}

export async function deleteTeam(userId: string, eventId: number, teamId: number) {
  // Unassign team from any campers first
  await db
    .update(attendees)
    .set({ teamId: null })
    .where(and(eq(attendees.userId, userId), eq(attendees.eventId, eventId), eq(attendees.teamId, teamId)))

  await db.delete(teams).where(and(eq(teams.userId, userId), eq(teams.eventId, eventId), eq(teams.id, teamId)))
}

export async function getTeamMemberCounts(userId: string, eventId: number) {
  const all = await db
    .select({ teamId: attendees.teamId })
    .from(attendees)
    .where(and(eq(attendees.userId, userId), eq(attendees.eventId, eventId)))
  const counts: Record<number, number> = {}
  for (const a of all) {
    if (a.teamId) counts[a.teamId] = (counts[a.teamId] || 0) + 1
  }
  return counts
}

export async function getTeamMembers(userId: string, eventId: number, teamId: number) {
  return db
    .select()
    .from(attendees)
    .where(and(eq(attendees.userId, userId), eq(attendees.eventId, eventId), eq(attendees.teamId, teamId)))
    .orderBy(asc(attendees.name))
}
