'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { and, eq, asc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getCategories() {
  const userId = await getUserId()
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name))
}

export async function createCategory(data: {
  name: string
  type: string
  color: string
  icon: string
}) {
  const userId = await getUserId()
  await db.insert(categories).values({
    userId,
    name: data.name,
    type: data.type,
    color: data.color,
    icon: data.icon,
  })
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function updateCategory(
  id: number,
  data: { name: string; type: string; color: string; icon: string }
) {
  const userId = await getUserId()
  await db
    .update(categories)
    .set({ name: data.name, type: data.type, color: data.color, icon: data.icon })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function deleteCategory(id: number) {
  const userId = await getUserId()
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}
