'use server'

import { db } from '@/lib/db'
import { staff, staffPayments, Staff, NewStaff, StaffPayment } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getAllStaff(userId: string) {
  return db.select().from(staff).where(eq(staff.userId, userId))
}

export async function createStaff(userId: string, data: NewStaff) {
  const result = await db.insert(staff).values({ ...data, userId }).returning()
  return result[0]
}

export async function updateStaff(id: number, data: Partial<NewStaff>) {
  const result = await db.update(staff).set({ ...data, updatedAt: new Date() }).where(eq(staff.id, id)).returning()
  return result[0]
}

export async function deleteStaff(id: number) {
  await db.delete(staff).where(eq(staff.id, id))
}

export async function getStaffPayments(userId: string, staffId: number) {
  return db.select().from(staffPayments).where(and(eq(staffPayments.userId, userId), eq(staffPayments.staffId, staffId)))
}

export async function addStaffPayment(userId: string, staffId: number, amount: string, method: string, date: Date, notes?: string) {
  const staffMember = await db.select().from(staff).where(eq(staff.id, staffId)).then(r => r[0])
  if (!staffMember) throw new Error('Staff no encontrado')

  const currentPaid = parseFloat(staffMember.amountPaid as string)
  const newPaid = currentPaid + parseFloat(amount)
  const total = parseFloat(staffMember.totalAmount as string)
  const status = newPaid >= total ? 'paid' : newPaid > 0 ? 'partial' : 'pending'

  await db.insert(staffPayments).values({
    userId,
    staffId,
    amount: parseFloat(amount),
    paymentMethod: method,
    paymentDate: date,
    notes,
  })

  return updateStaff(staffId, {
    amountPaid: newPaid.toString(),
    status,
  })
}

export async function deleteStaffPayment(staffId: number, paymentId: number) {
  const payment = await db.select().from(staffPayments).where(eq(staffPayments.id, paymentId)).then(r => r[0])
  if (!payment) throw new Error('Pago no encontrado')

  const staffMember = await db.select().from(staff).where(eq(staff.id, staffId)).then(r => r[0])
  if (!staffMember) throw new Error('Staff no encontrado')

  const newPaid = Math.max(0, parseFloat(staffMember.amountPaid as string) - parseFloat(payment.amount as string))
  const total = parseFloat(staffMember.totalAmount as string)
  const status = newPaid >= total ? 'paid' : newPaid > 0 ? 'partial' : 'pending'

  await db.delete(staffPayments).where(eq(staffPayments.id, paymentId))

  return updateStaff(staffId, {
    amountPaid: newPaid.toString(),
    status,
  })
}

export async function toggleStaffCheckIn(id: number) {
  const member = await db.select().from(staff).where(eq(staff.id, id)).then(r => r[0])
  if (!member) throw new Error('Staff no encontrado')

  return updateStaff(id, {
    checkedIn: !member.checkedIn,
  })
}
