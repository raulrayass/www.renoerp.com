import { pool } from '@/lib/db'

const TEST_USER_ID = 'test-user-permanece'
const TEST_USER_EMAIL = 'permanece@example.com'

export async function GET() {
  const client = await pool.connect()
  try {
    console.log('[v0] Starting SQL seed...')

    // 1. Insert user
    await client.query(
      `INSERT INTO "user" (id, email, name, "emailVerified", image)
       VALUES ($1, $2, $3, true, NULL)
       ON CONFLICT (id) DO NOTHING`,
      [TEST_USER_ID, TEST_USER_EMAIL, 'Permanece Camp Admin']
    )
    console.log('[v0] User created/exists')

    // 2. Insert event
    const eventResult = await client.query(
      `INSERT INTO "events" ("userId", "name", "description", "startDate", "endDate", "location", "createdAt", "updatedAt")
       SELECT $1, $2, $3, $4::timestamptz, $5::timestamptz, $6, NOW(), NOW()
       WHERE NOT EXISTS (SELECT 1 FROM "events" WHERE "userId" = $1)
       RETURNING "id"`,
      [
        TEST_USER_ID,
        'Permanece Camp 2024',
        'Campamento espiritual de jóvenes - Datos de prueba',
        '2024-07-01T00:00:00Z',
        '2024-07-05T00:00:00Z',
        'Campamento Regional',
      ]
    )

    const eventId = eventResult.rows[0]?.id || 1
    console.log('[v0] Event ready:', eventId)

    // 3. Insert teams
    const teamNames = ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Morado']
    const teamColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7']

    for (let i = 0; i < teamNames.length; i++) {
      await client.query(
        `INSERT INTO "teams" ("userId", "eventId", "name", "color", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [TEST_USER_ID, eventId, teamNames[i], teamColors[i]]
      )
    }
    console.log('[v0] Teams created')

    // 4. Insert rooms
    const roomNames = ['Cabaña A', 'Cabaña B', 'Cabaña C', 'Cabaña D', 'Dormitorio 1', 'Dormitorio 2']
    const roomCapacities = [10, 10, 12, 12, 20, 20]

    for (let i = 0; i < roomNames.length; i++) {
      await client.query(
        `INSERT INTO "rooms" ("userId", "eventId", "name", "capacity", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [TEST_USER_ID, eventId, roomNames[i], roomCapacities[i]]
      )
    }
    console.log('[v0] Rooms created')

    // 5. Get team IDs
    const teamsResult = await client.query(
      `SELECT id FROM teams WHERE "userId" = $1 AND "eventId" = $2 ORDER BY id`,
      [TEST_USER_ID, eventId]
    )
    const teamIds = teamsResult.rows.map(r => r.id)

    // Get room IDs
    const roomsResult = await client.query(
      `SELECT id FROM rooms WHERE "userId" = $1 AND "eventId" = $2 ORDER BY id`,
      [TEST_USER_ID, eventId]
    )
    const roomIds = roomsResult.rows.map(r => r.id)

    // 6. Insert attendees
    const attendeeNames = [
      'Carlos Rodríguez',
      'María López',
      'Juan Pérez',
      'Ana García',
      'Miguel Sánchez',
      'Isabel Martínez',
      'Diego Flores',
      'Sofia Ramirez',
      'Luis Mendoza',
      'Carmen Torres',
      'Pablo Ortiz',
      'Elena Castillo',
    ]
    const churches = ['Iglesia Central', 'Iglesia de los Andes', 'Iglesia del Espíritu', 'Iglesia Pentecostés']
    const shirtSizes = ['S', 'M', 'L', 'XL']
    const sexValues = ['Hombre', 'Mujer']

    for (let i = 0; i < attendeeNames.length; i++) {
      await client.query(
        `INSERT INTO "attendees" (
          "userId", "eventId", "name", "age", "shirtSize", "sex", "phone", "church",
          "emergencyContactName", "emergencyContactPhone", "totalAmount", "discount",
          "amountPaid", "status", "roomId", "teamId", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
        ON CONFLICT DO NOTHING`,
        [
          TEST_USER_ID,
          eventId,
          attendeeNames[i],
          16 + Math.floor(Math.random() * 8),
          shirtSizes[i % shirtSizes.length],
          sexValues[i % 2],
          `+56 9 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
          churches[i % churches.length],
          'Papá/Mamá',
          '+56 2 XXXXXXXX',
          150000,
          i % 4 === 0 ? 10 : 0,
          i % 2 === 0 ? 150000 : 75000,
          i % 2 === 0 ? 'paid' : 'partial',
          roomIds[i % roomIds.length],
          teamIds[i % teamIds.length],
        ]
      )
    }
    console.log('[v0] Attendees created')

    // 7. Insert categories
    const categories = [
      { name: 'Hospedaje', type: 'expense', color: '#ef4444', icon: 'home' },
      { name: 'Alimentación', type: 'expense', color: '#f97316', icon: 'utensils' },
      { name: 'Cuotas', type: 'income', color: '#22c55e', icon: 'dollar' },
      { name: 'Donaciones', type: 'income', color: '#3b82f6', icon: 'gift' },
      { name: 'Transporte', type: 'expense', color: '#8b5cf6', icon: 'truck' },
    ]

    for (const cat of categories) {
      await client.query(
        `INSERT INTO "categories" ("userId", "eventId", "name", "type", "color", "icon", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT DO NOTHING`,
        [TEST_USER_ID, eventId, cat.name, cat.type, cat.color, cat.icon]
      )
    }
    console.log('[v0] Categories created')

    // 8. Insert sample transactions
    const transactionCount = await client.query(
      `SELECT COUNT(*) as cnt FROM transactions WHERE "userId" = $1 AND "eventId" = $2`,
      [TEST_USER_ID, eventId]
    )

    if (parseInt(transactionCount.rows[0].cnt, 10) === 0) {
      const catResult = await client.query(
        `SELECT id FROM categories WHERE "userId" = $1 AND "eventId" = $2 LIMIT 1`,
        [TEST_USER_ID, eventId]
      )
      const catId = catResult.rows[0]?.id || 1

      for (let i = 0; i < 15; i++) {
        const isIncome = i % 3 === 0
        const amount = isIncome ? 20000 + Math.random() * 30000 : 10000 + Math.random() * 20000

        await client.query(
          `INSERT INTO "transactions" ("userId", "eventId", "categoryId", "type", "amount", "description", "date", "paymentMethod", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [
            TEST_USER_ID,
            eventId,
            catId,
            isIncome ? 'income' : 'expense',
            amount.toFixed(2),
            isIncome ? 'Cuota campero' : 'Gasto operativo',
            new Date().toISOString().split('T')[0],
            'cash',
          ]
        )
      }
    }
    console.log('[v0] Transactions created')

    // 9. Insert staff
    const staffNames = ['Pastor Juan', 'Coordinadora María', 'Monitor Diego', 'Enfermera Sofia', 'Cocinero Pablo']
    for (let i = 0; i < staffNames.length; i++) {
      await client.query(
        `INSERT INTO "staff" (
          "userId", "eventId", "name", "age", "shirtSize", "sex", "phone", "church",
          "category", "totalAmount", "discount", "amountPaid", "status", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        ON CONFLICT DO NOTHING`,
        [
          TEST_USER_ID,
          eventId,
          staffNames[i],
          30 + Math.floor(Math.random() * 30),
          shirtSizes[i % shirtSizes.length],
          i < 2 ? 'Mujer' : 'Hombre',
          `+56 9 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
          churches[i % churches.length],
          ['Liderazgo', 'Logística', 'Supervisión', 'Médico', 'Cocina'][i],
          200000,
          0,
          200000,
          'paid',
        ]
      )
    }
    console.log('[v0] Staff created')

    // 10. Insert games
    const gameNames = ['Carreras de velocidad', 'Competencia de equipos', 'Juegos acuáticos', 'Torneo de deportes']
    for (let i = 0; i < gameNames.length; i++) {
      const gameResult = await client.query(
        `INSERT INTO "games" ("userId", "eventId", "name", "description", "gameDate", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          TEST_USER_ID,
          eventId,
          gameNames[i],
          `Juego de competencia - ${gameNames[i]}`,
          '2024-07-03',
        ]
      )

      if (gameResult.rows[0]) {
        const gameId = gameResult.rows[0].id

        // Add scores for each team
        for (const teamId of teamIds) {
          const points = Math.floor(Math.random() * 100) + 10
          await client.query(
            `INSERT INTO "game_scores" ("userId", "eventId", "gameId", "teamId", "points", "createdAt")
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT DO NOTHING`,
            [TEST_USER_ID, eventId, gameId, teamId, points]
          )
        }
      }
    }
    console.log('[v0] Games and scores created')

    return Response.json({
      success: true,
      message: 'Database seeded successfully with SQL',
      data: {
        userId: TEST_USER_ID,
        eventId,
        teamCount: teamIds.length,
        roomCount: roomIds.length,
        attendeeCount: attendeeNames.length,
        categoryCount: categories.length,
      },
    })
  } catch (error) {
    console.error('[v0] SQL Seed error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
