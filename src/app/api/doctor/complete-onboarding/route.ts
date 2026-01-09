/**
 * Complete Onboarding API
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDoctorProfileByUserId, completeOnboarding } from '@/lib/doctor-service';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile || !profile.clinic) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Validate that profile has minimum required data
    if (!profile.name || !profile.specialization) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      );
    }

    if (profile.clinic.consultationTypes.length === 0) {
      return NextResponse.json(
        { error: 'Please add at least one consultation type' },
        { status: 400 }
      );
    }

    if (profile.clinic.availability.length === 0) {
      return NextResponse.json(
        { error: 'Please set your availability' },
        { status: 400 }
      );
    }

    await completeOnboarding(profile.id);

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding completed successfully',
      bookingUrl: `/${profile.slug}`
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
