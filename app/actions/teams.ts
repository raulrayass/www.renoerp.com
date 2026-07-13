'use server'

import { db } from '@/lib/db'
import { teams, attendees } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const TEAMS_PER_PAGE = 20

// Get ALL teams (no pagination)
export async function getAllTeams(userId: string) {
  return await db.query.teams.findMany({
    where: eq(teams.userId, userId),
    orderBy: (teams, { asc }) => [asc(teams.name)],
  })
}

export async function getTeams(userId: string, page: number = 1) {
  const offset = (page - 1) * TEAMS_PER_PAGE
  return await db.query.teams.findMany({
    where: eq(teams.userId, userId),
    orderBy: (teams, { asc }) => [asc(teams.name)],
    limit: TEAMS_PER_PAGE,
    offset: offset,
  })
}

export async function getTeamsCount(userId: string) {
  const result = await db
    .select({ count: db.sql`count(*)` })
    .from(teams)
    .where(eq(teams.userId, userId))
  return parseInt(result[0].count as string, 10)
}

export async function createTeam(
  userId: string,
  name: string,
  color: string = '#4a9d67'
) {
  if (!name.trim()) {
    throw new Error('El nombre del equipo es requerido')
  }

  const existing = await db.query.teams.findFirst({
    where: and(eq(teams.userId, userId), eq(teams.name, name.trim())),
  })

  if (existing) {
    throw new Error('Este equipo ya existe')
  }

  await db.insert(teams).values({
    userId,
    name: name.trim(),
    color: color || '#4a9d67',
  })
}

export async function updateTeam(
  teamId: number,
  name: string,
  color: string = '#4a9d67'
) {
  if (!name.trim()) {
    throw new Error('El nombre del equipo es requerido')
  }

  await db
    .update(teams)
    .set({ name: name.trim(), color: color || '#4a9d67', updatedAt: new Date() })
    .where(eq(teams.id, teamId))
}

export async function deleteTeam(teamId: number) {
  // Unassign team from any campers first
  await db
    .update(attendees)
    .set({ teamId: null })
    .where(eq(attendees.teamId, teamId))

  await db.delete(teams).where(eq(teams.id, teamId))
}

export async function getTeamMemberCounts(userId: string) {
  const all = await db.query.attendees.findMany({
    where: eq(attendees.userId, userId),
    columns: { teamId: true },
  })
  const counts: Record<number, number> = {}
  for (const a of all) {
    if (a.teamId) counts[a.teamId] = (counts[a.teamId] || 0) + 1
  }
  return counts
}

export async function getTeamMembers(teamId: number) {
  return await db.query.attendees.findMany({
    where: eq(attendees.teamId, teamId),
    orderBy: (attendees, { asc }) => [asc(attendees.name)],
  })
}
