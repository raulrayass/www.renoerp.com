'use server'

import { db } from '@/lib/db'
import { churches } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

const CHURCHES_PER_PAGE = 25

// Get ALL churches (no pagination)
export async function getAllChurches(userId: string, eventId: number) {
  return db
    .select()
    .from(churches)
    .where(and(eq(churches.userId, userId), eq(churches.eventId, eventId)))
    .orderBy(asc(churches.name))
}

export async function getChurches(userId: string, eventId: number, page: number = 1) {
  const offset = (page - 1) * CHURCHES_PER_PAGE
  return db
    .select()
    .from(churches)
    .where(and(eq(churches.userId, userId), eq(churches.eventId, eventId)))
    .orderBy(asc(churches.name))
    .limit(CHURCHES_PER_PAGE)
    .offset(offset)
}

export async function getChurchesCount(userId: string, eventId: number) {
  const result = await db
    .select({ count: db.sql`count(*)` })
    .from(churches)
    .where(and(eq(churches.userId, userId), eq(churches.eventId, eventId)))
  return parseInt(result[0].count as string, 10)
}

export async function createChurch(userId: string, eventId: number, name: string) {
  if (!name.trim()) {
    throw new Error('El nombre de la iglesia es requerido')
  }

  // Check if church already exists
  const existing = await db.query.churches.findFirst({
    where: and(eq(churches.userId, userId), eq(churches.eventId, eventId), eq(churches.name, name.trim())),
  })

  if (existing) {
    throw new Error('Esta iglesia ya existe')
  }

  await db.insert(churches).values({
    userId,
    eventId,
    name: name.trim(),
  })
}

export async function updateChurch(userId: string, eventId: number, churchId: number, name: string) {
  if (!name.trim()) {
    throw new Error('El nombre de la iglesia es requerido')
  }

  // Check if new name already exists (but allow same name)
  const existing = await db.query.churches.findFirst({
    where: and(eq(churches.userId, userId), eq(churches.eventId, eventId), eq(churches.name, name.trim())),
  })

  if (existing && existing.id !== churchId) {
    throw new Error('Esta iglesia ya existe')
  }

  await db
    .update(churches)
    .set({
      name: name.trim(),
      updatedAt: new Date(),
    })
    .where(and(eq(churches.userId, userId), eq(churches.eventId, eventId), eq(churches.id, churchId)))
}

export async function deleteChurch(userId: string, eventId: number, churchId: number) {
  await db.delete(churches).where(and(eq(churches.userId, userId), eq(churches.eventId, eventId), eq(churches.id, churchId)))
}
