'use server'

import { db } from '@/lib/db'
import { transactions, categories } from '@/lib/db/schema'
import { and, eq, desc, gte, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getTransactions(
  userId: string,
  filters?: { type?: string; categoryId?: number; from?: string; to?: string }
) {
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

  return db
    .select({
      id: transactions.id,
      userId: transactions.userId,
      categoryId: transactions.categoryId,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      paymentMethod: transactions.paymentMethod,
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
}

export async function getDashboardData(userId: string) {
  const allTransactions = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      date: transactions.date,
      description: transactions.description,
      paymentMethod: transactions.paymentMethod,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))

  // Payment method breakdown - correctly track available balance per method
  const paymentMethodBreakdown = {
    cash: { available: 0, income: 0, expense: 0 },
    transfer: { available: 0, income: 0, expense: 0 },
    deposit: { available: 0, income: 0, expense: 0 },
  }

  // Process each transaction and calculate the correct available balance
  allTransactions.forEach((t) => {
    const method = (t.paymentMethod || 'cash') as keyof typeof paymentMethodBreakdown
    const amount = parseFloat(t.amount as string)
    
    if (method in paymentMethodBreakdown) {
      if (t.type === 'income') {
        // Income: adds to both income count and available balance
        paymentMethodBreakdown[method].income += amount
        paymentMethodBreakdown[method].available += amount
      } else {
        // Expense: adds to expense count and subtracts from available balance
        paymentMethodBreakdown[method].expense += amount
        paymentMethodBreakdown[method].available -= amount
      }
    }
  })

  // Calculate totals from payment method breakdown (ensures they match)
  const totalIncome = Object.values(paymentMethodBreakdown).reduce((sum, m) => sum + m.income, 0)
  const totalExpense = Object.values(paymentMethodBreakdown).reduce((sum, m) => sum + m.expense, 0)

  // Last 6 months
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

  // Expense by category (pie chart)
  const expenseByCat: Record<string, { name: string; color: string; total: number }> = {}
  allTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const key = t.categoryName ?? 'Sin categoria'
      if (!expenseByCat[key]) {
        expenseByCat[key] = { name: key, color: t.categoryColor ?? '#888', total: 0 }
      }
      expenseByCat[key].total += parseFloat(t.amount as string)
    })

  // Income by category (pie chart)
  const incomeByCat: Record<string, { name: string; color: string; total: number }> = {}
  allTransactions
    .filter((t) => t.type === 'income')
    .forEach((t) => {
      const key = t.categoryName ?? 'Sin categoria'
      if (!incomeByCat[key]) {
        incomeByCat[key] = { name: key, color: t.categoryColor ?? '#888', total: 0 }
      }
      incomeByCat[key].total += parseFloat(t.amount as string)
    })

  // Per-category comparison (income vs expense per category)
  const allCatKeys = new Set([
    ...Object.keys(expenseByCat),
    ...Object.keys(incomeByCat),
  ])
  const categoryComparison = Array.from(allCatKeys).map((name) => ({
    name,
    income: incomeByCat[name]?.total ?? 0,
    expense: expenseByCat[name]?.total ?? 0,
    color: incomeByCat[name]?.color ?? expenseByCat[name]?.color ?? '#888',
  })).sort((a, b) => (b.income + b.expense) - (a.income + a.expense))

  // Mobile banking is transfer + deposit combined
  const mobileBanking = paymentMethodBreakdown.transfer.available + paymentMethodBreakdown.deposit.available

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    monthlyData,
    expenseByCategory: Object.values(expenseByCat).sort((a, b) => b.total - a.total),
    incomeByCategory: Object.values(incomeByCat).sort((a, b) => b.total - a.total),
    categoryComparison,
    recentTransactions: allTransactions.slice(0, 5),
    paymentMethodBreakdown,
    mobileBanking,
  }
}

export async function createTransaction(
  userId: string,
  data: { categoryId: number; type: string; amount: string; description: string; date: string; paymentMethod?: string }
) {
  await db.insert(transactions).values({ userId, ...data, paymentMethod: data.paymentMethod || 'cash' })
  revalidatePath('/')
  revalidatePath('/transactions')
}

export async function updateTransaction(
  userId: string,
  id: number,
  data: { categoryId: number; type: string; amount: string; description: string; date: string; paymentMethod?: string }
) {
  await db
    .update(transactions)
    .set({ ...data, paymentMethod: data.paymentMethod || 'cash', updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  revalidatePath('/')
  revalidatePath('/transactions')
}

export async function deleteTransaction(userId: string, id: number) {
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  revalidatePath('/')
  revalidatePath('/transactions')
}

export async function getPaymentMethodBreakdown(userId: string) {
  try {
    const allTransactions = await db
      .select({
        paymentMethod: transactions.paymentMethod,
        amount: transactions.amount,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId))

    // Group by payment method
    const breakdown = {
      cash: { total: 0, transactions: 0 },
      digital: { total: 0, transactions: 0 },
      mobile: { total: 0, transactions: 0 },
      card: { total: 0, transactions: 0 },
      other: { total: 0, transactions: 0 },
    }

    for (const tx of allTransactions) {
      const method = tx.paymentMethod as string || 'cash'
      const amount = parseFloat(tx.amount as string)
      
      if (method in breakdown) {
        breakdown[method as keyof typeof breakdown].total += amount
        breakdown[method as keyof typeof breakdown].transactions += 1
      }
    }

    return breakdown
  } catch (error) {
    console.error('[v0] Error getting payment method breakdown:', error)
    return {
      cash: { total: 0, transactions: 0 },
      digital: { total: 0, transactions: 0 },
      mobile: { total: 0, transactions: 0 },
      card: { total: 0, transactions: 0 },
      other: { total: 0, transactions: 0 },
    }
  }
}
