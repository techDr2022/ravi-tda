/**
 * Slot Generation Logic
 * 
 * Generates available appointment slots based on:
 * - Doctor's availability schedule (multiple windows per day)
 * - Consultation type duration
 * - Buffer/break time between appointments
 * - Existing appointments (prevents overlaps)
 * - Blocked dates/times
 * - Booking window rules (min/max advance booking)
 */

import { 
  format, 
  addMinutes, 
  isAfter, 
  isBefore, 
  startOfDay, 
  endOfDay,
  addDays,
  setHours,
  setMinutes,
} from 'date-fns';
import prisma from './prisma';
import { DayOfWeek } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface TimeSlot {
  time: string;         // Start time "HH:MM" format (24-hour)
  displayTime: string;  // Display format "h:mm AM/PM"
  endTime: string;      // End time "HH:MM" format
  displayEndTime: string; // Display end time
  duration: number;     // Duration in minutes
  available: boolean;   // Is slot bookable
  reason?: string;      // Reason if unavailable (for debugging)
}

export interface SlotGenerationParams {
  doctorProfileId: string;
  date: Date;
  consultationTypeId?: string;
  duration?: number;  // Override duration
}

export interface AvailabilityWindow {
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
}

export interface BookedSlot {
  startMinutes: number;
  endMinutes: number;
  bufferEnd: number;  // End time including buffer
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Map JavaScript day (0-6) to Prisma DayOfWeek enum
const JS_DAY_TO_PRISMA: Record<number, DayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

// ============================================================================
// MAIN SLOT GENERATION
// ============================================================================

/**
 * Generate available slots for a specific date
 * 
 * Algorithm:
 * 1. Validate doctor profile and get settings
 * 2. Get consultation type duration
 * 3. Check if date is within booking window
 * 4. Get availability windows for the day of week
 * 5. Check for blocked dates/times
 * 6. Get existing appointments
 * 7. Generate slots for each availability window
 * 8. Mark slots as available/unavailable based on conflicts
 */
export async function generateSlotsForDate(params: SlotGenerationParams): Promise<TimeSlot[]> {
  const { doctorProfileId, date, consultationTypeId, duration: overrideDuration } = params;

  // 1. Get doctor profile with clinic and all settings
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { id: doctorProfileId },
    include: {
      clinic: {
        include: {
          appointmentRules: true,
          consultationTypes: consultationTypeId ? {
            where: { id: consultationTypeId }
          } : true,
        },
      },
    },
  });

  if (!doctorProfile || !doctorProfile.isActive || !doctorProfile.clinic) {
    return [];
  }

  const clinicId = doctorProfile.clinicId!;

  // 2. Determine slot duration
  let slotDuration = overrideDuration || doctorProfile.defaultDuration;
  
  if (consultationTypeId && doctorProfile.clinic.consultationTypes) {
    const consultationType = doctorProfile.clinic.consultationTypes.find(ct => ct.id === consultationTypeId);
    if (consultationType) {
      slotDuration = consultationType.duration;
    }
  }

  const bufferTime = doctorProfile.bufferTime;
  const rules = doctorProfile.clinic.appointmentRules;

  // 3. Check booking window
  const now = new Date();
  const minAdvanceMinutes = rules?.minAdvanceBooking ?? 60; // Default 1 hour
  const maxAdvanceMinutes = rules?.maxAdvanceBooking ?? 43200; // Default 30 days
  
  const minBookingTime = addMinutes(now, minAdvanceMinutes);
  const maxBookingTime = addMinutes(now, maxAdvanceMinutes);

  const dateStart = startOfDay(date);
  const dateEnd = endOfDay(date);

  // If entire date is outside booking window, return empty
  if (isAfter(dateStart, maxBookingTime) || isBefore(dateEnd, minBookingTime)) {
    return [];
  }

  // 4. Get availability windows for this day
  const dayOfWeek = JS_DAY_TO_PRISMA[date.getDay()];
  const availability = await prisma.availability.findMany({
    where: {
      clinicId,
      dayOfWeek,
      isActive: true,
    },
    orderBy: { startTime: 'asc' },
  });

  if (availability.length === 0) {
    return [];
  }

  // 5. Check blocked slots
  const blockedSlots = await prisma.blockedSlot.findMany({
    where: {
      clinicId,
      date: dateStart,
    },
  });

  // If entire day is blocked (no start/end time), return empty
  const dayBlocked = blockedSlots.some(b => !b.startTime && !b.endTime);
  if (dayBlocked) {
    return [];
  }

  // Convert blocked time ranges to minutes for easier comparison
  const blockedRanges = blockedSlots
    .filter(b => b.startTime && b.endTime)
    .map(b => ({
      startMinutes: timeToMinutes(b.startTime!),
      endMinutes: timeToMinutes(b.endTime!),
    }));

  // 6. Get existing appointments (including buffer time)
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      date: dateStart,
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
    orderBy: { startTime: 'asc' },
  });

  // Convert appointments to booked slots with buffer
  const bookedSlots: BookedSlot[] = existingAppointments.map(apt => {
    const startMinutes = timeToMinutes(apt.startTime);
    const endMinutes = timeToMinutes(apt.endTime);
    return {
      startMinutes,
      endMinutes,
      bufferEnd: endMinutes + bufferTime, // Include buffer after appointment
    };
  });

  // 7. Generate slots for each availability window
  const allSlots: TimeSlot[] = [];

  for (const avail of availability) {
    const windowSlots = generateSlotsForWindow(
      date,
      avail.startTime,
      avail.endTime,
      slotDuration,
      bufferTime,
      bookedSlots,
      blockedRanges,
      minBookingTime
    );
    allSlots.push(...windowSlots);
  }

  // Remove duplicates (in case of overlapping windows)
  const uniqueSlots = removeDuplicateSlots(allSlots);

  // Sort by time
  uniqueSlots.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  return uniqueSlots;
}

