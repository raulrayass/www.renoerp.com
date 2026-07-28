'use server'

import { db } from '@/lib/db'
import {
  appUsers,
  events,
  eventMembers,
  attendees,
  churches,
  teams,
  rooms,
  games,
  gameScores,
  staff,
  staffPayments,
  categories,
  transactions,
  attendeePayments,
} from '@/lib/db/schema'
import { eq, isNull, and } from 'drizzle-orm'

const CURRENT_YEAR = new Date().getFullYear()
const EVENT_NAME = `Permanece ${CURRENT_YEAR}`

export async function bootstrapEvent() {
  try {
    console.log('[v0] 🚀 Bootstrap: Creating event structure...\n')

    // 1. Get first user
    const users = await db.select().from(appUsers).limit(1)
    if (users.length === 0) {
      return { success: false, error: 'No users found' }
    }

    const user = users[0]
    const userId = user.id
    console.log(`[v0] ✓ User: ${user.email}`)

    // 2. Check if event already exists
    const existingEvents = await db
      .select()
      .from(events)
      .where(eq(events.adminId, userId))
      .limit(1)

    if (existingEvents.length > 0) {
      console.log(`[v0] ℹ Event already exists`)
      return { success: true, eventId: existingEvents[0].id, message: 'Event already created' }
    }

    // 3. Create event
    const [newEvent] = await db
      .insert(events)
      .values({
        name: EVENT_NAME,
        adminId: userId,
        status: 'active',
      })
      .returning()

    const eventId = newEvent.id
    console.log(`[v0] ✓ Event created: ${EVENT_NAME} (ID: ${eventId})`)

    // 4. Add user as member
    await db
      .insert(eventMembers)
      .values({
        eventId,
        userId,
        role: 'admin',
        status: 'active',
      })
      .onConflictDoNothing()

    console.log(`[v0] ✓ User added as admin`)

    // 5. Link all ORPHANED data (no eventId) to event
    const updates = {
      attendees: 0,
      churches: 0,
      teams: 0,
      rooms: 0,
      games: 0,
      gameScores: 0,
      staff: 0,
      staffPayments: 0,
      categories: 0,
      transactions: 0,
      attendeePayments: 0,
    }

    // Link attendees (only those without eventId)
    const attendeeResult = await db
      .update(attendees)
      .set({ eventId })
      .where(and(eq(attendees.userId, userId), isNull(attendees.eventId)))
    updates.attendees = attendeeResult.rowsAffected || 0

    // Link churches (only those without eventId)
    const churchResult = await db
      .update(churches)
      .set({ eventId })
      .where(and(eq(churches.userId, userId), isNull(churches.eventId)))
    updates.churches = churchResult.rowsAffected || 0

    // Link teams (only those without eventId)
    const teamResult = await db
      .update(teams)
      .set({ eventId })
      .where(and(eq(teams.userId, userId), isNull(teams.eventId)))
    updates.teams = teamResult.rowsAffected || 0

    // Link rooms (only those without eventId)
    const roomResult = await db
      .update(rooms)
      .set({ eventId })
      .where(and(eq(rooms.userId, userId), isNull(rooms.eventId)))
    updates.rooms = roomResult.rowsAffected || 0

    // Link games (only those without eventId)
    const gameResult = await db
      .update(games)
      .set({ eventId })
      .where(and(eq(games.userId, userId), isNull(games.eventId)))
    updates.games = gameResult.rowsAffected || 0

    // Link game scores (only those without eventId)
    const gameScoreResult = await db
      .update(gameScores)
      .set({ eventId })
      .where(and(eq(gameScores.userId, userId), isNull(gameScores.eventId)))
    updates.gameScores = gameScoreResult.rowsAffected || 0

    // Link staff (only those without eventId)
    const staffResult = await db
      .update(staff)
      .set({ eventId })
      .where(and(eq(staff.userId, userId), isNull(staff.eventId)))
    updates.staff = staffResult.rowsAffected || 0

    // Link staff payments (only those without eventId)
    const staffPaymentResult = await db
      .update(staffPayments)
      .set({ eventId })
      .where(and(eq(staffPayments.userId, userId), isNull(staffPayments.eventId)))
    updates.staffPayments = staffPaymentResult.rowsAffected || 0

    // Link categories (only those without eventId)
    const categoryResult = await db
      .update(categories)
      .set({ eventId })
      .where(and(eq(categories.userId, userId), isNull(categories.eventId)))
    updates.categories = categoryResult.rowsAffected || 0

    // Link transactions (only those without eventId)
    const transactionResult = await db
      .update(transactions)
      .set({ eventId })
      .where(and(eq(transactions.userId, userId), isNull(transactions.eventId)))
    updates.transactions = transactionResult.rowsAffected || 0

    // Link attendee payments (only those without eventId)
    const attendeePaymentResult = await db
      .update(attendeePayments)
      .set({ eventId })
      .where(and(eq(attendeePayments.userId, userId), isNull(attendeePayments.eventId)))
    updates.attendeePayments = attendeePaymentResult.rowsAffected || 0

    console.log(`[v0] ✓ Data linked:`)
    Object.entries(updates).forEach(([key, count]) => {
      if (count > 0) console.log(`  - ${key}: ${count}`)
    })

    return {
      success: true,
      eventId,
      message: 'Bootstrap completed successfully',
      updates,
    }
  } catch (error) {
    console.error('[v0] Bootstrap error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
