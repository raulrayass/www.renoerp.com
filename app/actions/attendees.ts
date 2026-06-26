'use server'

import { db } from '@/lib/db'
import { attendees, attendeePayments, transactions, categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { desc } from 'drizzle-orm'

export async function getAttendees(userId: string) {
  return db
    .select()
    .from(attendees)
    .where(eq(attendees.userId, userId))
    .orderBy(desc(attendees.createdAt))
}

export async function getAttendeePayments(userId: string, attendeeId: number) {
  return db
    .select()
    .from(attendeePayments)
    .where(and(eq(attendeePayments.userId, userId), eq(attendeePayments.attendeeId, attendeeId)))
    .orderBy(desc(attendeePayments.createdAt))
}

export async function createAttendee(
  userId: string,
  data: {
    name: string
    phone?: string
    church?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    totalAmount: number
    notes?: string
  }
) {
  await db.insert(attendees).values({
    userId,
    name: data.name,
    phone: data.phone || '',
    church: data.church || '',
    emergencyContactName: data.emergencyContactName || '',
    emergencyContactPhone: data.emergencyContactPhone || '',
    totalAmount: parseFloat(data.totalAmount.toString()),
    status: 'pending',
    notes: data.notes || '',
  })
}

export async function updateAttendee(
  userId: string,
  attendeeId: number,
  data: Partial<{
    name: string
    phone: string
    church: string
    emergencyContactName: string
    emergencyContactPhone: string
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
    .update(attendees)
    .set(updateData)
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))
}

export async function deleteAttendee(userId: string, attendeeId: number) {
  // Delete all payments and transactions for this attendee
  const payments = await db
    .select()
    .from(attendeePayments)
    .where(and(eq(attendeePayments.userId, userId), eq(attendeePayments.attendeeId, attendeeId)))

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

  await db.delete(attendeePayments).where(eq(attendeePayments.attendeeId, attendeeId))
  await db.delete(attendees).where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))
}

export async function addAttendeePayment(
  userId: string,
  attendeeId: number,
  amount: number,
  paymentDate: string,
  notes?: string
) {
  const [attendee] = await db
    .select()
    .from(attendees)
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))

  if (!attendee) throw new Error('Asistente no encontrado')

  // Validate payment doesn't exceed remaining amount
  const totalAmount = parseFloat(attendee.totalAmount as string)
  const alreadyPaid = parseFloat(attendee.amountPaid as string)
  const remaining = totalAmount - alreadyPaid

  if (amount > remaining) {
    throw new Error(
      `El monto excede lo faltante. Debe: $${remaining.toFixed(2)} de $${totalAmount.toFixed(2)}`
    )
  }

  // Create payment record
  await db.insert(attendeePayments).values({
    attendeeId,
    userId,
    amount,
    paymentDate,
    notes: notes || '',
  })

  // Update attendee paid amount and status
  const newPaidAmount = alreadyPaid + amount
  const newStatus = newPaidAmount >= totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db
    .update(attendees)
    .set({
      amountPaid: newPaidAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))

  // Find or create "Pago de Camperos" category
  let [campPaymentCat] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, 'Pago de Camperos')))

  if (!campPaymentCat) {
    const [newCat] = await db
      .insert(categories)
      .values({
        userId,
        name: 'Pago de Camperos',
        type: 'income',
        color: '#22c55e',
        icon: 'users',
      })
      .returning()
    campPaymentCat = newCat
  }

  // Create transaction for this payment
  await db.insert(transactions).values({
    userId,
    categoryId: campPaymentCat!.id,
    type: 'income',
    amount,
    description: `Pago de ${attendee.name}`,
    date: paymentDate,
  })
}

export async function deleteAttendeePayment(userId: string, paymentId: number) {
  const [payment] = await db
    .select()
    .from(attendeePayments)
    .where(and(eq(attendeePayments.userId, userId), eq(attendeePayments.id, paymentId)))

  if (!payment) throw new Error('Pago no encontrado')

  const [attendee] = await db
    .select()
    .from(attendees)
    .where(eq(attendees.id, payment.attendeeId))

  if (!attendee) throw new Error('Asistente no encontrado')

  // Delete corresponding transaction
  await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        eq(transactions.amount, payment.amount),
        eq(transactions.description, `Pago de ${attendee.name}`)
      )
    )

  // Update attendee paid amount
  const newPaidAmount = Math.max(0, parseFloat(attendee.amountPaid as string) - parseFloat(payment.amount as string))
  const totalAmount = parseFloat(attendee.totalAmount as string)
  const newStatus = newPaidAmount >= totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db
    .update(attendees)
    .set({
      amountPaid: newPaidAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(attendees.id, payment.attendeeId))

  // Delete payment
  await db.delete(attendeePayments).where(eq(attendeePayments.id, paymentId))
}

export async function bulkCreateAttendees(
  userId: string,
  attendeesList: Array<{
    name: string
    phone?: string
    church?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    totalAmount: number
    initialPayment?: number
    notes?: string
  }>
) {
  if (attendeesList.length === 0) return

  // Insert attendees
  const createdAttendees = await db
    .insert(attendees)
    .values(
      attendeesList.map((a) => ({
        userId,
        name: a.name.trim(),
        phone: (a.phone || '').trim(),
        church: (a.church || '').trim(),
        emergencyContactName: (a.emergencyContactName || '').trim(),
        emergencyContactPhone: (a.emergencyContactPhone || '').trim(),
        totalAmount: parseFloat(a.totalAmount.toString()),
        amountPaid: parseFloat((a.initialPayment || 0).toString()),
        status:
          a.initialPayment && a.initialPayment > 0
            ? a.initialPayment >= a.totalAmount
              ? 'paid'
              : 'partial'
            : 'pending',
        notes: (a.notes || '').trim(),
      }))
    )
    .returning()

  // Get category for payments
  const campPaymentCat = await db.query.categories.findFirst({
    where: (c) => and(eq(c.userId, userId), eq(c.name, 'Pago de Camperos')),
  })

  if (!campPaymentCat) return

  // Create transactions for initial payments
  const transactionsToInsert: any[] = []
  for (let i = 0; i < createdAttendees.length; i++) {
    const initialPayment = parseFloat((attendeesList[i].initialPayment || 0).toString())
    if (initialPayment > 0) {
      transactionsToInsert.push({
        userId,
        categoryId: campPaymentCat.id,
        type: 'income',
        amount: initialPayment,
        description: `Pago inicial de ${attendeesList[i].name}`,
        date: new Date().toISOString().split('T')[0],
      })
    }
  }

  if (transactionsToInsert.length > 0) {
    await db.insert(transactions).values(transactionsToInsert)
  }
}

export async function getChurchDistribution(userId: string) {
  const result = await db
    .select({
      church: attendees.church,
      count: db.sql`count(*)`.as('count'),
    })
    .from(attendees)
    .where(eq(attendees.userId, userId))
    .groupBy(attendees.church)

  const colors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#06b6d4',
    '#84cc16',
  ]

  return result
    .map((item, index) => ({
      name: item.church || 'Sin iglesia asignada',
      value: parseInt(item.count as string),
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value)
}

export async function generateExcelTemplate() {
  // Returns data for creating an Excel template file
  return {
    columns: ['Nombre', 'Correo', 'Teléfono', 'Monto Total ($)', 'Notas'],
    data: [
      ['Juan García', 'juan@email.com', '5551234567', 2000, 'Joven participante'],
      ['María López', 'maria@email.com', '5559876543', 1800, ''],
      ['Carlos Sánchez', 'carlos@email.com', '5552222222', 2500, 'Campista'],
    ],
  }
}
