'use server'

import { db } from '@/lib/db'
import { eventQRCodes, events } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

/**
 * Generate or get QR code for event check-in
 * Uses qrserver.com API to generate QR image
 */
export async function getOrCreateEventQRCode(eventId: number) {
  // Buscar QR existente
  const existingQR = await db
    .select()
    .from(eventQRCodes)
    .where(eq(eventQRCodes.eventId, eventId))
    .limit(1)
    .then(r => r[0])

  if (existingQR && existingQR.status === 'active') {
    return existingQR
  }

  // Validar que evento existe
  const event = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)
    .then(r => r[0])

  if (!event) {
    throw new Error('Evento no encontrado')
  }

  // Generar código único
  const code = nanoid(16)
  const checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkin/${code}`

  // Generar QR usando qrserver.com (libre, sin credenciales)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(checkInUrl)}`

  // Guardar en BD
  const [qrCode] = await db
    .insert(eventQRCodes)
    .values({
      eventId,
      code,
      qrUrl,
      type: 'checkin',
      status: 'active',
    })
    .returning()

  return qrCode
}

/**
 * Get QR code data for an event
 */
export async function getEventQRCode(eventId: number) {
  return db
    .select()
    .from(eventQRCodes)
    .where(eq(eventQRCodes.eventId, eventId))
    .limit(1)
    .then(r => r[0])
}

/**
 * Validate QR code and return event info
 * Used when scanning QR
 */
export async function validateQRCode(code: string) {
  const qrCode = await db
    .select()
    .from(eventQRCodes)
    .where(eq(eventQRCodes.code, code))
    .limit(1)
    .then(r => r[0])

  if (!qrCode || qrCode.status !== 'active') {
    throw new Error('Código QR inválido')
  }

  // Get event details
  const event = await db
    .select()
    .from(events)
    .where(eq(events.id, qrCode.eventId))
    .limit(1)
    .then(r => r[0])

  if (!event) {
    throw new Error('Evento no encontrado')
  }

  return {
    eventId: event.id,
    eventName: event.name,
    qrCode,
  }
}
