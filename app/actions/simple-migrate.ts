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
} from '@/lib/db/schema'
import { eq, isNull, and } from 'drizzle-orm'

export async function simpleMigrate(userId: string) {
  try {
    console.log('[v0] Starting simple migration for user:', userId)

    // 1. Get the current user
    let user = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.id, userId))
      .limit(1)
      .then(r => r[0])

    if (!user) {
      return { success: false, error: `User ${userId} not found in database` }
    }

    console.log(`[v0] Found user: ${user.email}`)

    // 2. Check if "Permanece 2026" event exists
    const eventName = 'Permanece 2026'
    let event = await db
      .select()
      .from(events)
      .where(eq(events.name, eventName))
      .limit(1)
      .then(r => r[0])

    if (!event) {
      console.log(`[v0] Creating event: "${eventName}"`)
      const result = await db
        .insert(events)
        .values({
          name: eventName,
          adminId: user.id,
          status: 'active',
        })
        .returning()
      event = result[0]
    } else {
      console.log(`[v0] Event already exists, updating adminId`)
      await db
        .update(events)
        .set({ adminId: user.id })
        .where(eq(events.id, event.id))
    }

    // 3. Ensure user is event admin in eventMembers
    const existingMember = await db
      .select()
      .from(eventMembers)
      .where(and(eq(eventMembers.eventId, event.id), eq(eventMembers.userId, user.id)))
      .limit(1)
      .then(r => r[0])

    if (!existingMember) {
      await db
        .insert(eventMembers)
        .values({
          eventId: event.id,
          userId: user.id,
          role: 'admin',
          status: 'active',
        })
        .onConflictDoNothing()
    }

    // 4. Count orphaned data (no eventId AND no eventId already set to another event)
    const orphanedAttendees = await db
      .select()
      .from(attendees)
      .where(and(eq(attendees.userId, user.id), isNull(attendees.eventId)))
    const orphanedStaff = await db
      .select()
      .from(staff)
      .where(and(eq(staff.userId, user.id), isNull(staff.eventId)))
    const orphanedTeams = await db
      .select()
      .from(teams)
      .where(and(eq(teams.userId, user.id), isNull(teams.eventId)))
    const orphanedChurches = await db
      .select()
      .from(churches)
      .where(and(eq(churches.userId, user.id), isNull(churches.eventId)))

    console.log(`[v0] Found orphaned data:`)
    console.log(`  - Attendees: ${orphanedAttendees.length}`)
    console.log(`  - Staff: ${orphanedStaff.length}`)
    console.log(`  - Teams: ${orphanedTeams.length}`)
    console.log(`  - Churches: ${orphanedChurches.length}`)

    // 5. Link orphaned data to event
    if (orphanedAttendees.length > 0) {
      await db
        .update(attendees)
        .set({ eventId: event.id })
        .where(and(eq(attendees.userId, user.id), isNull(attendees.eventId)))
    }

    if (orphanedStaff.length > 0) {
      await db
        .update(staff)
        .set({ eventId: event.id })
        .where(and(eq(staff.userId, user.id), isNull(staff.eventId)))
    }

    if (orphanedTeams.length > 0) {
      await db
        .update(teams)
        .set({ eventId: event.id })
        .where(and(eq(teams.userId, user.id), isNull(teams.eventId)))
    }

    if (orphanedChurches.length > 0) {
      await db
        .update(churches)
        .set({ eventId: event.id })
        .where(and(eq(churches.userId, user.id), isNull(churches.eventId)))
    }

    return {
      success: true,
      event: { id: event.id, name: event.name },
      linked: {
        attendees: orphanedAttendees.length,
        staff: orphanedStaff.length,
        teams: orphanedTeams.length,
        churches: orphanedChurches.length,
      },
    }
  } catch (e) {
    console.error('[v0] Migration error:', e)
    return { success: false, error: String(e) }
  }
}
