/**
 * Public Appointments API
 * Book new appointments
 */

import { NextRequest, NextResponse } from 'next/server';
import { bookAppointment, getAppointmentByRef } from '@/lib/appointment-service';
import { createAppointmentSchema } from '@/lib/validations';

/**
 * POST - Book a new appointment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = createAppointmentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const appointment = await bookAppointment(result.data);

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        bookingRef: appointment.bookingRef,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        fee: appointment.fee,
        doctor: appointment.doctorProfile,
        consultationType: appointment.consultationType,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Book appointment error:', error);
    
    // Return user-friendly error messages
    const userErrors = [
      'Doctor not found or unavailable',
      'Consultation type not available',
      'This time slot is no longer available',
      'Doctor is fully booked for this day',
      'Maximum bookings per day exceeded',
    ];

    if (userErrors.includes(error.message)) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to book appointment. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get appointment by booking reference
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingRef = searchParams.get('ref');

    if (!bookingRef) {
      return NextResponse.json(
        { error: 'Booking reference is required' },
        { status: 400 }
      );
    }

    const appointment = await getAppointmentByRef(bookingRef);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      appointment: {
        bookingRef: appointment.bookingRef,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        fee: appointment.fee,
        paymentStatus: appointment.payment?.status ?? 'PENDING',
        doctor: appointment.doctorProfile,
        patient: {
          name: appointment.patient.name,
          phone: appointment.patient.phone,
        },
        consultationType: appointment.consultationType,
        reasonForVisit: appointment.reasonForVisit,
        createdAt: appointment.createdAt,
      }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    return NextResponse.json(
      { error: 'Failed to get appointment' },
      { status: 500 }
    );
  }
}
