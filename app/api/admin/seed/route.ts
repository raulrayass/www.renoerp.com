import { db } from '@/lib/db'
import {
  appUsers,
  events,
  eventMembers,
  attendees,
  teams,
  rooms,
  categories,
  transactions,
  staff,
  staffPayments,
  attendeePayments,
  games,
  gameScores,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const TEST_USER_ID = 'test-user-permanece'
const TEST_USER_EMAIL = 'permanece@example.com'
const EVENT_NAME = 'Permanece Camp 2024'

export async function GET() {
  try {
    console.log('[v0] Starting database seed...')

    // Get the current session user or create a test user
    // For now, we'll use a hardcoded user ID that exists in the system
    const userId = TEST_USER_ID
    
    console.log('[v0] Using userId:', userId)

    // 2. Check if event already exists
    const existingEvents = await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .limit(1)

    let eventId: number
    if (existingEvents.length === 0) {
      // Create event
      const [newEvent] = await db
        .insert(events)
        .values({
          userId,
          name: EVENT_NAME,
          description: 'Campamento espiritual de jóvenes - Datos de prueba',
          startDate: new Date('2024-07-01').toISOString(),
          endDate: new Date('2024-07-05').toISOString(),
          location: 'Campamento Regional',
        })
        .returning()

      eventId = newEvent.id
      console.log('[v0] Created event:', eventId)

      // Add user as admin member
      await db.insert(eventMembers).values({
        eventId,
        userId,
        role: 'admin',
      })
    } else {
      eventId = existingEvents[0].id
      console.log('[v0] Event already exists:', eventId)
    }

    // 3. Create teams
    const teamNames = ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Morado']
    const teamColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7']
    let teamIds: number[] = []

    for (let i = 0; i < teamNames.length; i++) {
      const existingTeam = await db
        .select()
        .from(teams)
        .where(
          and(eq(teams.userId, userId), eq(teams.eventId, eventId), eq(teams.name, teamNames[i]))
        )
        .limit(1)

      if (existingTeam.length === 0) {
        const [team] = await db
          .insert(teams)
          .values({
            userId,
            eventId,
            name: teamNames[i],
            color: teamColors[i],
          })
          .returning()
        teamIds.push(team.id)
      } else {
        teamIds.push(existingTeam[0].id)
      }
    }
    console.log('[v0] Teams ready:', teamIds)

    // 4. Create rooms
    const roomNames = ['Cabaña A', 'Cabaña B', 'Cabaña C', 'Cabaña D', 'Dormitorio 1', 'Dormitorio 2']
    const roomCapacities = [10, 10, 12, 12, 20, 20]
    let roomIds: number[] = []

    for (let i = 0; i < roomNames.length; i++) {
      const existingRoom = await db
        .select()
        .from(rooms)
        .where(
          and(eq(rooms.userId, userId), eq(rooms.eventId, eventId), eq(rooms.name, roomNames[i]))
        )
        .limit(1)

      if (existingRoom.length === 0) {
        const [room] = await db
          .insert(rooms)
          .values({
            userId: userId,
            eventId,
            name: roomNames[i],
            capacity: roomCapacities[i],
          })
          .returning()
        roomIds.push(room.id)
      } else {
        roomIds.push(existingRoom[0].id)
      }
    }
    console.log('[v0] Rooms ready:', roomIds)

    // 5. Create attendees (camperos)
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
      const existingAttendee = await db
        .select()
        .from(attendees)
        .where(
          and(eq(attendees.userId, userId), eq(attendees.eventId, eventId), eq(attendees.name, attendeeNames[i]))
        )
        .limit(1)

      if (existingAttendee.length === 0) {
        await db.insert(attendees).values({
          userId: userId,
          eventId,
          name: attendeeNames[i],
          age: 16 + Math.floor(Math.random() * 8),
          shirtSize: shirtSizes[i % shirtSizes.length],
          sex: sexValues[i % 2],
          phone: `+56 9 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
          church: churches[i % churches.length],
          emergencyContactName: 'Papá/Mamá',
          emergencyContactPhone: '+56 2 XXXXXXXX',
          totalAmount: 150000,
          discount: i % 4 === 0 ? 10 : 0,
          amountPaid: i % 2 === 0 ? 150000 : 75000,
          status: i % 2 === 0 ? 'paid' : 'partial',
          roomId: roomIds[i % roomIds.length],
          teamId: teamIds[i % teamIds.length],
          checkedIn: i % 3 === 0,
        })
      }
    }
    console.log('[v0] Created attendees')

    // 6. Create categories
    const categoryData = [
      { name: 'Hospedaje', type: 'expense', color: '#ef4444', icon: 'home' },
      { name: 'Alimentación', type: 'expense', color: '#f97316', icon: 'utensils' },
      { name: 'Cuotas', type: 'income', color: '#22c55e', icon: 'dollar' },
      { name: 'Donaciones', type: 'income', color: '#3b82f6', icon: 'gift' },
      { name: 'Transporte', type: 'expense', color: '#8b5cf6', icon: 'truck' },
    ]
    let categoryIds: number[] = []

    for (const cat of categoryData) {
      const existing = await db
        .select()
        .from(categories)
        .where(
          and(eq(categories.userId, userId), eq(categories.eventId, eventId), eq(categories.name, cat.name))
        )
        .limit(1)

      if (existing.length === 0) {
        const [category] = await db
          .insert(categories)
          .values({
            userId: userId,
            eventId,
            name: cat.name,
            type: cat.type,
            color: cat.color,
            icon: cat.icon,
          })
          .returning()
        categoryIds.push(category.id)
      } else {
        categoryIds.push(existing[0].id)
      }
    }
    console.log('[v0] Categories ready:', categoryIds)

    // 7. Create sample transactions
    const transactionCount = await db
      .select({ count: db.sql<number>`cast(count(*) as integer)` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.eventId, eventId)))

    if (parseInt(transactionCount[0].count as string, 10) === 0) {
      for (let i = 0; i < 15; i++) {
        const isIncome = i % 3 === 0
        const catId = categoryIds[isIncome ? 2 : Math.floor(Math.random() * 2)]
        const amount = isIncome ? 20000 + Math.random() * 30000 : 10000 + Math.random() * 20000

        await db.insert(transactions).values({
          userId: userId,
          eventId,
          categoryId: catId,
          type: isIncome ? 'income' : 'expense',
          amount: amount.toString(),
          description: isIncome ? 'Cuota campero' : 'Gasto operativo',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
        })
      }
    }
    console.log('[v0] Transactions created')

    // 8. Create staff
    const staffNames = ['Pastor Juan', 'Coordinadora María', 'Monitor Diego', 'Enfermera Sofia', 'Cocinero Pablo']
    for (let i = 0; i < staffNames.length; i++) {
      const existingStaff = await db
        .select()
        .from(staff)
        .where(
          and(eq(staff.userId, userId), eq(staff.eventId, eventId), eq(staff.name, staffNames[i]))
        )
        .limit(1)

      if (existingStaff.length === 0) {
        await db.insert(staff).values({
          userId: userId,
          eventId,
          name: staffNames[i],
          age: 30 + Math.floor(Math.random() * 30),
          shirtSize: shirtSizes[i % shirtSizes.length],
          sex: i < 2 ? 'Mujer' : 'Hombre',
          phone: `+56 9 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
          church: churches[i % churches.length],
          category: ['Liderazgo', 'Logística', 'Supervisión', 'Médico', 'Cocina'][i],
          totalAmount: 200000,
          discount: 0,
          amountPaid: 200000,
          status: 'paid',
          checkedIn: true,
        })
      }
    }
    console.log('[v0] Staff created')

    // 9. Create games
    const gameNames = ['Carreras de velocidad', 'Competencia de equipos', 'Juegos acuáticos', 'Torneo de deportes']
    for (let i = 0; i < gameNames.length; i++) {
      const existing = await db
        .select()
        .from(games)
        .where(
          and(eq(games.userId, userId), eq(games.eventId, eventId), eq(games.name, gameNames[i]))
        )
        .limit(1)

      if (existing.length === 0) {
        const [game] = await db
          .insert(games)
          .values({
            userId: userId,
            eventId,
            name: gameNames[i],
            description: `Juego de competencia - ${gameNames[i]}`,
            gameDate: new Date('2024-07-03').toISOString().split('T')[0],
          })
          .returning()

        // Add scores for each team
        for (const teamId of teamIds) {
          const points = Math.floor(Math.random() * 100) + 10
          await db.insert(gameScores).values({
            userId: userId,
            eventId,
            gameId: game.id,
            teamId,
            points,
          })
        }
      }
    }
    console.log('[v0] Games and scores created')

    return Response.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        userId: userId,
        eventId,
        teamCount: teamIds.length,
        roomCount: roomIds.length,
        attendeeCount: attendeeNames.length,
        categoryCount: categoryIds.length,
      },
    })
  } catch (error) {
    console.error('[v0] Seed error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
