'use server'

import { db } from '@/lib/db'
import { teams, attendees } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getTeams(userId: string) {
  return await db.query.teams.findMany({
    where: eq(teams.userId, userId),
    orderBy: (teams, { asc }) => [asc(teams.name)],
  })
}

export async function createTeam(
  userId: string,
  data: { name: string; color?: string }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del equipo es requerido')
  }

  const existing = await db.query.teams.findFirst({
    where: and(eq(teams.userId, userId), eq(teams.name, data.name.trim())),
  })

  if (existing) {
    throw new Error('Este equipo ya existe')
  }

  await db.insert(teams).values({
    userId,
    name: data.name.trim(),
    color: data.color || '#4a9d67',
  })
}

export async function updateTeam(
  userId: string,
  teamId: number,
  data: { name: string; color?: string }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del equipo es requerido')
  }

  const existing = await db.query.teams.findFirst({
    where: and(eq(teams.userId, userId), eq(teams.name, data.name.trim())),
  })

  if (existing && existing.id !== teamId) {
    throw new Error('Este equipo ya existe')
  }

  await db
    .update(teams)
    .set({ name: data.name.trim(), color: data.color || '#4a9d67', updatedAt: new Date() })
    .where(and(eq(teams.userId, userId), eq(teams.id, teamId)))
}

export async function deleteTeam(userId: string, teamId: number) {
  // Unassign team from any campers first
  await db
    .update(attendees)
    .set({ teamId: null })
    .where(and(eq(attendees.userId, userId), eq(attendees.teamId, teamId)))

  await db.delete(teams).where(and(eq(teams.userId, userId), eq(teams.id, teamId)))
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
