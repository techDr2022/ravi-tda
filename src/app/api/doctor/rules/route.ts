/**
 * Appointment Rules API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDoctorProfileByUserId, setAppointmentRules } from '@/lib/doctor-service';
import { appointmentRulesSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

/**
 * GET - Get appointment rules
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

    const rules = await prisma.appointmentRules.findUnique({
      where: { clinicId: profile.clinicId },
    });

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Get rules error:', error);
    return NextResponse.json(
      { error: 'Failed to get appointment rules' },
      { status: 500 }
    );
  }
}

/**
 * POST/PUT - Set or update appointment rules
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
    
    const result = appointmentRulesSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const rules = await setAppointmentRules(profile.clinicId, result.data);

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Set rules error:', error);
    return NextResponse.json(
      { error: 'Failed to set appointment rules' },
      { status: 500 }
    );
  }
}

export { POST as PUT };
