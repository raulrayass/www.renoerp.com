'use server'

import { db } from '@/lib/db'
import { staff, staffPayments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { NewStaff, NewStaffPayment } from '@/lib/db/schema'

export const MINISTRIES = [
  'Deportes',
  'Cocina',
  'Pastor@',
  'Lider de equipo',
  'Logistica',
  'Administración',
  'Multimendia',
]

export async function getStaff(userId: string) {
  return await db
    .select()
    .from(staff)
    .where(eq(staff.userId, userId))
}

export async function createStaff(userId: string, data: NewStaff) {
  const result = await db
    .insert(staff)
    .values({ ...data, userId })
    .returning()
  return result[0]
}

export async function updateStaff(staffId: number, data: Partial<NewStaff>) {
  const result = await db
    .update(staff)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(staff.id, staffId))
    .returning()
  return result[0]
}

export async function deleteStaff(staffId: number) {
  await db.delete(staff).where(eq(staff.id, staffId))
  await db.delete(staffPayments).where(eq(staffPayments.staffId, staffId))
}

export async function addStaffPayment(userId: string, staffId: number, data: NewStaffPayment) {
  const result = await db
    .insert(staffPayments)
    .values({ ...data, staffId, userId })
    .returning()

  // Update staff record with new payment info
  const payments = await db
    .select()
    .from(staffPayments)
    .where(eq(staffPayments.staffId, staffId))

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount as string), 0)
  const staffRecord = await db
    .select()
    .from(staff)
    .where(eq(staff.id, staffId))
    .then(r => r[0])

  if (staffRecord) {
    const remaining = parseFloat(staffRecord.totalAmount as string) - totalPaid
    const newStatus = totalPaid === 0 ? 'pending' : totalPaid >= parseFloat(staffRecord.totalAmount as string) ? 'paid' : 'partial'
    await updateStaff(staffId, {
      amountPaid: totalPaid.toString(),
      status: newStatus,
    })
  }

  return result[0]
}

export async function deleteStaffPayment(paymentId: number) {
  const payment = await db
    .select()
    .from(staffPayments)
    .where(eq(staffPayments.id, paymentId))
    .then(r => r[0])

  if (!payment) return

  await db.delete(staffPayments).where(eq(staffPayments.id, paymentId))

  // Recalculate totals
  const payments = await db
    .select()
    .from(staffPayments)
    .where(eq(staffPayments.staffId, payment.staffId))

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount as string), 0)
  const staffRecord = await db
    .select()
    .from(staff)
    .where(eq(staff.id, payment.staffId))
    .then(r => r[0])

  if (staffRecord) {
    const newStatus = totalPaid === 0 ? 'pending' : totalPaid >= parseFloat(staffRecord.totalAmount as string) ? 'paid' : 'partial'
    await updateStaff(payment.staffId, {
      amountPaid: totalPaid.toString(),
      status: newStatus,
    })
  }
}

export async function getStaffPayments(staffId: number) {
  return await db
    .select()
    .from(staffPayments)
    .where(eq(staffPayments.staffId, staffId))
}
