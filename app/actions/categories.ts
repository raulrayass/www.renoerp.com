'use server'

import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { and, eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getCategories(userId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name))
}

export async function createCategory(
  userId: string,
  data: { name: string; type: string; color: string; icon: string }
) {
  await db.insert(categories).values({ userId, ...data })
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function updateCategory(
  userId: string,
  id: number,
  data: { name: string; type: string; color: string; icon: string }
) {
  await db
    .update(categories)
    .set(data)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function deleteCategory(userId: string, id: number) {
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}
