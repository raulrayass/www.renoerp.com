import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const TEST_EMAIL = 'lafuentezapopan@gmail.com'
const EVENT_NAME = 'Permanence Camp 2024'

export async function GET() {
  try {
    console.log('[v0] Starting SIMPLE database seed...')

    // Get user ID
    const userResult = await db.execute(
      sql`SELECT id FROM "user" WHERE email = ${TEST_EMAIL}`
    )

    if (!userResult.rows || userResult.rows.length === 0) {
      return Response.json({
        success: false,
        error: `User ${TEST_EMAIL} not found`,
      }, { status: 404 })
    }

    const userId = (userResult.rows[0] as any).id
    console.log('[v0] User:', userId)

    // Create event
    const eventResult = await db.execute(
      sql`INSERT INTO events (name, "adminId", status, "startDate", "endDate", country, city, "createdAt", "updatedAt")
          VALUES (${EVENT_NAME}, ${userId}, 'active', '2024-07-01', '2024-07-05', 'MX', 'Zapopan', NOW(), NOW())
          ON CONFLICT DO NOTHING
          RETURNING id`
    )

    if (!eventResult.rows || eventResult.rows.length === 0) {
      const existing = await db.execute(
        sql`SELECT id FROM events WHERE "adminId" = ${userId} LIMIT 1`
      )
      const eventId = (existing.rows[0] as any).id
      console.log('[v0] Event already exists:', eventId)
      return Response.json({ success: true, message: 'Event already exists', eventId })
    }

    const eventId = (eventResult.rows[0] as any).id
    console.log('[v0] Created event:', eventId)

    // Try to insert sample data into app_users table to link to event
    try {
      await db.execute(
        sql`INSERT INTO app_users ("userId") VALUES (${userId}) ON CONFLICT DO NOTHING`
      )
    } catch (e) {
      console.log('[v0] app_users insert skipped')
    }

    return Response.json({
      success: true,
      message: 'Event created successfully!',
      event: {
        id: eventId,
        name: EVENT_NAME,
        adminId: userId,
      }
    })
  } catch (error) {
    console.error('[v0] Seed error:', error)
    return Response.json(
      { 
        success: false, 
        error: String(error).substring(0, 300),
      },
      { status: 500 }
    )
  }
}
