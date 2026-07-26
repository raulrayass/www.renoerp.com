import { db } from '@/lib/db'
import { appUsers, events, eventMembers, categories, transactions, attendees, attendeePayments, churches, teams, rooms, games, gameScores, staff, staffPayments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Migration Script: Single-Event → Multi-Event Architecture
 * 
 * Preserves ALL existing data by:
 * 1. Creating a "Campamento 2026" event for each existing user
 * 2. Assigning user as admin of their Campamento 2026 event
 * 3. Linking ALL existing data to the Campamento 2026 event
 * 
 * This is the main/current campamento with all modules and data
 * 
 * Run with: npx ts-node scripts/migrate-to-multi-event.ts
 */

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_EVENT_NAME = `Campamento ${CURRENT_YEAR}`

async function migrate() {
  console.log('🚀 Starting migration to multi-event architecture...\n')
  console.log(`📅 Creating event: "${DEFAULT_EVENT_NAME}"\n`)

  try {
    // Step 1: Get all users
    console.log('📋 Step 1: Fetching all users...')
    const users = await db.select().from(appUsers)
    console.log(`✓ Found ${users.length} users\n`)

    let eventsCreated = 0
    let dataLinked = 0

    // Step 2: For each user, create Campamento event and link data
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email}`)

      // Check if Campamento event already exists
      const existingEvent = await db.select().from(events).where(eq(events.adminId, user.id))
      
      if (existingEvent.length === 0) {
        // Create Campamento event for this user
        const [newEvent] = await db.insert(events).values({
          name: DEFAULT_EVENT_NAME,
          adminId: user.id,
          status: 'active',
        }).returning()

        console.log(`  ✓ Created event "${DEFAULT_EVENT_NAME}" (ID: ${newEvent.id})`)
        eventsCreated++

        // Create event_member record (user as admin)
        await db.insert(eventMembers).values({
          eventId: newEvent.id,
          userId: user.id,
          role: 'admin',
          status: 'active',
        })
        console.log(`  ✓ Added user as admin to "${DEFAULT_EVENT_NAME}"`)

        // Link all existing data to this event
        // This ensures ALL current data (teams, attendees, games, etc) 
        // is preserved and belongs to the Campamento 2026 event
        const eventId = newEvent.id

        // Link categories
        const catCount = await db.update(categories)
          .set({ eventId })
          .where(eq(categories.userId, user.id))
        console.log(`  ✓ Linked ${catCount} categories`)
        dataLinked += catCount

        // Link transactions
        const transCount = await db.update(transactions)
          .set({ eventId })
          .where(eq(transactions.userId, user.id))
        console.log(`  ✓ Linked ${transCount} transactions`)
        dataLinked += transCount

        // Link attendees
        const attCount = await db.update(attendees)
          .set({ eventId })
          .where(eq(attendees.userId, user.id))
        console.log(`  ✓ Linked ${attCount} attendees`)
        dataLinked += attCount

        // Link attendee payments
        const attPayCount = await db.update(attendeePayments)
          .set({ eventId })
          .where(eq(attendeePayments.userId, user.id))
        console.log(`  ✓ Linked ${attPayCount} attendee payments`)
        dataLinked += attPayCount

        // Link churches
        const chCount = await db.update(churches)
          .set({ eventId })
          .where(eq(churches.userId, user.id))
        console.log(`  ✓ Linked ${chCount} churches`)
        dataLinked += chCount

        // Link teams
        const teamCount = await db.update(teams)
          .set({ eventId })
          .where(eq(teams.userId, user.id))
        console.log(`  ✓ Linked ${teamCount} teams`)
        dataLinked += teamCount

        // Link rooms
        const roomCount = await db.update(rooms)
          .set({ eventId })
          .where(eq(rooms.userId, user.id))
        console.log(`  ✓ Linked ${roomCount} rooms`)
        dataLinked += roomCount

        // Link games
        const gameCount = await db.update(games)
          .set({ eventId })
          .where(eq(games.userId, user.id))
        console.log(`  ✓ Linked ${gameCount} games`)
        dataLinked += gameCount

        // Link game scores
        const scoreCount = await db.update(gameScores)
          .set({ eventId })
          .where(eq(gameScores.userId, user.id))
        console.log(`  ✓ Linked ${scoreCount} game scores`)
        dataLinked += scoreCount

        // Link staff
        const staffCount = await db.update(staff)
          .set({ eventId })
          .where(eq(staff.userId, user.id))
        console.log(`  ✓ Linked ${staffCount} staff members`)
        dataLinked += staffCount

        // Link staff payments
        const staffPayCount = await db.update(staffPayments)
          .set({ eventId })
          .where(eq(staffPayments.userId, user.id))
        console.log(`  ✓ Linked ${staffPayCount} staff payments`)
        dataLinked += staffPayCount
      } else {
        console.log(`  ⚠ Default event already exists, skipping`)
      }
    }

    console.log(`\n\n✅ Migration completed successfully!`)
    console.log(`📊 Summary:`)
    console.log(`   - Events created: ${eventsCreated}`)
    console.log(`   - Data records linked: ${dataLinked}`)
    console.log(`   - Users migrated: ${users.length}`)
    console.log(`\n✨ All data has been preserved and linked to Default events!`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrate().then(() => {
  console.log('\n✓ Process complete')
  process.exit(0)
}).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