/**
 * Generate slots within a single availability window
 */
function generateSlotsForWindow(
  date: Date,
  windowStart: string,
  windowEnd: string,
  duration: number,
  buffer: number,
  bookedSlots: BookedSlot[],
  blockedRanges: { startMinutes: number; endMinutes: number }[],
  minBookingTime: Date
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  const windowStartMinutes = timeToMinutes(windowStart);
  const windowEndMinutes = timeToMinutes(windowEnd);
  
  // Calculate slot interval (duration + buffer)
  const slotInterval = duration + buffer;
  
  let currentMinutes = windowStartMinutes;
  
  while (currentMinutes + duration <= windowEndMinutes) {
    const slotStartMinutes = currentMinutes;
    const slotEndMinutes = currentMinutes + duration;
    
    // Create time strings
    const startTime = minutesToTime(slotStartMinutes);
    const endTime = minutesToTime(slotEndMinutes);
    
    // Create datetime for comparison
    const slotDateTime = parseTimeToDate(date, startTime);
    
    // Check availability
    const { available, reason } = checkSlotAvailability(
      slotStartMinutes,
      slotEndMinutes,
      buffer,
      bookedSlots,
      blockedRanges,
      slotDateTime,
      minBookingTime
    );
    
    slots.push({
      time: startTime,
      displayTime: formatDisplayTime(startTime),
      endTime: endTime,
      displayEndTime: formatDisplayTime(endTime),
      duration,
      available,
      reason,
    });
    
    // Move to next slot
    currentMinutes += slotInterval;
  }
  
  return slots;
}

/**
 * Check if a slot is available
 */
