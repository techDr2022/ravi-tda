/**
 * Doctor Profile API
 * Handles profile CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { 
  createDoctorProfile, 
  updateDoctorProfile, 
  getDoctorProfileByUserId,
  isSlugAvailable 
} from '@/lib/doctor-service';
import { doctorProfileSchema, updateDoctorProfileSchema } from '@/lib/validations';

/**
 * GET - Get current doctor's profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    
    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new doctor profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if profile already exists
    const existing = await getDoctorProfileByUserId(session.user.id);
    if (existing) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const result = doctorProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check slug availability
    const slugAvailable = await isSlugAvailable(result.data.slug);
    if (!slugAvailable) {
      return NextResponse.json(
        { error: 'This URL is already taken. Please choose another.' },
        { status: 409 }
      );
    }

    const profile = await createDoctorProfile(session.user.id, result.data);

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update doctor profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await getDoctorProfileByUserId(session.user.id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const result = updateDoctorProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const profile = await updateDoctorProfile(existing.id, result.data);

    return NextResponse.json({ profile });
  } catch (error: any) {
    if (error.message === 'This URL is already taken') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
