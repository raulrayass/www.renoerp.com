'use server'

import { db } from '@/lib/db'
import { staff, staffPayments, transactions, categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { desc } from 'drizzle-orm'

const STAFF_PER_PAGE = 20

export async function getAllStaff(userId: string) {
  return db
    .select()
    .from(staff)
    .where(eq(staff.userId, userId))
    .orderBy(desc(staff.createdAt))
}

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
    age?: number | null
    shirtSize?: string
    sex?: string
    phone?: string
    church?: string
    category?: string
    totalAmount: number
    discount?: number
    notes?: string
  }
) {
  await db.insert(staff).values({
    userId,
    name: data.name,
    age: data.age ?? null,
    shirtSize: data.shirtSize || null,
    sex: data.sex || null,
    phone: data.phone || '',
    church: data.church || '',
    category: data.category || '',
    totalAmount: parseFloat(data.totalAmount.toString()),
    discount: data.discount ?? 0,
    status: 'pending',
    notes: data.notes || '',
    checkedIn: false,
  })
}

export async function updateStaff(
  userId: string,
  staffId: number,
  data: Partial<{
    name: string
    age: number | null
    shirtSize: string
    sex: string
    phone: string
    church: string
    category: string
    totalAmount: number
    discount: number
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

  if (!staffMember) throw new Error('Personal no encontrado')

  const originalTotal = parseFloat(staffMember.totalAmount as string)
  const discount = staffMember.discount || 0
  const totalAmount = originalTotal * (1 - discount / 100)
  const alreadyPaid = parseFloat(staffMember.amountPaid as string)
  const remaining = totalAmount - alreadyPaid

  if (amount > remaining) {
    throw new Error(
      `El monto excede lo faltante. Debe: $${remaining.toFixed(2)} de $${totalAmount.toFixed(2)}`
    )
  }

  await db.insert(staffPayments).values({
    staffId,
    userId,
    amount,
    paymentMethod,
    paymentDate,
    notes: notes || '',
  })

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

  const categoryNameMap: Record<string, string> = {
    'cash': 'Pago de Staff - Efectivo',
    'transfer': 'Pago de Staff - Transferencia/Depósito',
    'deposit': 'Pago de Staff - Transferencia/Depósito',
    'mobile': 'Pago de Staff - Transferencia/Depósito',
  }
  const categoryName = categoryNameMap[paymentMethod] || 'Pago de Staff - Efectivo'

  let [staffPaymentCat] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, categoryName)))

  if (!staffPaymentCat) {
    const colorMap: Record<string, string> = {
      'Pago de Staff - Efectivo': '#22c55e',
      'Pago de Staff - Transferencia/Depósito': '#3b82f6',
    }
    const [newCat] = await db
      .insert(categories)
      .values({
        userId,
        name: categoryName,
        type: 'income',
        color: colorMap[categoryName] || '#22c55e',
        icon: 'briefcase',
      })
      .returning()
    staffPaymentCat = newCat
  }

  await db.insert(transactions).values({
    userId,
    categoryId: staffPaymentCat!.id,
    type: 'income',
    amount,
    description: `Pago de ${staffMember.name}`,
    date: paymentDate,
    paymentMethod,
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

  if (!staffMember) throw new Error('Personal no encontrado')

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

  const newPaidAmount = Math.max(0, parseFloat(staffMember.amountPaid as string) - parseFloat(payment.amount as string))
  const originalTotal = parseFloat(staffMember.totalAmount as string)
  const discount = staffMember.discount || 0
  const totalAmount = originalTotal * (1 - discount / 100)
  const newStatus = newPaidAmount >= totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db
    .update(staff)
    .set({
      amountPaid: newPaidAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(staff.id, payment.staffId))

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
    category?: string
    totalAmount: number
    initialPayment?: number
    notes?: string
  }>
) {
  if (staffList.length === 0) return

  const createdStaff = await db
    .insert(staff)
    .values(
      staffList.map((s) => ({
        userId,
        name: s.name.trim(),
        age: s.age ?? null,
        sex: s.sex || null,
        shirtSize: s.shirtSize || null,
        phone: (s.phone || '').trim(),
        church: (s.church || '').trim(),
        category: (s.category || '').trim(),
        totalAmount: parseFloat(s.totalAmount.toString()),
        amountPaid: parseFloat((s.initialPayment || 0).toString()),
        status:
          s.initialPayment && s.initialPayment > 0
            ? s.initialPayment >= s.totalAmount
              ? 'paid'
              : 'partial'
            : 'pending',
        notes: (s.notes || '').trim(),
        checkedIn: false,
      }))
    )
    .returning()

  const staffPaymentCat = await db.query.categories.findFirst({
    where: (c) => and(eq(c.userId, userId), eq(c.name, 'Pago de Staff')),
  })

  if (!staffPaymentCat) return

  const transactionsToInsert: any[] = []
  for (let i = 0; i < createdStaff.length; i++) {
    const initialPayment = parseFloat((staffList[i].initialPayment || 0).toString())
    if (initialPayment > 0) {
      transactionsToInsert.push({
        userId,
        categoryId: staffPaymentCat.id,
        type: 'income',
        amount: initialPayment,
        description: `Pago inicial de ${staffList[i].name}`,
        date: new Date().toISOString().split('T')[0],
      })
    }
  }

  if (transactionsToInsert.length > 0) {
    await db.insert(transactions).values(transactionsToInsert)
  }
}

export const MINISTRIES = [
  'Deportes',
  'Cocina',
  'Pastor@',
  'Lider de equipo',
  'Logistica',
  'Administración',
  'Multimendia',
]