function checkSlotAvailability(
  slotStart: number,
  slotEnd: number,
  buffer: number,
  bookedSlots: BookedSlot[],
  blockedRanges: { startMinutes: number; endMinutes: number }[],
  slotDateTime: Date,
  minBookingTime: Date
): { available: boolean; reason?: string } {
  
  // 1. Check if slot is in the past or before minimum booking time
  if (isBefore(slotDateTime, minBookingTime)) {
    return { available: false, reason: 'Past minimum booking time' };
  }
  
  // 2. Check for conflicts with existing appointments
  // A slot conflicts if:
  // - It starts during another appointment (including buffer)
  // - It ends during another appointment
  // - It completely contains another appointment
  // - Another appointment completely contains it
  for (const booked of bookedSlots) {
    // Check if slot overlaps with booked appointment (including buffer before)
    const bookingStartWithBuffer = Math.max(0, booked.startMinutes - buffer);
    
    const overlaps = 
      // Slot starts during booked period (including buffer before)
      (slotStart >= bookingStartWithBuffer && slotStart < booked.bufferEnd) ||
      // Slot ends during booked period
      (slotEnd > booked.startMinutes && slotEnd <= booked.endMinutes) ||
      // Slot completely contains booked period
      (slotStart <= booked.startMinutes && slotEnd >= booked.endMinutes) ||
      // Booked period completely contains slot
      (booked.startMinutes <= slotStart && booked.endMinutes >= slotEnd);
    
    if (overlaps) {
      return { available: false, reason: 'Conflicts with existing appointment' };
    }
  }
  
  // 3. Check for blocked time ranges
  for (const blocked of blockedRanges) {
    const overlaps =
      (slotStart >= blocked.startMinutes && slotStart < blocked.endMinutes) ||
      (slotEnd > blocked.startMinutes && slotEnd <= blocked.endMinutes) ||
      (slotStart <= blocked.startMinutes && slotEnd >= blocked.endMinutes);
    
    if (overlaps) {
      return { available: false, reason: 'Time is blocked' };
    }
  }
  
  return { available: true };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert "HH:MM" time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to "HH:MM" time string
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Format time for display (12-hour format)
 */
function formatDisplayTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Parse time string to Date object
 */
function parseTimeToDate(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  let result = startOfDay(date);
  result = setHours(result, hours);
  result = setMinutes(result, minutes);
  return result;
}

/**
 * Remove duplicate slots (same start time)
 */
function removeDuplicateSlots(slots: TimeSlot[]): TimeSlot[] {
  const seen = new Map<string, TimeSlot>();
  
  for (const slot of slots) {
    const existing = seen.get(slot.time);
    // Keep the unavailable one if there's a conflict
    if (!existing || (!slot.available && existing.available)) {
      seen.set(slot.time, slot);
    }
  }
  
  return Array.from(seen.values());
}

// ============================================================================
// AVAILABLE DATES
// ============================================================================

/**
 * Get available dates for next N days
 * Returns dates where the doctor has availability and isn't blocked
 */
export async function getAvailableDates(
  doctorProfileId: string,
  days: number = 30
): Promise<Date[]> {
  const availableDates: Date[] = [];
  const today = startOfDay(new Date());

  // Get doctor profile with clinic
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { id: doctorProfileId },
    include: {
      clinic: {
        include: {
          appointmentRules: true,
        },
      },
    },
  });

  if (!doctorProfile || !doctorProfile.clinic) {
    return [];
  }

  const clinicId = doctorProfile.clinicId!;

  // Get clinic's availability pattern
  const availability = await prisma.availability.findMany({
    where: {
      clinicId,
      isActive: true,
    },
  });

  const availableDays = new Set(availability.map(a => a.dayOfWeek));

  const maxAdvanceMinutes = doctorProfile.clinic.appointmentRules?.maxAdvanceBooking ?? 43200;
  const maxDate = addMinutes(new Date(), maxAdvanceMinutes);

  // Get blocked dates (full day blocks)
  const blockedDates = await prisma.blockedSlot.findMany({
    where: {
      clinicId,
      date: {
        gte: today,
        lte: addDays(today, days),
      },
      startTime: null, // Full day blocks only
    },
  });

  const blockedDateStrings = new Set(
    blockedDates.map(b => format(b.date, 'yyyy-MM-dd'))
  );

  // Check each day
  for (let i = 0; i < days; i++) {
    const date = addDays(today, i);
    
    // Skip if beyond max booking window
    if (isAfter(date, maxDate)) break;
    
    const dayOfWeek = JS_DAY_TO_PRISMA[date.getDay()];
    const dateString = format(date, 'yyyy-MM-dd');

    if (availableDays.has(dayOfWeek) && !blockedDateStrings.has(dateString)) {
      availableDates.push(date);
    }
  }

  return availableDates;
}

