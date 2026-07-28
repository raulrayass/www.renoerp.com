'use server'

import { db } from '@/lib/db'
import {
  appUsers,
  events,
  eventMembers,
  attendees,
  staff,
  teams,
  churches,
  rooms,
  games,
  gameScores,
  categories,
  transactions,
  attendeePayments,
  staffPayments,
} from '@/lib/db/schema'

export async function cleanupAndReset() {
  try {
    console.log('[v0] Starting full cleanup and reset...')

    // Get the first user (will be the admin)
    const users = await db.select().from(appUsers)
    if (!users || users.length === 0) {
      return { success: false, error: 'No users in database' }
    }

    const adminUser = users[0]
    console.log(`[v0] Using admin user: ${adminUser.email}`)

    // 1. Delete all data tables (keep structure)
    await db.delete(attendeePayments)
    await db.delete(staffPayments)
    await db.delete(gameScores)
    await db.delete(games)
    await db.delete(categories)
    await db.delete(transactions)
    await db.delete(attendees)
    await db.delete(staff)
    await db.delete(rooms)
    await db.delete(teams)
    await db.delete(churches)
    await db.delete(eventMembers)
    await db.delete(events)

    console.log('[v0] All data cleared')

    // 2. Create fresh "Permanece 2026" event
    const [newEvent] = await db
      .insert(events)
      .values({
        name: 'Permanece 2026',
        adminId: adminUser.id,
        status: 'active',
      })
      .returning()

    console.log(`[v0] Created event: ${newEvent.name} (ID: ${newEvent.id})`)

    // 3. Add admin as event member
    await db.insert(eventMembers).values({
      eventId: newEvent.id,
      userId: adminUser.id,
      role: 'admin',
      status: 'active',
    })

    console.log(`[v0] Added ${adminUser.email} as admin`)

    return {
      success: true,
      message: 'Database cleaned and reset successfully',
      event: {
        id: newEvent.id,
        name: newEvent.name,
      },
      admin: {
        email: adminUser.email,
        id: adminUser.id,
      },
    }
  } catch (e) {
    console.error('[v0] ERROR:', e)
    return { success: false, error: (e as any).message }
  }
}
