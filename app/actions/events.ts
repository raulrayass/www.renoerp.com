'use server'

import { db } from '@/lib/db'
import { events, eventMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const EVENTS_PER_PAGE = 10

// Get all events for a user (both owned and member of)
export async function getUserEvents(userId: string) {
  const ownedEvents = await db
    .select()
    .from(events)
    .where(eq(events.userId, userId))
    .orderBy((events) => events.startDate)

  const memberEvents = await db
    .select({
      id: events.id,
      userId: events.userId,
      name: events.name,
      description: events.description,
      startDate: events.startDate,
      endDate: events.endDate,
      location: events.location,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
    })
    .from(events)
    .innerJoin(eventMembers, eq(events.id, eventMembers.eventId))
    .where(and(eq(eventMembers.userId, userId), eq(eventMembers.role, 'member')))
    .orderBy((events) => events.startDate)

  // Combine and deduplicate
  const allEvents = [...ownedEvents, ...memberEvents]
  const uniqueEvents = Array.from(new Map(allEvents.map((e) => [e.id, e])).values())
  return uniqueEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

// Get a single event
export async function getEvent(userId: string, eventId: number) {
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId)))

  if (!event) {
    throw new Error('Evento no encontrado')
  }

  // Verify user has access (is owner or member)
  if (event.userId !== userId) {
    const membership = await db
      .select()
      .from(eventMembers)
      .where(and(eq(eventMembers.eventId, eventId), eq(eventMembers.userId, userId)))
      .limit(1)

    if (membership.length === 0) {
      throw new Error('No tienes acceso a este evento')
    }
  }

  return event
}

// Create a new event
export async function createEvent(
  userId: string,
  data: {
    name: string
    description?: string
    startDate: string
    endDate: string
    location?: string
  }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del evento es requerido')
  }

  const [newEvent] = await db
    .insert(events)
    .values({
      userId,
      name: data.name.trim(),
      description: data.description || null,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location || null,
    })
    .returning()

  // Create event member for the creator (admin)
  await db.insert(eventMembers).values({
    eventId: newEvent.id,
    userId,
    role: 'admin',
  })

  return newEvent
}

// Update an event
export async function updateEvent(
  userId: string,
  eventId: number,
  data: {
    name: string
    description?: string
    startDate: string
    endDate: string
    location?: string
  }
) {
  // Verify user is owner
  const [event] = await db.select().from(events).where(eq(events.id, eventId))

  if (!event) {
    throw new Error('Evento no encontrado')
  }

  if (event.userId !== userId) {
    throw new Error('Solo el propietario puede editar este evento')
  }

  if (!data.name.trim()) {
    throw new Error('El nombre del evento es requerido')
  }

  await db
    .update(events)
    .set({
      name: data.name.trim(),
      description: data.description || null,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location || null,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId))
}

// Delete an event
export async function deleteEvent(userId: string, eventId: number) {
  // Verify user is owner
  const [event] = await db.select().from(events).where(eq(events.id, eventId))

  if (!event) {
    throw new Error('Evento no encontrado')
  }

  if (event.userId !== userId) {
    throw new Error('Solo el propietario puede eliminar este evento')
  }

  // Delete all event members
  await db.delete(eventMembers).where(eq(eventMembers.eventId, eventId))

  // Delete the event
  await db.delete(events).where(eq(events.id, eventId))
}

// Get event members
export async function getEventMembers(userId: string, eventId: number) {
  // Verify user has access to event
  const [event] = await db.select().from(events).where(eq(events.id, eventId))

  if (!event || (event.userId !== userId && event.userId !== userId)) {
    throw new Error('No tienes acceso a este evento')
  }

  return db
    .select()
    .from(eventMembers)
    .where(eq(eventMembers.eventId, eventId))
}

// Add a member to an event
export async function addEventMember(userId: string, eventId: number, memberUserId: string, role: string = 'member') {
  // Verify user is owner
  const [event] = await db.select().from(events).where(eq(events.id, eventId))

  if (!event || event.userId !== userId) {
    throw new Error('Solo el propietario puede agregar miembros')
  }

  // Check if member already exists
  const existing = await db
    .select()
    .from(eventMembers)
    .where(and(eq(eventMembers.eventId, eventId), eq(eventMembers.userId, memberUserId)))
    .limit(1)

  if (existing.length > 0) {
    throw new Error('Este usuario ya es miembro del evento')
  }

  await db.insert(eventMembers).values({
    eventId,
    userId: memberUserId,
    role,
  })
}

// Remove a member from an event
export async function removeEventMember(userId: string, eventId: number, memberUserId: string) {
  // Verify user is owner
  const [event] = await db.select().from(events).where(eq(events.id, eventId))

  if (!event || event.userId !== userId) {
    throw new Error('Solo el propietario puede remover miembros')
  }

  await db.delete(eventMembers).where(and(eq(eventMembers.eventId, eventId), eq(eventMembers.userId, memberUserId)))
}
