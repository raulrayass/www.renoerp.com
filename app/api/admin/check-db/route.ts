import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    // Check what tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    // Check columns in events table
    const eventsColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `)

    // Check if user exists
    const userCheck = await db.execute(sql`
      SELECT id, email FROM "user" LIMIT 5
    `)

    return Response.json({
      success: true,
      tables: tables.rows,
      eventsColumns: eventsColumns.rows,
      users: userCheck.rows,
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: String(error),
    }, { status: 500 })
  }
}
