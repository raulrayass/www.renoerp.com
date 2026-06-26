'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transactions, categories } from '@/lib/db/schema'
import { and, eq, desc, gte, lte, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getTransactions(filters?: {
  type?: string
  categoryId?: number
  from?: string
  to?: string
}) {
  const userId = await getUserId()
  const conditions = [eq(transactions.userId, userId)]

  if (filters?.type && filters.type !== 'all') {
    conditions.push(eq(transactions.type, filters.type))
  }
  if (filters?.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId))
  }
  if (filters?.from) {
    conditions.push(gte(transactions.date, filters.from))
  }
  if (filters?.to) {
    conditions.push(lte(transactions.date, filters.to))
  }

  const rows = await db
    .select({
      id: transactions.id,
      userId: transactions.userId,
      categoryId: transactions.categoryId,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))

  return rows
}

export async function getDashboardData() {
  const userId = await getUserId()

  const allTransactions = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      date: transactions.date,
      description: transactions.description,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))

  const totalIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount as string), 0)

  const totalExpense = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount as string), 0)

  // Monthly data for chart (last 6 months)
  const monthlyMap: Record<string, { income: number; expense: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = { income: 0, expense: 0 }
  }

  allTransactions.forEach((t) => {
    const key = t.date.substring(0, 7)
    if (monthlyMap[key]) {
      if (t.type === 'income') monthlyMap[key].income += parseFloat(t.amount as string)
      else monthlyMap[key].expense += parseFloat(t.amount as string)
    }
  })

  const monthlyData = Object.entries(monthlyMap).map(([month, data]) => ({
    month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    income: data.income,
    expense: data.expense,
  }))

  // Category breakdown for expenses
  const expenseByCat: Record<string, { name: string; color: string; total: number }> = {}
  allTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const key = t.categoryName ?? 'Sin categoría'
      if (!expenseByCat[key]) {
        expenseByCat[key] = { name: key, color: t.categoryColor ?? '#888', total: 0 }
      }
      expenseByCat[key].total += parseFloat(t.amount as string)
    })

  const expenseByCategory = Object.values(expenseByCat).sort((a, b) => b.total - a.total)

  const recentTransactions = allTransactions.slice(0, 5)

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    monthlyData,
    expenseByCategory,
    recentTransactions,
  }
}

export async function createTransaction(data: {
  categoryId: number
  type: string
  amount: string
  description: string
  date: string
}) {
  const userId = await getUserId()
  await db.insert(transactions).values({
    userId,
    categoryId: data.categoryId,
    type: data.type,
    amount: data.amount,
    description: data.description,
    date: data.date,
  })
  revalidatePath('/')
  revalidatePath('/transactions')
}

export async function updateTransaction(
  id: number,
  data: {
    categoryId: number
    type: string
    amount: string
    description: string
    date: string
  }
) {
  const userId = await getUserId()
  await db
    .update(transactions)
    .set({
      categoryId: data.categoryId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date,
      updatedAt: new Date(),
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  revalidatePath('/')
  revalidatePath('/transactions')
}

export async function deleteTransaction(id: number) {
  const userId = await getUserId()
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  revalidatePath('/')
  revalidatePath('/transactions')
}
