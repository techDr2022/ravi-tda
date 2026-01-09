/**
 * Public Appointment Rescheduling API
 */

import { NextRequest, NextResponse } from 'next/server';
import { rescheduleAppointment, getAppointmentByRef } from '@/lib/appointment-service';
import { rescheduleAppointmentSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingRef, phone, date, time } = body;

    if (!bookingRef || !phone) {
      return NextResponse.json(
        { error: 'Booking reference and phone number are required' },
        { status: 400 }
      );
    }

    // Validate date and time
    const result = rescheduleAppointmentSchema.safeParse({ date, time });
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get appointment and verify phone matches
    const appointment = await getAppointmentByRef(bookingRef);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify phone number matches patient
    if (appointment.patient.phone !== phone) {
      return NextResponse.json(
        { error: 'Phone number does not match' },
        { status: 403 }
      );
    }

    // Check if already cancelled or completed
    if (appointment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot reschedule a cancelled appointment' },
        { status: 400 }
      );
    }

    if (appointment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot reschedule a completed appointment' },
        { status: 400 }
      );
    }

    const updated = await rescheduleAppointment(appointment.id, date, time);

    return NextResponse.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: {
        bookingRef: updated.bookingRef,
        date: updated.date,
        startTime: updated.startTime,
        endTime: updated.endTime,
        rescheduleCount: updated.rescheduleCount,
      }
    });
  } catch (error: any) {
    console.error('Reschedule appointment error:', error);
    
    const userErrors = [
      'Rescheduling is not allowed',
      'Maximum reschedule limit',
      'Rescheduling must be done at least',
      'The new time slot is not available',
    ];

    if (userErrors.some(e => error.message?.includes(e))) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reschedule appointment' },
      { status: 500 }
    );
  }
}
