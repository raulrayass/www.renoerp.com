'use server'

import { db } from '@/lib/db'
import { events, eventMembers } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

// Obtener todos los eventos donde el usuario es miembro O admin
export async function getUserEvents(userId: string) {
  // Buscar eventos donde el usuario está en eventMembers
  const memberEvents = await db
    .select({
      id: events.id,
      name: events.name,
      role: eventMembers.role,
    })
    .from(events)
    .innerJoin(eventMembers, and(
      eq(events.id, eventMembers.eventId),
      eq(eventMembers.userId, userId),
      eq(eventMembers.status, 'active')
    ))
    .orderBy(events.createdAt)

  // Buscar eventos donde el usuario es el admin
  const adminEvents = await db
    .select({
      id: events.id,
      name: events.name,
      role: sql<string>`'admin'`,
    })
    .from(events)
    .where(eq(events.adminId, userId))
    .orderBy(events.createdAt)

  // Combinar y eliminar duplicados
  const allEvents = [...memberEvents, ...adminEvents]
  const uniqueEvents = Array.from(
    new Map(allEvents.map(e => [e.id, e])).values()
  )
  
  return uniqueEvents
}

// Crear nuevo evento
export async function createEvent(
  userId: string,
  data: {
    name: string
    startDate?: string
    endDate?: string
    country?: string
    city?: string
  }
) {
  try {
    // Crear evento
    const eventResult = await db
      .insert(events)
      .values({
        name: data.name,
        adminId: userId,
        status: 'active',
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        country: data.country,
        city: data.city,
      })
      .returning({ id: events.id })

    const eventId = eventResult[0]?.id

    if (!eventId) {
      throw new Error('Failed to create event')
    }

    // Crear event_member para el admin
    await db
      .insert(eventMembers)
      .values({
        eventId,
        userId,
        role: 'admin',
        status: 'active',
      })

    return { id: eventId, name: data.name }
  } catch (error) {
    console.error('[Events] Error creating event:', error)
    throw error
  }
}

// Invitar persona a evento
export async function inviteToEvent(
  userId: string,
  eventId: number,
  inviteeEmail: string,
  role: 'leader' | 'coordinator' | 'viewer' = 'viewer'
) {
  try {
    // Verificar que el usuario es admin del evento
    const membership = await db
      .select()
      .from(eventMembers)
      .where(and(
        eq(eventMembers.eventId, eventId),
        eq(eventMembers.userId, userId),
        eq(eventMembers.role, 'admin')
      ))

    if (!membership || membership.length === 0) {
      throw new Error('Only event admin can invite members')
    }

    // Crear invitación (el invitado usará su userId real cuando se registre)
    // Por ahora, guardamos con email como identificador temporal
    await db
      .insert(eventMembers)
      .values({
        eventId,
        userId: inviteeEmail, // Será reemplazado cuando el usuario se registre
        role,
        status: 'pending',
      })

    return { success: true, message: `Invitation sent to ${inviteeEmail}` }
  } catch (error) {
    console.error('[Events] Error inviting member:', error)
    throw error
  }
}

// Actualizar rol de miembro
export async function updateMemberRole(
  userId: string,
  eventId: number,
  memberId: string,
  newRole: string
) {
  try {
    // Verificar que el usuario es admin
    const isAdmin = await db
      .select()
      .from(eventMembers)
      .where(and(
        eq(eventMembers.eventId, eventId),
        eq(eventMembers.userId, userId),
        eq(eventMembers.role, 'admin')
      ))

    if (!isAdmin || isAdmin.length === 0) {
      throw new Error('Only event admin can update roles')
    }

    // Actualizar rol
    await db
      .update(eventMembers)
      .set({ role: newRole })
      .where(and(
        eq(eventMembers.eventId, eventId),
        eq(eventMembers.userId, memberId)
      ))

    return { success: true }
  } catch (error) {
    console.error('[Events] Error updating member role:', error)
    throw error
  }
}

// Obtener miembros del evento
export async function getEventMembers(userId: string, eventId: number) {
  try {
    // Verificar que el usuario es miembro del evento
    const access = await db
      .select()
      .from(eventMembers)
      .where(and(
        eq(eventMembers.eventId, eventId),
        eq(eventMembers.userId, userId)
      ))

    if (!access || access.length === 0) {
      throw new Error('Access denied')
    }

    // Obtener todos los miembros
    const members = await db
      .select()
      .from(eventMembers)
      .where(eq(eventMembers.eventId, eventId))

    return members || []
  } catch (error) {
    console.error('[Events] Error fetching members:', error)
    throw error
  }
}