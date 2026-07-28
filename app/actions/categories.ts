'use server'

import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { and, eq, asc, count } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const CATEGORIES_PER_PAGE = 25

// Get ALL categories (no pagination)
export async function getAllCategories(userId: string, eventId: number) {
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.eventId, eventId)))
    .orderBy(asc(categories.name))
}

export async function getCategories(userId: string, eventId: number, page: number = 1) {
  const offset = (page - 1) * CATEGORIES_PER_PAGE
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.eventId, eventId)))
    .orderBy(asc(categories.name))
    .limit(CATEGORIES_PER_PAGE)
    .offset(offset)
}

export async function getCategoriesCount(userId: string, eventId: number) {
  const result = await db
    .select({ count: count() })
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.eventId, eventId)))
  return result[0].count
}

export async function createCategory(
  userId: string,
  eventId: number,
  data: { name: string; type: string; color: string; icon: string }
) {
  await db.insert(categories).values({ userId, eventId, ...data })
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function updateCategory(
  userId: string,
  eventId: number,
  id: number,
  data: { name: string; type: string; color: string; icon: string }
) {
  await db
    .update(categories)
    .set(data)
    .where(and(eq(categories.id, id), eq(categories.userId, userId), eq(categories.eventId, eventId)))
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function deleteCategory(userId: string, eventId: number, id: number) {
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId), eq(categories.eventId, eventId)))
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}
