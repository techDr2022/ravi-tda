/**
 * Resend WhatsApp Message API
 * 
 * ADMIN-ONLY ACCESS
 * Allows admins to manually resend messages for appointments
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminOnly } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { sendAppointmentConfirmation } from '@/lib/messaging-service';
import { z } from 'zod';

const ResendMessageSchema = z.object({
  appointmentId: z.string(),
  messageType: z.enum(['APPOINTMENT_CONFIRMATION', 'APPOINTMENT_REMINDER']).optional().default('APPOINTMENT_CONFIRMATION'),
});

/**
 * POST - Resend WhatsApp message for an appointment
 */
export const POST = withAdminOnly(async (request, context, auth) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = ResendMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { appointmentId, messageType } = validationResult.data;
    const { clinic } = auth;

    // Get appointment with all relations
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctorProfile: true,
        clinic: true,
        consultationType: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify appointment belongs to admin's clinic
    if (appointment.clinicId !== clinic.clinicId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!appointment.patient.phone) {
      return NextResponse.json(
        { error: 'Patient phone number not available' },
        { status: 400 }
      );
    }

    // Send message
    let result;
    if (messageType === 'APPOINTMENT_CONFIRMATION') {
      result = await sendAppointmentConfirmation({
        appointmentId: appointment.id,
        patientName: appointment.patient.name,
        patientPhone: appointment.patient.phone,
        doctorName: appointment.doctorProfile?.name || 'Doctor',
        date: appointment.date,
        time: appointment.startTime,
        bookingRef: appointment.bookingRef,
        clinicId: appointment.clinicId,
        clinicName: appointment.clinic.name,
        clinicPhone: appointment.clinic.phone || undefined,
        clinicAddress: appointment.clinic.address || undefined,
        consultationType: appointment.consultationType.name,
      });
    } else {
      // For reminder, you'd import sendAppointmentReminder
      return NextResponse.json(
        { error: 'Reminder resend not yet implemented' },
        { status: 501 }
      );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        messageLogId: result.messageLogId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Resend message error:', error);
    return NextResponse.json(
      { error: 'Failed to resend message' },
      { status: 500 }
    );
  }
});
