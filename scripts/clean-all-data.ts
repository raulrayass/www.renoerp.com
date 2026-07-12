import { db } from '@/lib/db'
import { attendees, attendeePayments, categories, churches, teams, rooms, games, gameScores, transactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function cleanAllData() {
  try {
    console.log('🧹 Iniciando limpieza de datos...\n')

    // Get all user IDs to clean their data
    const allTransactions = await db.select().from(transactions)
    const userIds = new Set(allTransactions.map((t) => t.userId).filter(Boolean))

    if (userIds.size === 0) {
      console.log('ℹ️  No hay datos para limpiar')
      return
    }

    for (const userId of userIds) {
      console.log(`Limpiando datos del usuario: ${userId}`)

      // Delete in order of dependencies (foreign keys first)
      await db.delete(gameScores).where(eq(gameScores.userId, userId))
      console.log('  ✓ Game scores eliminados')

      await db.delete(attendeePayments).where(eq(attendeePayments.userId, userId))
      console.log('  ✓ Pagos de camperos eliminados')

      await db.delete(attendees).where(eq(attendees.userId, userId))
      console.log('  ✓ Camperos eliminados')

      await db.delete(transactions).where(eq(transactions.userId, userId))
      console.log('  ✓ Transacciones eliminadas')

      await db.delete(games).where(eq(games.userId, userId))
      console.log('  ✓ Juegos eliminados')

      await db.delete(categories).where(eq(categories.userId, userId))
      console.log('  ✓ Categorías eliminadas')

      await db.delete(churches).where(eq(churches.userId, userId))
      console.log('  ✓ Iglesias eliminadas')

      await db.delete(teams).where(eq(teams.userId, userId))
      console.log('  ✓ Equipos eliminados')

      await db.delete(rooms).where(eq(rooms.userId, userId))
      console.log('  ✓ Habitaciones eliminadas')
    }

    console.log('\n✅ Todos los datos han sido eliminados exitosamente')
    console.log('📋 La app está lista para nuevos datos')
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error)
    process.exit(1)
  }
}

cleanAllData()
