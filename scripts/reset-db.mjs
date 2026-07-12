import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function resetDatabase() {
  try {
    console.log('Limpiando datos...');
    
    // Limpiar tablas en orden correcto (respetando foreign keys)
    await sql`DELETE FROM attendee_payments`;
    console.log('✓ Pagos de camperos eliminados');
    
    await sql`DELETE FROM attendees`;
    console.log('✓ Camperos eliminados');
    
    console.log('\n✅ Base de datos limpiada - Lista para nuevos datos');
  } catch (error) {
    console.error('Error al limpiar:', error.message);
    process.exit(1);
  }
}

resetDatabase();
