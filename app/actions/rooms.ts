'use server'

import { db } from '@/lib/db'
import { rooms, attendees } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getRooms(userId: string) {
  return await db.query.rooms.findMany({
    where: eq(rooms.userId, userId),
    orderBy: (rooms, { asc }) => [asc(rooms.name)],
  })
}

export async function createRoom(
  userId: string,
  data: { name: string; capacity?: number | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre de la habitación es requerido')
  }

  const existing = await db.query.rooms.findFirst({
    where: and(eq(rooms.userId, userId), eq(rooms.name, data.name.trim())),
  })

  if (existing) {
    throw new Error('Esta habitación ya existe')
  }

  await db.insert(rooms).values({
    userId,
    name: data.name.trim(),
    capacity: data.capacity ?? null,
  })
}

export async function updateRoom(
  userId: string,
  roomId: number,
  data: { name: string; capacity?: number | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre de la habitación es requerido')
  }

  const existing = await db.query.rooms.findFirst({
    where: and(eq(rooms.userId, userId), eq(rooms.name, data.name.trim())),
  })

  if (existing && existing.id !== roomId) {
    throw new Error('Esta habitación ya existe')
  }

  await db
    .update(rooms)
    .set({ name: data.name.trim(), capacity: data.capacity ?? null, updatedAt: new Date() })
    .where(and(eq(rooms.userId, userId), eq(rooms.id, roomId)))
}

export async function deleteRoom(userId: string, roomId: number) {
  // Unassign room from any campers first
  await db
    .update(attendees)
    .set({ roomId: null })
    .where(and(eq(attendees.userId, userId), eq(attendees.roomId, roomId)))

  await db.delete(rooms).where(and(eq(rooms.userId, userId), eq(rooms.id, roomId)))
}

export async function getRoomOccupancy(userId: string) {
  const all = await db.query.attendees.findMany({
    where: eq(attendees.userId, userId),
    columns: { roomId: true },
  })
  const counts: Record<number, number> = {}
  for (const a of all) {
    if (a.roomId) counts[a.roomId] = (counts[a.roomId] || 0) + 1
  }
  return counts
}
