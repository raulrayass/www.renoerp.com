'use server'

import { db } from '@/lib/db'
import { staff, staffPayments, transactions, categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { desc } from 'drizzle-orm'

const STAFF_PER_PAGE = 20

// Get ALL staff for reports and metrics (no pagination)
export async function getAllStaff(userId: string) {
  return db
    .select()
    .from(staff)
    .where(eq(staff.userId, userId))
    .orderBy(desc(staff.createdAt))
}

// Get paginated staff for UI display
export async function getStaff(userId: string, page: number = 1) {
  const offset = (page - 1) * STAFF_PER_PAGE
  return db
    .select()
    .from(staff)
    .where(eq(staff.userId, userId))
    .orderBy(desc(staff.createdAt))
    .limit(STAFF_PER_PAGE)
    .offset(offset)
}

export async function getStaffCount(userId: string) {
  const result = await db
    .select({ count: db.sql`count(*)` })
    .from(staff)
    .where(eq(staff.userId, userId))
  return parseInt(result[0].count as string, 10)
}

export async function getStaffPayments(userId: string, staffId: number) {
  return db
    .select()
    .from(staffPayments)
    .where(and(eq(staffPayments.userId, userId), eq(staffPayments.staffId, staffId)))
    .orderBy(desc(staffPayments.createdAt))
}

export async function createStaff(
  userId: string,
  data: {
    name: string
    phone?: string
    church?: string
    ministry?: string
    role?: string
    isTeamLead?: boolean
    leadTeamId?: number | null
    totalAmount: number
    notes?: string
  }
) {
  await db.insert(staff).values({
    userId,
    name: data.name,
    phone: data.phone || '',
    church: data.church || '',
    ministry: data.ministry || '',
    role: data.role || '',
    isTeamLead: data.isTeamLead ?? false,
    leadTeamId: data.leadTeamId ?? null,
    totalAmount: parseFloat(data.totalAmount.toString()),
    status: 'pending',
    notes: data.notes || '',
  })
}

export async function updateStaff(
  userId: string,
  staffId: number,
  data: Partial<{
    name: string
    phone: string
    church: string
    ministry: string
    role: string
    isTeamLead: boolean
    leadTeamId: number | null
    totalAmount: number
    notes: string
  }>
) {
  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  }
  if (data.totalAmount !== undefined) {
    updateData.totalAmount = parseFloat(data.totalAmount.toString())
  }
  await db
    .update(staff)
    .set(updateData)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
}

export async function toggleCheckIn(userId: string, staffId: number, checkedIn: boolean) {
  await db
    .update(staff)
    .set({ checkedIn, updatedAt: new Date() })
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
}

export async function deleteStaff(userId: string, staffId: number) {
  // Delete all payments and transactions for this staff member
  const payments = await db
    .select()
    .from(staffPayments)
    .where(and(eq(staffPayments.userId, userId), eq(staffPayments.staffId, staffId)))

  for (const payment of payments) {
    await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'income'),
          eq(transactions.amount, payment.amount)
        )
      )
  }

  await db.delete(staffPayments).where(eq(staffPayments.staffId, staffId))
  await db.delete(staff).where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
}

