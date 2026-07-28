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
import { eq, isNull } from 'drizzle-orm'

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

    // 5. Link all orphaned data to event
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

    // Link attendees
    const attendeeResult = await db
      .update(attendees)
      .set({ eventId })
      .where(eq(attendees.userId, userId))
    updates.attendees = attendeeResult.rowsAffected || 0

    // Link churches
    const churchResult = await db
      .update(churches)
      .set({ eventId })
      .where(eq(churches.userId, userId))
    updates.churches = churchResult.rowsAffected || 0

    // Link teams
    const teamResult = await db
      .update(teams)
      .set({ eventId })
      .where(eq(teams.userId, userId))
    updates.teams = teamResult.rowsAffected || 0

    // Link rooms
    const roomResult = await db
      .update(rooms)
      .set({ eventId })
      .where(eq(rooms.userId, userId))
    updates.rooms = roomResult.rowsAffected || 0

    // Link games
    const gameResult = await db
      .update(games)
      .set({ eventId })
      .where(eq(games.userId, userId))
    updates.games = gameResult.rowsAffected || 0

    // Link game scores
    const gameScoreResult = await db
      .update(gameScores)
      .set({ eventId })
      .where(eq(gameScores.userId, userId))
    updates.gameScores = gameScoreResult.rowsAffected || 0

    // Link staff
    const staffResult = await db
      .update(staff)
      .set({ eventId })
      .where(eq(staff.userId, userId))
    updates.staff = staffResult.rowsAffected || 0

    // Link staff payments
    const staffPaymentResult = await db
      .update(staffPayments)
      .set({ eventId })
      .where(eq(staffPayments.userId, userId))
    updates.staffPayments = staffPaymentResult.rowsAffected || 0

    // Link categories
    const categoryResult = await db
      .update(categories)
      .set({ eventId })
      .where(eq(categories.userId, userId))
    updates.categories = categoryResult.rowsAffected || 0

    // Link transactions
    const transactionResult = await db
      .update(transactions)
      .set({ eventId })
      .where(eq(transactions.userId, userId))
    updates.transactions = transactionResult.rowsAffected || 0

    // Link attendee payments
    const attendeePaymentResult = await db
      .update(attendeePayments)
      .set({ eventId })
      .where(eq(attendeePayments.userId, userId))
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
