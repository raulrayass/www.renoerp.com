import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const TEST_EMAIL = 'lafuentezapopan@gmail.com'
const EVENT_NAME = 'Permanence Camp 2024'

export async function GET() {
  try {
    console.log('[v0] Starting database seed with SQL...')

    // Get user ID from Better Auth user table
    const userResult = await db.execute(
      sql`SELECT id FROM "user" WHERE email = ${TEST_EMAIL}`
    )

    if (!userResult.rows || userResult.rows.length === 0) {
      return Response.json({
        success: false,
        error: `User with email ${TEST_EMAIL} not found`,
        hint: 'Please register at /auth/signup first'
      }, { status: 404 })
    }

    const userId = (userResult.rows[0] as any).id
    console.log('[v0] Found user:', userId)

    // 1. Get or create event
    const eventResult = await db.execute(
      sql`SELECT id FROM events WHERE "adminId" = ${userId}`
    )

    let eventId: number
    if (!eventResult.rows || eventResult.rows.length === 0) {
      const createResult = await db.execute(
        sql`INSERT INTO events (name, "adminId", status, "startDate", "endDate", country, city, "createdAt", "updatedAt")
            VALUES (${EVENT_NAME}, ${userId}, 'active', '2024-07-01', '2024-07-05', 'MX', 'Zapopan', NOW(), NOW())
            RETURNING id`
      )
      eventId = (createResult.rows[0] as any).id
      console.log('[v0] Created event with ID:', eventId)
    } else {
      eventId = (eventResult.rows[0] as any).id
      console.log('[v0] Event already exists with ID:', eventId)
    }

    // 2. Create teams
    await db.execute(sql`
      INSERT INTO teams ("userId", "eventId", "name", "color", "createdAt", "updatedAt")
      VALUES 
        (${userId}, ${eventId}, 'Equipo Rojo', '#ef4444', NOW(), NOW()),
        (${userId}, ${eventId}, 'Equipo Azul', '#3b82f6', NOW(), NOW()),
        (${userId}, ${eventId}, 'Equipo Verde', '#22c55e', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `)
    console.log('[v0] Created/verified teams')

    // 3. Create rooms
    await db.execute(sql`
      INSERT INTO rooms ("userId", "eventId", "name", "capacity", "createdAt", "updatedAt")
      VALUES 
        (${userId}, ${eventId}, 'Cuarto 101', 4, NOW(), NOW()),
        (${userId}, ${eventId}, 'Cuarto 102', 4, NOW(), NOW()),
        (${userId}, ${eventId}, 'Cuarto 103', 4, NOW(), NOW()),
        (${userId}, ${eventId}, 'Cuarto 201', 4, NOW(), NOW()),
        (${userId}, ${eventId}, 'Cuarto 202', 4, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `)
    console.log('[v0] Created/verified rooms')

    // 4. Create categories
    await db.execute(sql`
      INSERT INTO categories ("userId", "eventId", "name", "type", "color", "createdAt", "updatedAt")
      VALUES 
        (${userId}, ${eventId}, 'Comida', 'expense', '#f59e0b', NOW(), NOW()),
        (${userId}, ${eventId}, 'Transporte', 'expense', '#8b5cf6', NOW(), NOW()),
        (${userId}, ${eventId}, 'Hospedaje', 'expense', '#06b6d4', NOW(), NOW()),
        (${userId}, ${eventId}, 'Actividades', 'expense', '#ec4899', NOW(), NOW()),
        (${userId}, ${eventId}, 'Donaciones', 'income', '#10b981', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `)
    console.log('[v0] Created/verified categories')

    // 5. Create attendees
    await db.execute(sql`
      INSERT INTO attendees ("userId", "eventId", "name", "phone", "email", "age", "createdAt", "updatedAt")
      VALUES 
        (${userId}, ${eventId}, 'Juan Pérez', '555-1001', 'juan@example.com', 16, NOW(), NOW()),
        (${userId}, ${eventId}, 'María García', '555-1002', 'maria@example.com', 15, NOW(), NOW()),
        (${userId}, ${eventId}, 'Carlos López', '555-1003', 'carlos@example.com', 17, NOW(), NOW()),
        (${userId}, ${eventId}, 'Ana Martínez', '555-1004', 'ana@example.com', 15, NOW(), NOW()),
        (${userId}, ${eventId}, 'Pedro González', '555-1005', 'pedro@example.com', 16, NOW(), NOW()),
        (${userId}, ${eventId}, 'Laura Rodríguez', '555-1006', 'laura@example.com', 14, NOW(), NOW()),
        (${userId}, ${eventId}, 'Diego Fernández', '555-1007', 'diego@example.com', 18, NOW(), NOW()),
        (${userId}, ${eventId}, 'Sofia Sánchez', '555-1008', 'sofia@example.com', 16, NOW(), NOW()),
        (${userId}, ${eventId}, 'Miguel Torres', '555-1009', 'miguel@example.com', 15, NOW(), NOW()),
        (${userId}, ${eventId}, 'Elena Flores', '555-1010', 'elena@example.com', 17, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `)
    console.log('[v0] Created/verified attendees')

    // 6. Create transactions
    const catResult = await db.execute(
      sql`SELECT id FROM categories WHERE "userId" = ${userId} AND "eventId" = ${eventId} LIMIT 1`
    )
    
    if (catResult.rows && catResult.rows.length > 0) {
      const categoryId = (catResult.rows[0] as any).id
      await db.execute(sql`
        INSERT INTO transactions ("userId", "eventId", "categoryId", "type", "amount", "description", "date", "createdAt", "updatedAt")
        VALUES 
          (${userId}, ${eventId}, ${categoryId}, 'expense', '500', 'Comida día 1', CURRENT_DATE, NOW(), NOW()),
          (${userId}, ${eventId}, ${categoryId}, 'expense', '1500', 'Transporte al campamento', CURRENT_DATE, NOW(), NOW()),
          (${userId}, ${eventId}, ${categoryId}, 'income', '200', 'Aportación voluntaria', CURRENT_DATE, NOW(), NOW()),
          (${userId}, ${eventId}, ${categoryId}, 'expense', '2500', 'Hospedaje 5 noches', CURRENT_DATE, NOW(), NOW()),
          (${userId}, ${eventId}, ${categoryId}, 'income', '500', 'Aportación evento', CURRENT_DATE, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `)
      console.log('[v0] Created/verified transactions')
    }

    // 7. Create staff
    await db.execute(sql`
      INSERT INTO staff ("userId", "eventId", "name", "role", "phone", "email", "createdAt", "updatedAt")
      VALUES 
        (${userId}, ${eventId}, 'Coordinador 1', 'Coordinador', '555-2001', 'staff1@example.com', NOW(), NOW()),
        (${userId}, ${eventId}, 'Coordinador 2', 'Coordinador', '555-2002', 'staff2@example.com', NOW(), NOW()),
        (${userId}, ${eventId}, 'Asistente 1', 'Asistente', '555-2003', 'staff3@example.com', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `)
    console.log('[v0] Created/verified staff')

    // 8. Create games
    const gameResult = await db.execute(sql`
      INSERT INTO games ("userId", "eventId", "name", "description", "gameDate", "createdAt", "updatedAt")
      VALUES 
        (${userId}, ${eventId}, 'Competencia de carreras', 'Carrera de 100 metros', '2024-07-03', NOW(), NOW()),
        (${userId}, ${eventId}, 'Baloncesto', 'Partido de baloncesto', '2024-07-03', NOW(), NOW()),
        (${userId}, ${eventId}, 'Fútbol', 'Partido de fútbol', '2024-07-04', NOW(), NOW())
      ON CONFLICT DO NOTHING
      RETURNING id
    `)
    console.log('[v0] Created/verified games')

    // 9. Get teams and add game scores
    const teamsResult = await db.execute(
      sql`SELECT id FROM teams WHERE "userId" = ${userId} AND "eventId" = ${eventId}`
    )

    if (gameResult.rows && gameResult.rows.length > 0 && teamsResult.rows && teamsResult.rows.length > 0) {
      for (const gameRow of gameResult.rows) {
        const gameId = (gameRow as any).id
        for (const teamRow of teamsResult.rows) {
          const teamId = (teamRow as any).id
          await db.execute(sql`
            INSERT INTO game_scores ("userId", "eventId", "gameId", "teamId", "points", "createdAt")
            VALUES (${userId}, ${eventId}, ${gameId}, ${teamId}, ${Math.random() * 50 + 100}, NOW())
            ON CONFLICT DO NOTHING
          `)
        }
      }
      console.log('[v0] Created/verified game scores')
    }

    console.log('[v0] ✅ Seed completed successfully!')

    return Response.json({
      success: true,
      message: 'Database seeded successfully!',
      userId,
      eventId,
      data: {
        teams: 3,
        rooms: 5,
        attendees: 10,
        staff: 3,
        games: 3,
        categories: 5,
        transactions: 5
      }
    })
  } catch (error) {
    console.error('[v0] Seed error:', error)
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: String(error).substring(0, 500),
      },
      { status: 500 }
    )
  }
}
