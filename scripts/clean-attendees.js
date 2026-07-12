const { db } = require('../lib/db');
const { attendeePayments, attendees, transactions } = require('../lib/db/schema');
const { eq } = require('drizzle-orm');

async function cleanAttendees() {
  try {
    // Get user ID (assuming you'll pass it as env var or use first user)
    const userId = process.env.USER_ID || 'test-user';
    
    console.log(`Limpiando datos para usuario: ${userId}`);
    
    // Delete attendee payments
    await db.delete(attendeePayments).where(eq(attendeePayments.userId, userId));
    console.log('✓ Pagos de camperos eliminados');
    
    // Delete attendees
    await db.delete(attendees).where(eq(attendees.userId, userId));
    console.log('✓ Camperos eliminados');
    
    console.log('✓ Limpieza completada');
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanAttendees();
