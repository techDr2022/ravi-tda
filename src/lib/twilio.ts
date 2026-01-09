/**
 * Twilio WhatsApp Service
 * Handles sending WhatsApp messages via Twilio API
 */

import twilio from 'twilio';
import { prisma } from './prisma';
import { format } from 'date-fns';
import { MessageType, MessageStatus } from '@prisma/client';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFromRaw = process.env.TWILIO_WHATSAPP_FROM; // Format: whatsapp:+14155238886

// Clean up whatsappFrom (remove spaces)
const whatsappFrom = whatsappFromRaw ? whatsappFromRaw.replace(/\s/g, '') : null;

if (!accountSid || !authToken || !whatsappFrom) {
  console.warn('Twilio credentials not configured. WhatsApp messaging will be disabled.');
  if (!accountSid) console.warn('  - Missing: TWILIO_ACCOUNT_SID');
  if (!authToken) console.warn('  - Missing: TWILIO_AUTH_TOKEN');
  if (!whatsappFrom) console.warn('  - Missing: TWILIO_WHATSAPP_FROM');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// ============================================================================
// MESSAGE TEMPLATES
// ============================================================================

interface AppointmentData {
  patientName: string;
  doctorName: string;
  date: Date;
  time: string;
  bookingRef: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  consultationType?: string;
}

/**
 * Format phone number to E.164 format (required by Twilio)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 0, remove it
  const cleaned = digits.startsWith('0') ? digits.substring(1) : digits;
  
  // If doesn't start with country code, assume India (+91)
  if (cleaned.length === 10) {
    return `whatsapp:+91${cleaned}`;
  }
  
  // If already has country code
  if (cleaned.length > 10) {
    return `whatsapp:+${cleaned}`;
  }
  
  // Default to India
  return `whatsapp:+91${cleaned}`;
}

/**
 * Appointment Confirmation Template
 */
function getAppointmentConfirmationTemplate(data: AppointmentData): string {
  const dateStr = format(data.date, 'EEEE, MMMM d, yyyy');
  const clinicInfo = data.clinicName ? `\n\n📍 ${data.clinicName}` : '';
  const clinicAddress = data.clinicAddress ? `\n${data.clinicAddress}` : '';
  const clinicPhone = data.clinicPhone ? `\n📞 ${data.clinicPhone}` : '';
  
  return `✅ *Appointment Confirmed*

Hello ${data.patientName},

Your appointment has been confirmed!

👨‍⚕️ Doctor: ${data.doctorName}
${data.consultationType ? `📋 Type: ${data.consultationType}\n` : ''}📅 Date: ${dateStr}
🕐 Time: ${data.time}
🔖 Booking Ref: ${data.bookingRef}${clinicInfo}${clinicAddress}${clinicPhone}

Please arrive 10 minutes before your scheduled time.

We look forward to seeing you!`;
}

/**
 * Appointment Reminder Template
 */
function getAppointmentReminderTemplate(data: AppointmentData): string {
  const dateStr = format(data.date, 'EEEE, MMMM d, yyyy');
  const clinicInfo = data.clinicName ? `\n\n📍 ${data.clinicName}` : '';
  const clinicAddress = data.clinicAddress ? `\n${data.clinicAddress}` : '';
  const clinicPhone = data.clinicPhone ? `\n📞 ${data.clinicPhone}` : '';
  
  return `🔔 *Appointment Reminder*

Hello ${data.patientName},

This is a reminder about your upcoming appointment:

👨‍⚕️ Doctor: ${data.doctorName}
${data.consultationType ? `📋 Type: ${data.consultationType}\n` : ''}📅 Date: ${dateStr}
🕐 Time: ${data.time}
🔖 Booking Ref: ${data.bookingRef}${clinicInfo}${clinicAddress}${clinicPhone}

Please arrive 10 minutes before your scheduled time.

See you soon!`;
}

/**
 * Appointment Cancellation Template
 */
function getAppointmentCancellationTemplate(data: AppointmentData, reason?: string): string {
  const dateStr = format(data.date, 'EEEE, MMMM d, yyyy');
  
  return `❌ *Appointment Cancelled*

Hello ${data.patientName},

Your appointment has been cancelled:

👨‍⚕️ Doctor: ${data.doctorName}
📅 Date: ${dateStr}
🕐 Time: ${data.time}
🔖 Booking Ref: ${data.bookingRef}${reason ? `\n\nReason: ${reason}` : ''}

If you need to reschedule, please contact us.

Thank you.`;
}

/**
 * Appointment Reschedule Template
 */
function getAppointmentRescheduleTemplate(data: AppointmentData, oldDate: Date, oldTime: string): string {
  const dateStr = format(data.date, 'EEEE, MMMM d, yyyy');
  const oldDateStr = format(oldDate, 'EEEE, MMMM d, yyyy');
  
  return `🔄 *Appointment Rescheduled*

Hello ${data.patientName},

Your appointment has been rescheduled:

👨‍⚕️ Doctor: ${data.doctorName}
📅 New Date: ${dateStr}
🕐 New Time: ${data.time}
🔖 Booking Ref: ${data.bookingRef}

Previous appointment:
📅 Date: ${oldDateStr}
🕐 Time: ${oldTime}

Please arrive 10 minutes before your scheduled time.

Thank you.`;
}

// ============================================================================
// MESSAGE SENDING
// ============================================================================

interface SendMessageOptions {
  clinicId: string;
  appointmentId?: string;
  to: string;
  messageType: MessageType;
  template?: string;
  content?: string;
  templateData?: AppointmentData;
  oldDate?: Date;
  oldTime?: string;
  cancellationReason?: string;
}

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(options: SendMessageOptions): Promise<{
  success: boolean;
  messageLogId?: string;
  error?: string;
}> {
  // Check if Twilio is configured
  if (!client || !whatsappFrom) {
    console.warn('Twilio not configured. Message not sent.');
    return {
      success: false,
      error: 'Twilio not configured',
    };
  }

  try {
    // Format phone number
    const formattedTo = formatPhoneNumber(options.to);

    // Generate message content
    let messageContent = options.content;
    
    if (!messageContent && options.templateData) {
      switch (options.messageType) {
        case 'APPOINTMENT_CONFIRMATION':
          messageContent = getAppointmentConfirmationTemplate(options.templateData);
          break;
        case 'APPOINTMENT_REMINDER':
          messageContent = getAppointmentReminderTemplate(options.templateData);
          break;
        case 'APPOINTMENT_CANCELLATION':
          messageContent = getAppointmentCancellationTemplate(
            options.templateData,
            options.cancellationReason
          );
          break;
        case 'APPOINTMENT_RESCHEDULE':
          if (options.oldDate && options.oldTime) {
            messageContent = getAppointmentRescheduleTemplate(
              options.templateData,
              options.oldDate,
              options.oldTime
            );
          }
          break;
        default:
          messageContent = options.content || '';
      }
    }

    if (!messageContent) {
      return {
        success: false,
        error: 'Message content is required',
      };
    }

    // Create message log entry (pending)
    const messageLog = await prisma.messageLog.create({
      data: {
        clinicId: options.clinicId,
        appointmentId: options.appointmentId,
        to: formattedTo,
        messageType: options.messageType,
        template: options.template,
        content: messageContent,
        status: 'PENDING',
      },
    });

    // Send message via Twilio
    let twilioSid: string | undefined;
    let errorMessage: string | undefined;

    try {
      console.log(`[Twilio] Sending WhatsApp message to ${formattedTo} from ${whatsappFrom}`);
      
      const message = await client.messages.create({
        from: whatsappFrom!,
        to: formattedTo,
        body: messageContent,
      });

      twilioSid = message.sid;
      console.log(`[Twilio] Message sent successfully. SID: ${twilioSid}`);

      // Update message log with success
      await prisma.messageLog.update({
        where: { id: messageLog.id },
        data: {
          status: 'SENT',
          twilioSid,
          sentAt: new Date(),
        },
      });

      return {
        success: true,
        messageLogId: messageLog.id,
      };
    } catch (twilioError: any) {
      errorMessage = twilioError.message || 'Failed to send message';
      console.error(`[Twilio] Error sending message:`, {
        error: twilioError.message,
        code: twilioError.code,
        status: twilioError.status,
        to: formattedTo,
        from: whatsappFrom,
      });

      // Update message log with error
      await prisma.messageLog.update({
        where: { id: messageLog.id },
        data: {
          status: 'FAILED',
          errorMessage: `${errorMessage} (Code: ${twilioError.code || 'N/A'})`,
        },
      });

      return {
        success: false,
        messageLogId: messageLog.id,
        error: errorMessage,
      };
    }
  } catch (error: any) {
    console.error('Send WhatsApp message error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send message',
    };
  }
}

/**
 * Update message status from Twilio webhook
 */
export async function updateMessageStatus(
  messageSid: string,
  status: string
): Promise<void> {
  try {
    const messageLog = await prisma.messageLog.findFirst({
      where: { twilioSid: messageSid },
    });

    if (!messageLog) {
      console.warn(`Message log not found for SID: ${messageSid}`);
      return;
    }

    let messageStatus: MessageStatus = 'SENT';
    const updateData: any = {};

    switch (status.toLowerCase()) {
      case 'delivered':
        messageStatus = 'DELIVERED';
        updateData.deliveredAt = new Date();
        break;
      case 'read':
        messageStatus = 'READ';
        updateData.readAt = new Date();
        break;
      case 'failed':
      case 'undelivered':
        messageStatus = 'FAILED';
        break;
      default:
        messageStatus = 'SENT';
    }

    await prisma.messageLog.update({
      where: { id: messageLog.id },
      data: {
        status: messageStatus,
        ...updateData,
      },
    });
  } catch (error) {
    console.error('Update message status error:', error);
  }
}
