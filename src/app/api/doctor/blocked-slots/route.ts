/**
 * Blocked Slots API
 * Manage vacation days, holidays, and unavailable times
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDoctorProfileByUserId, addBlockedSlot, removeBlockedSlot, getBlockedSlots } from '@/lib/doctor-service';
import { blockedSlotSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';
import { parse, startOfDay, addMonths } from 'date-fns';

/**
 * GET - Get blocked slots for a date range
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile || !profile.clinicId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // Default to next 3 months if not specified
    const startDate = startDateStr 
      ? parse(startDateStr, 'yyyy-MM-dd', new Date())
      : startOfDay(new Date());
    const endDate = endDateStr
      ? parse(endDateStr, 'yyyy-MM-dd', new Date())
      : addMonths(startDate, 3);

    const blockedSlots = await getBlockedSlots(profile.clinicId, startDate, endDate);

    return NextResponse.json({ 
      blockedSlots: blockedSlots.map(slot => ({
        id: slot.id,
        date: slot.date.toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: slot.reason,
        isFullDay: !slot.startTime && !slot.endTime,
      }))
    });
  } catch (error) {
    console.error('Get blocked slots error:', error);
    return NextResponse.json(
      { error: 'Failed to get blocked slots' },
      { status: 500 }
    );
  }
}

/**
 * POST - Add a blocked slot (vacation, holiday, etc.)
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
    
    // Validate input
    const result = blockedSlotSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { date, startTime, endTime, reason } = result.data;
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());

    // Check if there's already a block for this date
    const existing = await prisma.blockedSlot.findFirst({
      where: {
        clinicId: profile.clinicId,
        date: startOfDay(parsedDate),
      },
    });

    if (existing && !startTime && !endTime) {
      return NextResponse.json(
        { error: 'This date is already blocked' },
        { status: 409 }
      );
    }

    const blockedSlot = await addBlockedSlot(
      profile.clinicId,
      startOfDay(parsedDate),
      startTime || undefined,
      endTime || undefined,
      reason || undefined
    );

    return NextResponse.json({
      blockedSlot: {
        id: blockedSlot.id,
        date: blockedSlot.date.toISOString().split('T')[0],
        startTime: blockedSlot.startTime,
        endTime: blockedSlot.endTime,
        reason: blockedSlot.reason,
        isFullDay: !blockedSlot.startTime && !blockedSlot.endTime,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Add blocked slot error:', error);
    return NextResponse.json(
      { error: 'Failed to add blocked slot' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a blocked slot
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

    const existing = await prisma.blockedSlot.findFirst({
      where: { id, clinicId: profile.clinicId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Blocked slot not found' }, { status: 404 });
    }

    await removeBlockedSlot(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete blocked slot error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blocked slot' },
      { status: 500 }
    );
  }
}

/**
 * POST - Bulk add blocked dates (for vacation ranges)
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
    const { startDate, endDate, reason } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());

    if (start > end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Create blocked slots for each day in the range
    const blockedSlots = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      // Check if already blocked
      const existing = await prisma.blockedSlot.findFirst({
        where: {
          clinicId: profile.clinicId,
          date: startOfDay(currentDate),
          startTime: null, // Full day block
        },
      });

      if (!existing) {
        const slot = await addBlockedSlot(
          profile.clinicId,
          startOfDay(currentDate),
          undefined,
          undefined,
          reason || 'Vacation'
        );
        blockedSlots.push({
          id: slot.id,
          date: slot.date.toISOString().split('T')[0],
          reason: slot.reason,
          isFullDay: true,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      message: `Blocked ${blockedSlots.length} days`,
      blockedSlots,
    }, { status: 201 });
  } catch (error) {
    console.error('Bulk add blocked slots error:', error);
    return NextResponse.json(
      { error: 'Failed to add blocked slots' },
      { status: 500 }
    );
  }
}