export async function addStaffPayment(
  userId: string,
  staffId: number,
  amount: number,
  paymentDate: string,
  paymentMethod: string = 'cash',
  notes?: string
) {
  const [staffMember] = await db
    .select()
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))

  if (!staffMember) throw new Error('Miembro de staff no encontrado')

  // Validate payment doesn't exceed remaining amount
  const totalAmount = parseFloat(staffMember.totalAmount as string)
  const alreadyPaid = parseFloat(staffMember.amountPaid as string)
  const remaining = totalAmount - alreadyPaid

  if (amount > remaining) {
    throw new Error(
      `El monto excede lo faltante. Debe: $${remaining.toFixed(2)} de $${totalAmount.toFixed(2)}`
    )
  }

  // Create payment record
  await db.insert(staffPayments).values({
    staffId,
    userId,
    amount,
    paymentMethod,
    paymentDate,
    notes: notes || '',
  })

  // Update staff paid amount and status
  const newPaidAmount = alreadyPaid + amount
  const newStatus = newPaidAmount >= totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db
    .update(staff)
    .set({
      amountPaid: newPaidAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))

  // Find or create "Pago de Staff" category
  let [staffPaymentCat] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, 'Pago de Staff')))

  if (!staffPaymentCat) {
    const [newCat] = await db
      .insert(categories)
      .values({
        userId,
        name: 'Pago de Staff',
        type: 'income',
        color: '#3b82f6',
        icon: 'briefcase',
      })
      .returning()
    staffPaymentCat = newCat
  }

  // Create transaction for this payment
  await db.insert(transactions).values({
    userId,
    categoryId: staffPaymentCat!.id,
    type: 'income',
    amount,
    description: `Pago de ${staffMember.name}`,
    date: paymentDate,
  })
}

export async function deleteStaffPayment(userId: string, paymentId: number) {
  const [payment] = await db
    .select()
    .from(staffPayments)
    .where(and(eq(staffPayments.userId, userId), eq(staffPayments.id, paymentId)))

  if (!payment) throw new Error('Pago no encontrado')

  const [staffMember] = await db
    .select()
    .from(staff)
    .where(eq(staff.id, payment.staffId))

  if (!staffMember) throw new Error('Miembro de staff no encontrado')

  // Delete corresponding transaction
  await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        eq(transactions.amount, payment.amount),
        eq(transactions.description, `Pago de ${staffMember.name}`)
      )
    )

  // Update staff paid amount
  const newPaidAmount = Math.max(0, parseFloat(staffMember.amountPaid as string) - parseFloat(payment.amount as string))
  const totalAmount = parseFloat(staffMember.totalAmount as string)
  const newStatus = newPaidAmount >= totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db
    .update(staff)
    .set({
      amountPaid: newPaidAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(staff.id, payment.staffId))

  // Delete payment
  await db.delete(staffPayments).where(eq(staffPayments.id, paymentId))
}

export async function bulkCreateStaff(
  userId: string,
  staffList: Array<{
    name: string
    age?: number
    sex?: string
    shirtSize?: string
    phone?: string
    church?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyContactName2?: string
    emergencyContactPhone2?: string
    allergies?: string
    totalAmount: number
    notes?: string
  }>
) {
  if (staffList.length === 0) return

  // Insert staff
  await db.insert(staff).values(
    staffList.map((s) => ({
      userId,
      name: s.name?.trim() || 'Sin nombre',
      age: s.age ?? null,
      sex: s.sex?.trim() || null,
      shirtSize: s.shirtSize?.trim() || null,
      phone: s.phone?.trim() || '',
      church: s.church?.trim() || '',
      emergencyContactName: s.emergencyContactName?.trim() || '',
      emergencyContactPhone: s.emergencyContactPhone?.trim() || '',
      emergencyContactName2: s.emergencyContactName2?.trim() || '',
      emergencyContactPhone2: s.emergencyContactPhone2?.trim() || '',
      allergies: s.allergies?.trim() || '',
      totalAmount: Math.max(0, parseFloat(s.totalAmount?.toString() || '0')),
      amountPaid: 0,
      status: 'pending',
      notes: s.notes?.trim() || '',
    }))
  )
}

export async function bulkDeleteStaff(userId: string, staffIds: number[]) {
  // Delete all payments and transactions for these staff members
  for (const staffId of staffIds) {
    const payments = await db
      .select()
      .from(staffPayments)
      .where(and(eq(staffPayments.userId, userId), eq(staffPayments.staffId, staffId)))

    for (const payment of payments) {
      await db
        .delete(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, 'income'),
            eq(transactions.amount, payment.amount)
          )
        )
    }

    await db.delete(staffPayments).where(eq(staffPayments.staffId, staffId))
  }

  // Delete staff members
  await db.delete(staff).where(and(eq(staff.userId, userId), db.sql`${staff.id} IN (${db.sql.join(staffIds)})`))
}