// ============================================================================
// SLOT VALIDATION
// ============================================================================

/**
 * Check if a specific slot is available for booking
 * Used during booking to prevent race conditions
 */
export async function isSlotAvailable(
  doctorProfileId: string,
  date: Date,
  time: string,
  duration: number
): Promise<{ available: boolean; reason?: string }> {
  const slots = await generateSlotsForDate({
    doctorProfileId,
    date,
    duration,
  });

  const slot = slots.find(s => s.time === time);
  
  if (!slot) {
    return { available: false, reason: 'Slot does not exist for this time' };
  }
  
  return { 
    available: slot.available, 
    reason: slot.reason 
  };
}

/**
 * Validate slot availability with lock (for booking)
 * This function should be called within a transaction
 */
export async function validateAndLockSlot(
  clinicId: string,
  date: Date,
  startTime: string,
  endTime: string,
): Promise<{ valid: boolean; reason?: string }> {
  const dateStart = startOfDay(date);
  
  // Check for overlapping appointments
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      clinicId,
      date: dateStart,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        // Starts during requested slot
        {
          AND: [
            { startTime: { gte: startTime } },
            { startTime: { lt: endTime } },
          ],
        },
        // Ends during requested slot
        {
          AND: [
            { endTime: { gt: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
        // Completely contains requested slot
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gte: endTime } },
          ],
        },
      ],
    },
  });

  if (existingAppointment) {
    return { 
      valid: false, 
      reason: 'This slot has already been booked' 
    };
  }

  // Check blocked slots
  const blockedSlot = await prisma.blockedSlot.findFirst({
    where: {
      clinicId,
      date: dateStart,
      OR: [
        // Full day block
        { startTime: null, endTime: null },
        // Partial block that overlaps
        {
          AND: [
            { startTime: { not: null } },
            { endTime: { not: null } },
            {
              OR: [
                { startTime: { lt: endTime }, endTime: { gt: startTime } },
              ],
            },
          ],
        },
      ],
    },
  });

  if (blockedSlot) {
    return { 
      valid: false, 
      reason: 'This time slot is blocked' 
    };
  }

  return { valid: true };
}

// ============================================================================
// STATISTICS & HELPERS
// ============================================================================

/**
 * Get slot statistics for a date
 */
export async function getSlotStats(
  doctorProfileId: string,
  date: Date
): Promise<{
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  utilization: number;
}> {
  const slots = await generateSlotsForDate({ doctorProfileId, date });
  
  const totalSlots = slots.length;
  const availableSlots = slots.filter(s => s.available).length;
  const bookedSlots = totalSlots - availableSlots;
  const utilization = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

  return {
    totalSlots,
    availableSlots,
    bookedSlots,
    utilization,
  };
}

/**
 * Find next available slot
 */
export async function findNextAvailableSlot(
  doctorProfileId: string,
  consultationTypeId?: string,
  startDate: Date = new Date()
): Promise<{ date: string; slot: TimeSlot } | null> {
  const availableDates = await getAvailableDates(doctorProfileId, 30);
  
  for (const date of availableDates) {
    // Skip dates before start date
    if (isBefore(date, startOfDay(startDate))) continue;
    
    const slots = await generateSlotsForDate({
      doctorProfileId,
      date,
      consultationTypeId,
    });
    
    const availableSlot = slots.find(s => s.available);
    
    if (availableSlot) {
      return {
        date: format(date, 'yyyy-MM-dd'),
        slot: availableSlot,
      };
    }
  }
  
  return null;
}
