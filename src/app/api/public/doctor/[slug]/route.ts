/**
 * Public Doctor Profile API
 * Get doctor info by slug for booking page
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDoctorProfileBySlug } from '@/lib/doctor-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const profile = await getDoctorProfileBySlug(slug);

    if (!profile || !profile.isActive || !profile.onboardingComplete || !profile.clinic) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Return public-safe profile data
    return NextResponse.json({
      doctor: {
        slug: profile.slug,
        name: profile.name,
        photo: profile.photo,
        specialization: profile.specialization,
        qualifications: profile.qualifications,
        bio: profile.bio,
        experience: profile.experience,
        phone: profile.phone,
        clinicName: profile.clinicName,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        consultationTypes: profile.clinic.consultationTypes.map(ct => ({
          id: ct.id,
          name: ct.name,
          type: ct.type,
          description: ct.description,
          fee: ct.fee,
          duration: ct.duration,
        })),
        availability: profile.clinic.availability.map(a => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        })),
        appointmentRules: profile.clinic.appointmentRules ? {
          minAdvanceBooking: profile.clinic.appointmentRules.minAdvanceBooking,
          maxAdvanceBooking: profile.clinic.appointmentRules.maxAdvanceBooking,
          allowCancellation: profile.clinic.appointmentRules.allowCancellation,
          cancellationWindow: profile.clinic.appointmentRules.cancellationWindow,
          requirePayment: profile.clinic.appointmentRules.requirePayment,
          paymentMode: profile.clinic.appointmentRules.paymentMode,
        } : null,
      }
    });
  } catch (error) {
    console.error('Get public doctor error:', error);
    return NextResponse.json(
      { error: 'Failed to get doctor info' },
      { status: 500 }
    );
  }
}
