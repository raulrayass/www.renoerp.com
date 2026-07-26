'use server'

import { db } from '@/lib/db'
import { invitationLinks, attendees, events } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { nanoid } from 'nanoid'

/**
 * Create invitation link for event
 * Generates a unique token for public registration
 */
export async function createInvitationLink(
  eventId: number,
  createdBy: string,
  options?: {
    expiresAt?: Date
    maxUses?: number
  }
) {
  // Validar que el evento existe
  const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1).then(r => r[0])
  
  if (!event) {
    throw new Error('Evento no encontrado')
  }

  // Generar código único
  const code = nanoid(12)

  const [link] = await db
    .insert(invitationLinks)
    .values({
      eventId,
      code,
      createdBy,
      expiresAt: options?.expiresAt || null,
      maxUses: options?.maxUses || null,
    })
    .returning()

  return {
    ...link,
    invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/${code}`,
  }
}

/**
 * Register attendee via invitation link
 * Public action - no auth required
 */
export async function registerViaLink(
  code: string,
  attendeeData: {
    name: string
    age?: number | null
    sex?: string
    phone?: string
    church?: string
    shirtSize?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    allergies?: string
  }
) {
  // Buscar link válido
  const link = await db
    .select()
    .from(invitationLinks)
    .where(and(
      eq(invitationLinks.code, code),
      eq(invitationLinks.status, 'active')
    ))
    .limit(1)
    .then(r => r[0])

  if (!link) {
    throw new Error('Link de invitación inválido o expirado')
  }

  // Validar expiración
  if (link.expiresAt && new Date() > link.expiresAt) {
    await db.update(invitationLinks).set({ status: 'expired' }).where(eq(invitationLinks.id, link.id))
    throw new Error('Link de invitación expirado')
  }

  // Validar límite de usos
  if (link.maxUses && link.currentUses >= link.maxUses) {
    throw new Error('Link de invitación agotado')
  }

  // Validar evento
  const event = await db
    .select()
    .from(events)
    .where(eq(events.id, link.eventId))
    .limit(1)
    .then(r => r[0])

  if (!event) {
    throw new Error('Evento no encontrado')
  }

  // Crear campero
  const [newAttendee] = await db
    .insert(attendees)
    .values({
      eventId: link.eventId,
      userId: link.createdBy, // El admin que creó el link
      name: attendeeData.name,
      age: attendeeData.age || null,
      sex: attendeeData.sex || null,
      phone: attendeeData.phone || '',
      church: attendeeData.church || '',
      shirtSize: attendeeData.shirtSize || null,
      emergencyContactName: attendeeData.emergencyContactName || '',
      emergencyContactPhone: attendeeData.emergencyContactPhone || '',
      allergies: attendeeData.allergies || '',
      status: 'pending',
    })
    .returning()

  // Incrementar contador de usos
  await db
    .update(invitationLinks)
    .set({ currentUses: link.currentUses + 1 })
    .where(eq(invitationLinks.id, link.id))

  return newAttendee
}

/**
 * Get all invitation links for an event
 */
export async function getInvitationLinks(eventId: number) {
  return db
    .select()
    .from(invitationLinks)
    .where(eq(invitationLinks.eventId, eventId))
    .orderBy((t) => t.createdAt)
}

/**
 * Disable invitation link
 */
export async function disableInvitationLink(linkId: number) {
  await db
    .update(invitationLinks)
    .set({ status: 'disabled' })
    .where(eq(invitationLinks.id, linkId))
}
