/**
 * Public Slots API
 * Get available appointment slots for a doctor on a specific date
 * 
 * Modes:
 * - `dates`: Get available dates for next N days
 * - `slots`: Get available time slots for a specific date
 * - `next`: Find next available slot
 */

import { NextRequest, NextResponse } from 'next/server';
import { parse, isValid, format } from 'date-fns';
import { 
  generateSlotsForDate, 
  getAvailableDates,
  getSlotStats,
  findNextAvailableSlot 
} from '@/lib/slots';
import { getDoctorProfileBySlug } from '@/lib/doctor-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const dateStr = searchParams.get('date');
    const consultationTypeId = searchParams.get('consultationTypeId');
    const mode = searchParams.get('mode'); // 'dates', 'slots', 'next', or 'stats'

    if (!slug) {
      return NextResponse.json(
        { error: 'Doctor slug is required' },
        { status: 400 }
      );
    }

    // Get doctor profile
    const profile = await getDoctorProfileBySlug(slug);

    if (!profile || !profile.isActive || !profile.onboardingComplete) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Mode: Get available dates
    if (mode === 'dates') {
      const days = parseInt(searchParams.get('days') || '30');
      const availableDates = await getAvailableDates(profile.id, days);
      
      return NextResponse.json({
        dates: availableDates.map(d => ({
          date: format(d, 'yyyy-MM-dd'),
          dayOfWeek: format(d, 'EEEE'),
          displayDate: format(d, 'MMM d, yyyy'),
        })),
        totalDays: availableDates.length,
      });
    }

    // Mode: Find next available slot
    if (mode === 'next') {
      const nextSlot = await findNextAvailableSlot(
        profile.id,
        consultationTypeId || undefined
      );

      if (!nextSlot) {
        return NextResponse.json({
          message: 'No available slots found in the next 30 days',
          nextSlot: null,
        });
      }

      return NextResponse.json({
        nextSlot: {
          date: nextSlot.date,
          displayDate: format(parse(nextSlot.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMM d'),
          time: nextSlot.slot.time,
          displayTime: nextSlot.slot.displayTime,
          endTime: nextSlot.slot.endTime,
          duration: nextSlot.slot.duration,
        },
      });
    }

    // Mode: Get slots for a specific date (default)
    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date is required. Use ?mode=dates to get available dates first.' },
        { status: 400 }
      );
    }

    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    
    if (!isValid(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Mode: Get slot statistics for a date
    if (mode === 'stats') {
      const stats = await getSlotStats(profile.id, date);
      return NextResponse.json({
        date: dateStr,
        ...stats,
      });
    }

    // Generate slots for the date
    const allSlots = await generateSlotsForDate({
      doctorProfileId: profile.id,
      date,
      consultationTypeId: consultationTypeId || undefined,
    });

    // Filter to only available slots for public API
    const availableSlots = allSlots.filter(s => s.available);

    // Group slots by time period for better UX
    const morning = availableSlots.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour < 12;
    });
    const afternoon = availableSlots.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 12 && hour < 17;
    });
    const evening = availableSlots.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 17;
    });

    return NextResponse.json({
      date: dateStr,
      displayDate: format(date, 'EEEE, MMMM d, yyyy'),
      slots: availableSlots.map(s => ({
        time: s.time,
        displayTime: s.displayTime,
        endTime: s.endTime,
        displayEndTime: s.displayEndTime,
        duration: s.duration,
      })),
      grouped: {
        morning: morning.map(s => ({ time: s.time, displayTime: s.displayTime })),
        afternoon: afternoon.map(s => ({ time: s.time, displayTime: s.displayTime })),
        evening: evening.map(s => ({ time: s.time, displayTime: s.displayTime })),
      },
      summary: {
        total: availableSlots.length,
        morning: morning.length,
        afternoon: afternoon.length,
        evening: evening.length,
      },
    });
  } catch (error) {
    console.error('Get slots error:', error);
    return NextResponse.json(
      { error: 'Failed to get available slots' },
      { status: 500 }
    );
  }
}
