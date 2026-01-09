/**
 * Availability API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { 
  getDoctorProfileByUserId, 
  setAvailability, 
  addAvailabilitySlot, 
  deleteAvailabilitySlot 
} from '@/lib/doctor-service';
import { availabilitySchema, bulkAvailabilitySchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

/**
 * GET - Get all availability slots
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile || !profile.clinicId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const availability = await prisma.availability.findMany({
      where: { clinicId: profile.clinicId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json(
      { error: 'Failed to get availability' },
      { status: 500 }
    );
  }
}

/**
 * POST - Add availability slot(s)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile || !profile.clinicId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Check if it's bulk update or single slot
    if (Array.isArray(body)) {
      // Bulk update - replace all
      const result = bulkAvailabilitySchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error.issues[0].message },
          { status: 400 }
        );
      }

      await setAvailability(profile.clinicId, result.data);

      const availability = await prisma.availability.findMany({
        where: { clinicId: profile.clinicId },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      });

      return NextResponse.json({ availability }, { status: 201 });
    } else {
      // Single slot
      const result = availabilitySchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error.issues[0].message },
          { status: 400 }
        );
      }

      const slot = await addAvailabilitySlot(profile.clinicId, result.data);

      return NextResponse.json({ slot }, { status: 201 });
    }
  } catch (error) {
    console.error('Add availability error:', error);
    return NextResponse.json(
      { error: 'Failed to add availability' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Replace all availability
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile || !profile.clinicId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    
    const result = bulkAvailabilitySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await setAvailability(profile.clinicId, result.data);

    const availability = await prisma.availability.findMany({
      where: { clinicId: profile.clinicId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Update availability error:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete availability slot
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile || !profile.clinicId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const existing = await prisma.availability.findFirst({
      where: { id, clinicId: profile.clinicId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Availability slot not found' }, { status: 404 });
    }

    await deleteAvailabilitySlot(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete availability error:', error);
    return NextResponse.json(
      { error: 'Failed to delete availability' },
      { status: 500 }
    );
  }
}
