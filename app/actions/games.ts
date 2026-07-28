'use server'

import { db } from '@/lib/db'
import { games, gameScores, teams } from '@/lib/db/schema'
import { eq, and, desc, count, asc } from 'drizzle-orm'

const GAMES_PER_PAGE = 15

// Get ALL games for leaderboard and calculations (no pagination)
export async function getAllGames(userId: string, eventId: number) {
  return db
    .select()
    .from(games)
    .where(and(eq(games.userId, userId), eq(games.eventId, eventId)))
    .orderBy(desc(games.createdAt))
}

export async function getGames(userId: string, eventId: number, page: number = 1) {
  const offset = (page - 1) * GAMES_PER_PAGE
  return db
    .select()
    .from(games)
    .where(and(eq(games.userId, userId), eq(games.eventId, eventId)))
    .orderBy(desc(games.createdAt))
    .limit(GAMES_PER_PAGE)
    .offset(offset)
}

export async function getGamesCount(userId: string, eventId: number) {
  const result = await db
    .select({ count: count() })
    .from(games)
    .where(and(eq(games.userId, userId), eq(games.eventId, eventId)))
  return result[0].count || 0
}

export async function createGame(
  userId: string,
  eventId: number,
  data: { name: string; description?: string; gameDate?: string | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del juego es requerido')
  }
  const [created] = await db
    .insert(games)
    .values({
      userId,
      eventId,
      name: data.name.trim(),
      description: data.description || '',
      gameDate: data.gameDate || null,
    })
    .returning()
  return created
}

export async function updateGame(
  userId: string,
  eventId: number,
  gameId: number,
  data: { name: string; description?: string; gameDate?: string | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del juego es requerido')
  }
  await db
    .update(games)
    .set({
      name: data.name.trim(),
      description: data.description || '',
      gameDate: data.gameDate || null,
      updatedAt: new Date(),
    })
    .where(and(eq(games.userId, userId), eq(games.eventId, eventId), eq(games.id, gameId)))
}

export async function deleteGame(userId: string, eventId: number, gameId: number) {
  await db.delete(gameScores).where(and(eq(gameScores.userId, userId), eq(gameScores.eventId, eventId), eq(gameScores.gameId, gameId)))
  await db.delete(games).where(and(eq(games.userId, userId), eq(games.eventId, eventId), eq(games.id, gameId)))
}

export async function getAllGameScores(userId: string, eventId: number) {
  return db
    .select()
    .from(gameScores)
    .where(and(eq(gameScores.userId, userId), eq(gameScores.eventId, eventId)))
}

export async function getGameScores(userId: string, eventId: number, gameId: number) {
  return db
    .select()
    .from(gameScores)
    .where(and(eq(gameScores.userId, userId), eq(gameScores.eventId, eventId), eq(gameScores.gameId, gameId)))
}

// Add points for a team in a specific game (accumulative)
export async function addGameScore(userId: string, eventId: number, gameId: number, teamId: number, points: number) {
  if (points === 0) return
  await db.insert(gameScores).values({
    userId,
    eventId,
    gameId,
    teamId,
    points,
  })
}

// Set (upsert) the points a team earned in a specific game
export async function setGameScore(userId: string, eventId: number, gameId: number, teamId: number, points: number) {
  const existing = await db
    .select()
    .from(gameScores)
    .where(and(
      eq(gameScores.userId, userId),
      eq(gameScores.eventId, eventId),
      eq(gameScores.gameId, gameId),
      eq(gameScores.teamId, teamId)
    ))
    .limit(1)
    .then(r => r[0])

  if (existing) {
    await db
      .update(gameScores)
      .set({ points })
      .where(eq(gameScores.id, existing.id))
  } else {
    await db.insert(gameScores).values({ userId, eventId, gameId, teamId, points })
  }
}

export async function deleteGameScore(userId: string, eventId: number, scoreId: number) {
  await db
    .delete(gameScores)
    .where(and(eq(gameScores.userId, userId), eq(gameScores.eventId, eventId), eq(gameScores.id, scoreId)))
}

// Leaderboard: total points per team across all games in this event
export async function getLeaderboard(userId: string, eventId: number) {
  const allTeams = await db
    .select()
    .from(teams)
    .where(and(eq(teams.userId, userId), eq(teams.eventId, eventId)))
    .orderBy(asc(teams.name))

  const allScores = await db
    .select()
    .from(gameScores)
    .where(and(eq(gameScores.userId, userId), eq(gameScores.eventId, eventId)))

  const totals: Record<number, number> = {}
  for (const s of allScores) {
    totals[s.teamId] = (totals[s.teamId] || 0) + s.points
  }

  return allTeams
    .map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      totalPoints: totals[t.id] || 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
}
