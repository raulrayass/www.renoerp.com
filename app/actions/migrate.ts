'use server'

import { db } from '@/lib/db'
import {
  appUsers,
  events,
  eventMembers,
  categories,
  transactions,
  attendees,
  attendeePayments,
  churches,
  teams,
  rooms,
  games,
  gameScores,
  staff,
  staffPayments,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_EVENT_NAME = `Campamento ${CURRENT_YEAR}`

export async function runMigration() {
  console.log('[v0] 🚀 Starting migration to multi-event architecture...\n')
  console.log(`[v0] 📅 Creating event: "${DEFAULT_EVENT_NAME}"\n`)

  try {
    // Step 1: Get all users
    console.log('[v0] 📋 Step 1: Fetching all users...')
    const users = await db.select().from(appUsers)
    console.log(`[v0] ✓ Found ${users.length} users\n`)

    let eventsCreated = 0
    let dataLinked = 0

    // Step 2: For each user, create Campamento event and link data
    for (const user of users) {
      console.log(`[v0] 👤 Processing user: ${user.email}`)

      // Check if Campamento event already exists
      const existingEvent = await db
        .select()
        .from(events)
        .where(eq(events.adminId, user.id))

      if (existingEvent.length === 0) {
        // Create Campamento event for this user
        const [newEvent] = await db
          .insert(events)
          .values({
            name: DEFAULT_EVENT_NAME,
            adminId: user.id,
            status: 'active',
          })
          .returning()

        console.log(
          `[v0]   ✓ Created event "${DEFAULT_EVENT_NAME}" (ID: ${newEvent.id})`
        )
        eventsCreated++

        // Assign user as admin
        await db
          .insert(eventMembers)
          .values({
            eventId: newEvent.id,
            userId: user.id,
            role: 'admin',
            status: 'active',
          })
          .onConflictDoNothing()

        console.log(`[v0]   ✓ Added user as admin`)

        // Link all existing data to this event
        const eventId = newEvent.id

        // Link categories
        const categoryCount = await db
          .update(categories)
          .set({ eventId })
          .where(eq(categories.userId, user.id))

        // Link transactions
        await db
          .update(transactions)
          .set({ eventId })
          .where(eq(transactions.userId, user.id))

        // Link attendees
        await db
          .update(attendees)
          .set({ eventId })
          .where(eq(attendees.userId, user.id))

        // Link attendee payments
        await db
          .update(attendeePayments)
          .set({ eventId })
          .where(eq(attendeePayments.userId, user.id))

        // Link churches
        await db
          .update(churches)
          .set({ eventId })
          .where(eq(churches.userId, user.id))

        // Link teams
        await db
          .update(teams)
          .set({ eventId })
          .where(eq(teams.userId, user.id))

        // Link rooms
        await db
          .update(rooms)
          .set({ eventId })
          .where(eq(rooms.userId, user.id))

        // Link games
        await db
          .update(games)
          .set({ eventId })
          .where(eq(games.userId, user.id))

        // Link game scores
        await db
          .update(gameScores)
          .set({ eventId })
          .where(eq(gameScores.userId, user.id))

        // Link staff
        await db
          .update(staff)
          .set({ eventId })
          .where(eq(staff.userId, user.id))

        // Link staff payments
        await db
          .update(staffPayments)
          .set({ eventId })
          .where(eq(staffPayments.userId, user.id))

        console.log(`[v0]   ✓ Linked all data to event`)
        dataLinked++
      } else {
        console.log(`[v0]   ℹ Event already exists, skipping...`)
      }
    }

    // Final Summary
    console.log(`\n[v0] ✅ Migration Complete!`)
    console.log(`[v0] 📊 Summary:`)
    console.log(`[v0]    - Events created: ${eventsCreated}`)
    console.log(`[v0]    - Users with data linked: ${dataLinked}`)
    console.log(`[v0]    - Event name: "${DEFAULT_EVENT_NAME}"`)

    return {
      success: true,
      eventsCreated,
      dataLinked,
      eventName: DEFAULT_EVENT_NAME,
      message: `Migration completed successfully! Created ${eventsCreated} events and linked ${dataLinked} users' data.`,
    }
  } catch (error) {
    console.error('[v0] ❌ Migration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
