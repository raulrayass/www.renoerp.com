import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'

const TEST_EMAIL = 'lafuentezapopan@gmail.com'

export async function GET() {
  try {
    console.log('[v0] Attempting debug login for:', TEST_EMAIL)

    // Get user from Better Auth table
    const userResult = await db.execute(
      sql`SELECT id, email, name FROM "user" WHERE email = ${TEST_EMAIL}`
    )

    if (!userResult.rows || userResult.rows.length === 0) {
      return Response.json({
        success: false,
        error: `User ${TEST_EMAIL} not found`,
      }, { status: 404 })
    }

    const user = userResult.rows[0] as any
    console.log('[v0] Found user:', user)

    // Check if events exist for this user
    const eventsResult = await db.execute(
      sql`SELECT id, name, status FROM events WHERE "adminId" = ${user.id} LIMIT 5`
    )

    return Response.json({
      success: true,
      message: 'User found. Login using Google OAuth with this email to proceed.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      events: eventsResult.rows,
      instructions: 'User must authenticate with Google OAuth using lafuentezapopan@gmail.com to create a session.',
    })
  } catch (error) {
    console.error('[v0] Debug login error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
