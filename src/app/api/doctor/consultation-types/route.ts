/**
 * Consultation Types API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDoctorProfileByUserId, addConsultationType, updateConsultationType, deleteConsultationType } from '@/lib/doctor-service';
import { consultationTypeSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

/**
 * Helper to ensure doctor has a clinic (creates one if needed)
 */
async function ensureClinicExists(profile: { id: string; clinicId: string | null; name: string; slug: string; phone: string | null; address: string | null; city: string | null; state: string | null; pincode: string | null; clinicName: string | null; defaultDuration: number; bufferTime: number }, userId: string) {
  if (profile.clinicId) {
    return profile.clinicId;
  }

  // Create a clinic for this doctor
  const clinic = await prisma.clinic.create({
    data: {
      name: profile.clinicName || `${profile.name}'s Clinic`,
      slug: profile.slug,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      defaultDuration: profile.defaultDuration,
      bufferTime: profile.bufferTime,
    },
  });

  // Link doctor profile to clinic
  await prisma.doctorProfile.update({
    where: { id: profile.id },
    data: { clinicId: clinic.id },
  });

  // Add user as ADMIN staff
  await prisma.clinicStaff.create({
    data: {
      clinicId: clinic.id,
      userId,
      role: 'ADMIN',
      jobTitle: 'Owner',
      isActive: true,
      joinedAt: new Date(),
    },
  });

  return clinic.id;
}

/**
 * GET - Get all consultation types
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const clinicId = await ensureClinicExists(profile, session.user.id);

    const consultationTypes = await prisma.consultationType.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ consultationTypes });
  } catch (error) {
    console.error('Get consultation types error:', error);
    return NextResponse.json(
      { error: 'Failed to get consultation types' },
      { status: 500 }
    );
  }
}

/**
 * POST - Add new consultation type
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const clinicId = await ensureClinicExists(profile, session.user.id);

    const body = await request.json();
    
    const result = consultationTypeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const consultationType = await addConsultationType(clinicId, result.data);

    return NextResponse.json({ consultationType }, { status: 201 });
  } catch (error) {
    console.error('Add consultation type error:', error);
    return NextResponse.json(
      { error: 'Failed to add consultation type' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update consultation type
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const clinicId = await ensureClinicExists(profile, session.user.id);

    const existing = await prisma.consultationType.findFirst({
      where: { id, clinicId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Consultation type not found' }, { status: 404 });
    }

    const consultationType = await updateConsultationType(id, data);

    return NextResponse.json({ consultationType });
  } catch (error) {
    console.error('Update consultation type error:', error);
    return NextResponse.json(
      { error: 'Failed to update consultation type' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete consultation type
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
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const clinicId = await ensureClinicExists(profile, session.user.id);

    const existing = await prisma.consultationType.findFirst({
      where: { id, clinicId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Consultation type not found' }, { status: 404 });
    }

    // Check if there are appointments using this type
    const appointmentCount = await prisma.appointment.count({
      where: { consultationTypeId: id },
    });

    if (appointmentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete: This consultation type has existing appointments' },
        { status: 400 }
      );
    }

    await deleteConsultationType(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete consultation type error:', error);
    return NextResponse.json(
      { error: 'Failed to delete consultation type' },
      { status: 500 }
    );
  }
}
