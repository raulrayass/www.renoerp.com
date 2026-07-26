'use server'

import { db } from '@/lib/db'
import { checkIns, attendees, events } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Record a check-in for an attendee
 * Valida que el evento esté activo y dentro de fechas
 */
export async function recordCheckIn(
  eventId: number,
  attendeeId: number,
  userId: string,
  notes?: string
) {
  // Validar que el evento existe y está activo
  const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1).then(r => r[0])
  
  if (!event) {
    throw new Error('Evento no encontrado')
  }

  if (event.status !== 'active') {
    throw new Error('El evento no está activo')
  }

  // Validar fechas
  const now = new Date()
  const startDate = event.startDate ? new Date(event.startDate) : null
  const endDate = event.endDate ? new Date(event.endDate) : null

  if (startDate && now < startDate) {
    throw new Error('El campamento aún no ha comenzado')
  }

  if (endDate && now > endDate) {
    throw new Error('El campamento ya ha finalizado')
  }

  // Validar que el attendee existe
  const attendee = await db
    .select()
    .from(attendees)
    .where(and(eq(attendees.id, attendeeId), eq(attendees.eventId, eventId)))
    .limit(1)
    .then(r => r[0])

  if (!attendee) {
    throw new Error('Campero no encontrado en este evento')
  }

  // Registrar check-in
  const [checkIn] = await db
    .insert(checkIns)
    .values({
      eventId,
      attendeeId,
      userId,
      checkInType: 'arrival',
      notes: notes || null,
    })
    .returning()

  // Actualizar attendee con checkInTime si es el primer check-in
  if (!attendee.checkedIn) {
    await db
      .update(attendees)
      .set({
        checkedIn: true,
        checkInTime: new Date(),
      })
      .where(eq(attendees.id, attendeeId))
  }

  return checkIn
}

/**
 * Get attendance report for an event
 */
export async function getAttendanceReport(eventId: number, userId: string) {
  // Get all attendees for the event
  const eventAttendees = await db
    .select()
    .from(attendees)
    .where(eq(attendees.eventId, eventId))

  const totalAttendees = eventAttendees.length
  const checkedInCount = eventAttendees.filter(a => a.checkedIn).length
  const noShowCount = totalAttendees - checkedInCount

  return {
    totalAttendees,
    checkedInCount,
    noShowCount,
    attendees: eventAttendees.map(a => ({
      id: a.id,
      name: a.name,
      checkedIn: a.checkedIn,
      checkInTime: a.checkInTime,
      team: a.teamId,
      church: a.church,
    })),
  }
}

/**
 * Get check-in history for an attendee
 */
export async function getAttendeeCheckIns(eventId: number, attendeeId: number) {
  return db
    .select()
    .from(checkIns)
    .where(and(eq(checkIns.eventId, eventId), eq(checkIns.attendeeId, attendeeId)))
    .orderBy((t) => t.createdAt)
}
