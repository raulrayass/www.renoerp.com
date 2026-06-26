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
    email?: string
    phone?: string
    totalAmount: number
    notes?: string
  }
) {
  await db
    .insert(attendees)
    .values({
      userId,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
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
    email: string
    phone: string
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
  await db
    .delete(attendeePayments)
    .where(and(eq(attendeePayments.userId, userId), eq(attendeePayments.attendeeId, attendeeId)))

  await db
    .delete(attendees)
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))
}

export async function addAttendeePayment(
  userId: string,
  attendeeId: number,
  amount: number,
  paymentDate: string,
  notes?: string
) {
  // Get the attendee
  const [attendee] = await db
    .select()
    .from(attendees)
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))

  if (!attendee) throw new Error('Attendee not found')

  // Create payment record
  await db
    .insert(attendeePayments)
    .values({
      attendeeId,
      userId,
      amount: amount,
      paymentDate,
      notes,
    })

  // Update attendee paid amount and status
  const newPaidAmount = parseFloat(attendee.amountPaid as string) + amount
  const newStatus =
    newPaidAmount >= parseFloat(attendee.totalAmount as string)
      ? 'paid'
      : newPaidAmount > 0
        ? 'partial'
        : 'pending'

  await db
    .update(attendees)
    .set({
      amountPaid: newPaidAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))

  // Get or create "Pago de Camperos" income category
  const [campPaymentCat] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, 'Pago de Camperos')))

  if (!campPaymentCat) {
    throw new Error('Pago de Camperos category not found')
  }

  // Create transaction for this payment
  await db
    .insert(transactions)
    .values({
      userId,
      categoryId: campPaymentCat.id,
      type: 'income',
      amount: amount,
      description: `Pago de ${attendee.name}`,
      date: paymentDate,
    })
}

export async function deleteAttendeePayment(userId: string, paymentId: number) {
  // Get payment to know attendee and amount
  const [payment] = await db
    .select()
    .from(attendeePayments)
    .where(and(eq(attendeePayments.userId, userId), eq(attendeePayments.id, paymentId)))

  if (!payment) throw new Error('Payment not found')

  // Delete corresponding transaction
  const [transactionToDelete] = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.description, `Pago de ${(await db.select().from(attendees).where(eq(attendees.id, payment.attendeeId)))[0]?.name || 'Unknown'}`),
        eq(transactions.amount, payment.amount)
      )
    )

  if (transactionToDelete) {
    await db.delete(transactions).where(eq(transactions.id, transactionToDelete.id))
  }

  // Update attendee paid amount
  const [attendee] = await db
    .select()
    .from(attendees)
    .where(eq(attendees.id, payment.attendeeId))

  const newPaidAmount = Math.max(0, parseFloat(attendee!.amountPaid as string) - parseFloat(payment.amount as string))
  const newStatus =
    newPaidAmount >= parseFloat(attendee!.totalAmount as string)
      ? 'paid'
      : newPaidAmount > 0
        ? 'partial'
        : 'pending'

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
    email?: string
    phone?: string
    totalAmount: number
    notes?: string
  }>
) {
  await db
    .insert(attendees)
    .values(
      attendeesList.map((a) => ({
        userId,
        name: a.name,
        email: a.email || '',
        phone: a.phone || '',
        totalAmount: parseFloat(a.totalAmount.toString()),
        status: 'pending',
        notes: a.notes || '',
      }))
    )
}
