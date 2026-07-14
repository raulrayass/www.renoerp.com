'use server'

import { db } from '@/lib/db'
import { staff, staffPayments } from '@/lib/db/schema'
import { eq, and, asc, desc } from 'drizzle-orm'

const STAFF_PER_PAGE = 20

export async function getAllStaff(userId: string) {
  return db
    .select()
    .from(staff)
    .where(eq(staff.userId, userId))
    .orderBy(asc(staff.name))
}

export async function getStaff(userId: string, page: number = 1) {
  const offset = (page - 1) * STAFF_PER_PAGE
  return db
    .select()
    .from(staff)
    .where(eq(staff.userId, userId))
    .orderBy(asc(staff.name))
    .limit(STAFF_PER_PAGE)
    .offset(offset)
}

export async function createStaff(
  userId: string,
  data: {
    name: string
    age?: number
    shirtSize?: string
    sex?: string
    phone?: string
    churchId?: number
    category: string
    leadTeamId?: number
    totalAmount?: number
  }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del staff es requerido')
  }

  if (!data.category) {
    throw new Error('La categoría del staff es requerida')
  }

  const newStaff = await db.insert(staff).values({
    userId,
    name: data.name.trim(),
    age: data.age,
    shirtSize: data.shirtSize,
    sex: data.sex,
    phone: data.phone,
    churchId: data.churchId,
    category: data.category,
    leadTeamId: data.leadTeamId,
    totalAmount: data.totalAmount?.toString() || '0',
    status: 'pending',
  }).returning()

  return newStaff[0]
}

export async function updateStaff(
  userId: string,
  staffId: number,
  data: {
    name?: string
    age?: number
    shirtSize?: string
    sex?: string
    phone?: string
    churchId?: number
    category?: string
    leadTeamId?: number
    totalAmount?: number
    checkedIn?: boolean
  }
) {
  const existingStaff = await db
    .select()
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
    .limit(1)
    .then(r => r[0])

  if (!existingStaff) throw new Error('Staff no encontrado')

  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.age !== undefined) updateData.age = data.age
  if (data.shirtSize !== undefined) updateData.shirtSize = data.shirtSize
  if (data.sex !== undefined) updateData.sex = data.sex
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.churchId !== undefined) updateData.churchId = data.churchId
  if (data.category !== undefined) updateData.category = data.category
  if (data.leadTeamId !== undefined) updateData.leadTeamId = data.leadTeamId
  if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount.toString()
  if (data.checkedIn !== undefined) updateData.checkedIn = data.checkedIn
  updateData.updatedAt = new Date()

  await db
    .update(staff)
    .set(updateData)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))

  return db
    .select()
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
    .then(r => r[0])
}

export async function deleteStaff(userId: string, staffId: number) {
  const existingStaff = await db
    .select()
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
    .limit(1)
    .then(r => r[0])

  if (!existingStaff) throw new Error('Staff no encontrado')

  await db
    .delete(staffPayments)
    .where(eq(staffPayments.staffId, staffId))

  await db
    .delete(staff)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
}

export async function addStaffPayment(
  userId: string,
  staffId: number,
  data: { amount: number; paymentMethod: string; notes?: string }
) {
  const existingStaff = await db
    .select()
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
    .limit(1)
    .then(r => r[0])

  if (!existingStaff) throw new Error('Staff no encontrado')

  const originalTotal = parseFloat(existingStaff.totalAmount as string)
  const alreadyPaid = parseFloat(existingStaff.amountPaid as string)
  const remaining = originalTotal - alreadyPaid

  if (data.amount > remaining) {
    throw new Error(`No se puede registrar más de ${remaining}`)
  }

  const payment = await db
    .insert(staffPayments)
    .values({
      userId,
      staffId,
      amount: data.amount.toString(),
      paymentMethod: data.paymentMethod,
      paymentDate: new Date(),
      notes: data.notes,
    })
    .returning()

  const newPaidAmount = alreadyPaid + data.amount
  const newStatus = newPaidAmount >= originalTotal ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db
    .update(staff)
    .set({
      amountPaid: newPaidAmount.toString(),
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))

  return payment[0]
}

export async function deleteStaffPayment(userId: string, paymentId: number) {
  const payment = await db
    .select()
    .from(staffPayments)
    .where(eq(staffPayments.id, paymentId))
    .limit(1)
    .then(r => r[0])

  if (!payment) throw new Error('Pago no encontrado')

  const staffMember = await db
    .select()
    .from(staff)
    .where(eq(staff.id, payment.staffId))
    .limit(1)
    .then(r => r[0])

  if (!staffMember || staffMember.userId !== userId) {
    throw new Error('No autorizado')
  }

  const newPaidAmount = Math.max(
    0,
    parseFloat(staffMember.amountPaid as string) - parseFloat(payment.amount as string)
  )
  const originalTotal = parseFloat(staffMember.totalAmount as string)
  const newStatus = newPaidAmount >= originalTotal ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db.delete(staffPayments).where(eq(staffPayments.id, paymentId))

  await db
    .update(staff)
    .set({
      amountPaid: newPaidAmount.toString(),
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(staff.id, payment.staffId))
}

export async function getStaffPayments(userId: string, staffId: number) {
  const staffMember = await db
    .select()
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
    .limit(1)
    .then(r => r[0])

  if (!staffMember) throw new Error('Staff no encontrado')

  return db
    .select()
    .from(staffPayments)
    .where(eq(staffPayments.staffId, staffId))
    .orderBy(desc(staffPayments.paymentDate))
}

export async function toggleStaffCheckIn(userId: string, staffId: number) {
  const staffMember = await db
    .select()
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
    .limit(1)
    .then(r => r[0])

  if (!staffMember) throw new Error('Staff no encontrado')

  const newCheckedIn = !staffMember.checkedIn

  await db
    .update(staff)
    .set({
      checkedIn: newCheckedIn,
      updatedAt: new Date(),
    })
    .where(eq(staff.id, staffId))

  return db
    .select()
    .from(staff)
    .where(eq(staff.id, staffId))
    .then(r => r[0])
}
