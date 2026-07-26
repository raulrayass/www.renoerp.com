import { z } from 'zod'

// Attendee validation
export const attendeeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Nombre muy largo'),
  age: z.string().optional(),
  shirtSize: z.string().optional(),
  sex: z.string().optional(),
  phone: z.string().optional(),
  church: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  roomId: z.string().optional(),
  teamId: z.string().optional(),
})

export type AttendeeInput = z.infer<typeof attendeeSchema>

// Game validation
export const gameSchema = z.object({
  name: z.string().min(2, 'El nombre del juego debe tener al menos 2 caracteres').max(100),
  description: z.string().optional(),
  gameDate: z.string().optional(),
})

export type GameInput = z.infer<typeof gameSchema>

// Team validation
export const teamSchema = z.object({
  name: z.string().min(2, 'El nombre del equipo debe tener al menos 2 caracteres').max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido').optional(),
  country: z.string().optional(),
})

export type TeamInput = z.infer<typeof teamSchema>

// Payment validation
export const paymentSchema = z.object({
  amount: z.number().positive('El monto debe ser mayor a 0'),
  method: z.enum(['efectivo', 'transferencia', 'tarjeta']).optional(),
  notes: z.string().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

// Transaction validation
export const transactionSchema = z.object({
  amount: z.number().positive('El monto debe ser mayor a 0'),
  type: z.enum(['ingreso', 'egreso']),
  category: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().optional(),
  method: z.enum(['efectivo', 'transferencia', 'tarjeta']).optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>

// Helper function to format Zod errors
export function formatZodError(error: z.ZodError): string {
  const firstError = error.errors[0]
  return firstError.message
}
