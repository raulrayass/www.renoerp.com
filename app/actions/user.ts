'use server'

import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function getOrCreateUser(email: string): Promise<{ id: string; email: string; name: string | null }> {
  const normalized = email.trim().toLowerCase()

  const existing = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, normalized))
    .limit(1)

  if (existing.length > 0) {
    return existing[0]
  }

  const id = generateId()
  const [created] = await db
    .insert(appUsers)
    .values({ id, email: normalized, name: null })
    .returning()

  return created
}

export async function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  const rows = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, normalized))
    .limit(1)
  return rows[0] ?? null
}
