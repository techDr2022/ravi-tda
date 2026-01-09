/**
 * Public Appointment Cancellation API
 */

import { NextRequest, NextResponse } from 'next/server';
import { cancelAppointment, getAppointmentByRef } from '@/lib/appointment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingRef, phone, reason } = body;

    if (!bookingRef || !phone) {
      return NextResponse.json(
        { error: 'Booking reference and phone number are required' },
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

    // Check if already cancelled
    if (appointment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'This appointment has already been cancelled' },
        { status: 400 }
      );
    }

    // Check if completed
    if (appointment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed appointment' },
        { status: 400 }
      );
    }

    await cancelAppointment(appointment.id, reason);

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error: any) {
    console.error('Cancel appointment error:', error);
    
    if (error.message.includes('Cancellation')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
