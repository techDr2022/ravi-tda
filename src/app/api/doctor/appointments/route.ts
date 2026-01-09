/**
 * Doctor Appointments API
 * Manage appointments for authenticated doctors
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDoctorProfileByUserId } from '@/lib/doctor-service';
import { 
  getDoctorAppointments, 
  updateAppointmentStatus, 
  addAppointmentNotes,
  getAppointmentStats 
} from '@/lib/appointment-service';
import { parse, startOfDay, endOfDay, addDays } from 'date-fns';

/**
 * GET - Get appointments for the authenticated doctor
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode'); // 'stats' | 'list'
    
    // Return stats
    if (mode === 'stats') {
      const stats = await getAppointmentStats(profile.id);
      return NextResponse.json({ stats });
    }

    // Parse filters
    const dateStr = searchParams.get('date');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const statusParam = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const options: any = { limit, offset };

    if (dateStr) {
      options.date = parse(dateStr, 'yyyy-MM-dd', new Date());
    } else if (startDateStr || endDateStr) {
      if (startDateStr) options.startDate = parse(startDateStr, 'yyyy-MM-dd', new Date());
      if (endDateStr) options.endDate = parse(endDateStr, 'yyyy-MM-dd', new Date());
    }

    if (statusParam) {
      options.status = statusParam.split(',');
    }

    const result = await getDoctorAppointments(profile.id, options);

    return NextResponse.json({
      appointments: result.appointments,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to get appointments' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update appointment (status, notes) - Alias for PATCH
 */
export async function PUT(request: NextRequest) {
  return PATCH(request);
}

/**
 * PATCH - Update appointment (status, notes)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { appointmentId, status, notes, reason } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    // Verify appointment belongs to this doctor
    const { appointments } = await getDoctorAppointments(profile.id, {});
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    let updated;

    if (status) {
      updated = await updateAppointmentStatus(appointmentId, status, reason);
    }

    if (notes !== undefined) {
      updated = await addAppointmentNotes(appointmentId, notes);
    }

    return NextResponse.json({ appointment: updated });
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}
