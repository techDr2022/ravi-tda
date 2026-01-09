/**
 * Quick script to check message logs
 * Run: node check-messages.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMessages() {
  try {
    console.log('📱 Checking WhatsApp Message Logs...\n');
    
    // Get recent messages
    const messages = await prisma.messageLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          select: {
            bookingRef: true,
            patient: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (messages.length === 0) {
      console.log('❌ No messages found in database.');
      console.log('   This could mean:');
      console.log('   1. No appointments have been booked yet');
      console.log('   2. Messaging service is not being called');
      console.log('   3. Database migration not run');
      return;
    }

    console.log(`Found ${messages.length} recent messages:\n`);

    messages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.messageType}`);
      console.log(`   To: ${msg.to}`);
      console.log(`   Status: ${msg.status}`);
      console.log(`   Created: ${msg.createdAt.toLocaleString()}`);
      if (msg.errorMessage) {
        console.log(`   ❌ Error: ${msg.errorMessage}`);
      }
      if (msg.twilioSid) {
        console.log(`   ✅ Twilio SID: ${msg.twilioSid}`);
      }
      if (msg.appointment) {
        console.log(`   Booking Ref: ${msg.appointment.bookingRef}`);
        console.log(`   Patient: ${msg.appointment.patient.name} (${msg.appointment.patient.phone})`);
      }
      console.log('');
    });

    // Get statistics
    const stats = await prisma.messageLog.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    console.log('📊 Statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.id}`);
    });

  } catch (error) {
    console.error('Error checking messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMessages();
