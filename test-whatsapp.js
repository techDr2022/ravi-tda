/**
 * Test WhatsApp messaging
 * Run: node test-whatsapp.js
 * Note: Environment variables should be loaded from .env automatically by Prisma
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testWhatsApp() {
  try {
    console.log('🧪 Testing WhatsApp Messaging...\n');
    
    // Check environment variables
    console.log('📋 Environment Check:');
    console.log('   TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
    console.log('   TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('   TWILIO_WHATSAPP_FROM:', process.env.TWILIO_WHATSAPP_FROM || '❌ Missing');
    console.log('');

    // Get recent appointment
    const appointment = await prisma.appointment.findFirst({
      include: {
        patient: true,
        doctorProfile: true,
        clinic: {
          include: {
            appointmentRules: true,
          },
        },
        consultationType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!appointment) {
      console.log('❌ No appointments found');
      return;
    }

    if (!appointment.patient.phone) {
      console.log('❌ Appointment found but patient has no phone number');
      return;
    }

    console.log('📅 Found appointment:');
    console.log('   ID:', appointment.id);
    console.log('   Booking Ref:', appointment.bookingRef);
    console.log('   Patient:', appointment.patient.name);
    console.log('   Phone:', appointment.patient.phone);
    console.log('   Date:', appointment.date);
    console.log('   Time:', appointment.startTime);
    console.log('');

    // Check appointment rules
    const rules = appointment.clinic.appointmentRules;
    console.log('⚙️  Appointment Rules:');
    console.log('   Send Confirmation:', rules?.sendConfirmation !== false ? '✅ Enabled' : '❌ Disabled');
    console.log('   Send Reminder:', rules?.sendReminder !== false ? '✅ Enabled' : '❌ Disabled');
    console.log('');

    // Check if message log exists for this appointment
    const existingLog = await prisma.messageLog.findFirst({
      where: {
        appointmentId: appointment.id,
        messageType: 'APPOINTMENT_CONFIRMATION',
      },
    });

    if (existingLog) {
      console.log('📱 Existing Message Log:');
      console.log('   Status:', existingLog.status);
      console.log('   Created:', existingLog.createdAt.toLocaleString());
      if (existingLog.errorMessage) {
        console.log('   ❌ Error:', existingLog.errorMessage);
      }
      if (existingLog.twilioSid) {
        console.log('   ✅ Twilio SID:', existingLog.twilioSid);
      }
      console.log('');
    } else {
      console.log('⚠️  No message log found for this appointment');
      console.log('   This means the messaging service was not called');
      console.log('');
    }

    // Test Twilio client initialization
    console.log('🔧 Testing Twilio Client...');
    try {
      const twilio = require('twilio');
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM?.replace(/\s/g, '');

      if (!accountSid || !authToken || !whatsappFrom) {
        console.log('   ❌ Twilio not fully configured');
        return;
      }

      const client = twilio(accountSid, authToken);
      console.log('   ✅ Twilio client initialized');
      console.log('   From:', whatsappFrom);
      
      // Format phone number
      function formatPhoneNumber(phone) {
        const digits = phone.replace(/\D/g, '');
        const cleaned = digits.startsWith('0') ? digits.substring(1) : digits;
        if (cleaned.length === 10) {
          return `whatsapp:+91${cleaned}`;
        }
        if (cleaned.length > 10) {
          return `whatsapp:+${cleaned}`;
        }
        return `whatsapp:+91${cleaned}`;
      }

      const formattedTo = formatPhoneNumber(appointment.patient.phone);
      console.log('   To:', formattedTo);
      console.log('');

      console.log('💡 Next Steps:');
      console.log('   1. Restart your server: npm run dev');
      console.log('   2. Book a NEW appointment (or resend message manually)');
      console.log('   3. Check server logs for [Twilio] messages');
      console.log('   4. Check message logs: node check-messages.js');
      console.log('');

    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWhatsApp();
