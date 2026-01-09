/**
 * Appointment Service
 * Handles all appointment booking and management operations
 * 
 * Key Features:
 * - Prevents overlapping bookings with transaction-safe slot validation
 * - Enforces booking rules (daily limits, patient limits)
 * - Handles cancellation and rescheduling with configurable windows
 * - Tracks payment status and appointment lifecycle
 */

import prisma from './prisma';
import { isSlotAvailable } from './slots';
import { format, addMinutes, parse, startOfDay } from 'date-fns';
import { CreateAppointmentInput } from './validations';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';

/**
 * Generate a unique booking reference
 */
function generateBookingRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TD${timestamp}${random}`;
}

/**
 * Book a new appointment
 * 
 * Uses a transaction to ensure:
 * 1. Slot is still available when booking (prevents double booking)
 * 2. Daily/patient limits are enforced
 * 3. Atomic creation of patient and appointment records
 */
export async function bookAppointment(data: CreateAppointmentInput) {
  // 1. Get doctor profile with clinic (outside transaction for validation)
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { slug: data.doctorSlug },
    include: {
      clinic: {
        include: {
          appointmentRules: true,
        },
      },
    },
  });

  if (!doctorProfile || !doctorProfile.isActive || !doctorProfile.clinic) {
    throw new Error('Doctor not found or unavailable');
  }

  const clinicId = doctorProfile.clinicId!;

  // 2. Get consultation type
  const consultationType = await prisma.consultationType.findUnique({
    where: { id: data.consultationTypeId },
  });

  if (!consultationType || !consultationType.isActive) {
    throw new Error('Consultation type not available');
  }

  // 3. Parse date and calculate times
  const appointmentDate = parse(data.date, 'yyyy-MM-dd', new Date());
  const dateStart = startOfDay(appointmentDate);
  
  const [hours, minutes] = data.time.split(':').map(Number);
  const startDateTime = new Date(appointmentDate);
  startDateTime.setHours(hours, minutes, 0, 0);
  const endDateTime = addMinutes(startDateTime, consultationType.duration);
  const endTime = format(endDateTime, 'HH:mm');

  const rules = doctorProfile.clinic.appointmentRules;

  // 4. Initial slot availability check (quick fail before transaction)
  const slotCheck = await isSlotAvailable(
    doctorProfile.id,
    appointmentDate,
    data.time,
    consultationType.duration
  );

  if (!slotCheck.available) {
    throw new Error(slotCheck.reason || 'This time slot is no longer available');
  }

  // 5. Use transaction for atomic booking (prevents race conditions)
  const appointment = await prisma.$transaction(async (tx) => {
    // Re-check slot within transaction (prevents double booking)
    const existingAppointment = await tx.appointment.findFirst({
      where: {
        clinicId,
        date: dateStart,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          // Starts during requested slot
          {
            startTime: { gte: data.time, lt: endTime },
          },
          // Ends during requested slot  
          {
            endTime: { gt: data.time, lte: endTime },
          },
          // Completely contains requested slot
          {
            startTime: { lte: data.time },
            endTime: { gte: endTime },
          },
        ],
      },
    });

    if (existingAppointment) {
      throw new Error('This time slot has just been booked. Please select another time.');
    }

    // Check blocked slots within transaction
    const blockedSlot = await tx.blockedSlot.findFirst({
      where: {
        clinicId,
        date: dateStart,
        OR: [
          { startTime: null, endTime: null }, // Full day block
          {
            AND: [
              { startTime: { lte: endTime } },
              { endTime: { gte: data.time } },
            ],
          },
        ],
      },
    });

    if (blockedSlot) {
      throw new Error('This time slot is blocked');
    }

    // Check daily booking limits within transaction
    if (rules?.maxBookingsPerDay) {
      const existingCount = await tx.appointment.count({
        where: {
          clinicId,
          date: dateStart,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (existingCount >= rules.maxBookingsPerDay) {
        throw new Error('Doctor is fully booked for this day');
      }
    }

    // Get or create patient within transaction
    let patient = await tx.patient.findFirst({
      where: { clinicId, phone: data.patient.phone },
    });

    if (patient) {
      patient = await tx.patient.update({
        where: { id: patient.id },
        data: {
          name: data.patient.name,
          ...(data.patient.email && { email: data.patient.email }),
        },
      });
    } else {
      patient = await tx.patient.create({
        data: {
          clinicId,
          name: data.patient.name,
          phone: data.patient.phone,
          email: data.patient.email,
        },
      });
    }

    // Check patient booking limits
    if (rules?.maxBookingsPerPatient) {
      const patientBookings = await tx.appointment.count({
        where: {
          clinicId,
          patientId: patient.id,
          date: dateStart,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (patientBookings >= rules.maxBookingsPerPatient) {
        throw new Error('Maximum bookings per day exceeded for this patient');
      }
    }

    // Create appointment
    return tx.appointment.create({
      data: {
        clinicId,
        doctorProfileId: doctorProfile.id,
        patientId: patient.id,
        consultationTypeId: consultationType.id,
        bookingRef: generateBookingRef(),
        date: dateStart,
        startTime: data.time,
        endTime,
        duration: consultationType.duration,
        status: rules?.requirePayment ? 'PENDING' : 'CONFIRMED',
        reasonForVisit: data.reasonForVisit,
        symptoms: data.symptoms,
        fee: consultationType.fee,
      },
      include: {
        doctorProfile: {
          select: {
            name: true,
            clinicName: true,
            address: true,
            phone: true,
          },
        },
        patient: true,
        consultationType: true,
      },
    });
  }, {
    // Transaction options for better isolation
    isolationLevel: 'Serializable', // Highest isolation to prevent race conditions
    maxWait: 5000, // Wait max 5 seconds for transaction lock
    timeout: 10000, // Timeout after 10 seconds
  });

  // Send confirmation message (async, don't wait for it)
  // This runs in the background and won't block the appointment creation
  if (appointment.patient.phone) {
    // Use setImmediate to ensure this runs after the transaction completes
    setImmediate(async () => {
      try {
        const { sendAppointmentConfirmation } = await import('./messaging-service');
        await sendAppointmentConfirmation({
          appointmentId: appointment.id,
          patientName: appointment.patient.name,
          patientPhone: appointment.patient.phone,
          doctorName: appointment.doctorProfile?.name || 'Doctor',
          date: appointment.date,
          time: appointment.startTime,
          bookingRef: appointment.bookingRef,
          clinicId: appointment.clinicId,
          clinicName: appointment.clinic.name,
          clinicPhone: appointment.clinic.phone || undefined,
          clinicAddress: appointment.clinic.address || undefined,
          consultationType: appointment.consultationType.name,
        });
      } catch (err) {
        console.error('Failed to send appointment confirmation:', err);
      }
    });
  }

  return appointment;
}

/**
 * Get appointment by booking reference
 */
export async function getAppointmentByRef(bookingRef: string) {
  return prisma.appointment.findUnique({
    where: { bookingRef },
    include: {
      doctorProfile: {
        select: {
          name: true,
          clinicName: true,
          address: true,
          phone: true,
          slug: true,
        },
      },
      patient: true,
      consultationType: true,
      payment: {
        select: {
          status: true,
          paymentType: true,
          paidAt: true,
        },
      },
    },
  });
}

/**
 * Get appointments for a doctor
 */
export async function getDoctorAppointments(
  doctorProfileId: string,
  options?: {
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    status?: AppointmentStatus[];
    limit?: number;
    offset?: number;
  }
) {
  const where: any = { doctorProfileId };

  if (options?.date) {
    where.date = startOfDay(options.date);
  } else if (options?.startDate || options?.endDate) {
    where.date = {};
    if (options.startDate) where.date.gte = startOfDay(options.startDate);
    if (options.endDate) where.date.lte = startOfDay(options.endDate);
  }

  if (options?.status) {
    where.status = { in: options.status };
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        consultationType: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: options?.limit,
      skip: options?.offset,
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total };
}

/**
 * Get upcoming appointments for a patient
 */
export async function getPatientAppointments(patientPhone: string) {
  // Find patient by phone (may exist in multiple clinics, returns first match)
  const patient = await prisma.patient.findFirst({
    where: { phone: patientPhone },
  });

  if (!patient) return [];

  return prisma.appointment.findMany({
    where: {
      patientId: patient.id,
      date: { gte: startOfDay(new Date()) },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    include: {
      doctorProfile: {
        select: {
          name: true,
          clinicName: true,
          address: true,
          phone: true,
          slug: true,
        },
      },
      consultationType: true,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  reason?: string
) {
  const updateData: any = { status };

  switch (status) {
    case 'CONFIRMED':
      updateData.confirmedAt = new Date();
      break;
    case 'COMPLETED':
      updateData.completedAt = new Date();
      break;
    case 'CANCELLED':
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = reason;
      break;
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData,
  });
}

/**
 * Cancel appointment
 */
export async function cancelAppointment(appointmentId: string, reason?: string) {
  // Get appointment with relations for messaging
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      doctorProfile: true,
      clinic: { 
        include: { appointmentRules: true } 
      },
      consultationType: true,
    },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.status === 'CANCELLED') {
    throw new Error('Appointment is already cancelled');
  }

  // Check cancellation window
  const rules = appointment.clinic.appointmentRules;
  if (rules && !rules.allowCancellation) {
    throw new Error('Cancellation is not allowed');
  }

  if (rules?.cancellationWindow) {
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const minCancellationTime = addMinutes(new Date(), rules.cancellationWindow);
    
    if (appointmentDateTime <= minCancellationTime) {
      throw new Error(
        `Cancellation must be done at least ${rules.cancellationWindow} minutes before the appointment`
      );
    }
  }

  const cancelledAppointment = await updateAppointmentStatus(appointmentId, 'CANCELLED', reason);

  // Send cancellation message (async, don't wait)
  if (appointment.patient.phone) {
    setImmediate(async () => {
      try {
        const { sendAppointmentCancellation } = await import('./messaging-service');
        await sendAppointmentCancellation({
          appointmentId: appointment.id,
          patientName: appointment.patient.name,
          patientPhone: appointment.patient.phone,
          doctorName: appointment.doctorProfile?.name || 'Doctor',
          date: appointment.date,
          time: appointment.startTime,
          bookingRef: appointment.bookingRef,
          clinicId: appointment.clinicId,
          clinicName: appointment.clinic.name,
          clinicPhone: appointment.clinic.phone || undefined,
          clinicAddress: appointment.clinic.address || undefined,
          consultationType: appointment.consultationType.name,
        }, reason);
      } catch (err) {
        console.error('Failed to send cancellation message:', err);
      }
    });
  }

  return cancelledAppointment;
}

/**
 * Reschedule appointment
 * Uses transaction to prevent race conditions when checking new slot availability
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newDate: string,
  newTime: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { 
      patient: true,
      doctorProfile: true,
      clinic: { include: { appointmentRules: true } },
      consultationType: true,
    },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
    throw new Error('Cannot reschedule a cancelled or completed appointment');
  }

  // Check rescheduling rules
  const rules = appointment.clinic.appointmentRules;
  if (rules && !rules.allowRescheduling) {
    throw new Error('Rescheduling is not allowed');
  }

  if (rules?.maxReschedules && appointment.rescheduleCount >= rules.maxReschedules) {
    throw new Error(`Maximum reschedule limit (${rules.maxReschedules}) reached`);
  }

  // Check rescheduling window
  if (rules?.reschedulingWindow) {
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const minRescheduleTime = addMinutes(new Date(), rules.reschedulingWindow);
    
    if (appointmentDateTime <= minRescheduleTime) {
      throw new Error(
        `Rescheduling must be done at least ${rules.reschedulingWindow} minutes before the appointment`
      );
    }
  }

  // Parse new date and calculate times
  const newAppointmentDate = parse(newDate, 'yyyy-MM-dd', new Date());
  const dateStart = startOfDay(newAppointmentDate);
  
  const [hours, minutes] = newTime.split(':').map(Number);
  const startDateTime = new Date(newAppointmentDate);
  startDateTime.setHours(hours, minutes, 0, 0);
  const endDateTime = addMinutes(startDateTime, appointment.consultationType.duration);
  const newEndTime = format(endDateTime, 'HH:mm');

  // Initial slot check
  const slotCheck = await isSlotAvailable(
    appointment.doctorProfileId!,
    newAppointmentDate,
    newTime,
    appointment.consultationType.duration
  );

  if (!slotCheck.available) {
    throw new Error(slotCheck.reason || 'The new time slot is not available');
  }

  // Use transaction to prevent race conditions
  return prisma.$transaction(async (tx) => {
    // Re-check slot within transaction (excluding current appointment)
    const existingAppointment = await tx.appointment.findFirst({
      where: {
        clinicId: appointment.clinicId,
        date: dateStart,
        status: { in: ['PENDING', 'CONFIRMED'] },
        id: { not: appointmentId }, // Exclude current appointment
        OR: [
          { startTime: { gte: newTime, lt: newEndTime } },
          { endTime: { gt: newTime, lte: newEndTime } },
          { startTime: { lte: newTime }, endTime: { gte: newEndTime } },
        ],
      },
    });

    if (existingAppointment) {
      throw new Error('The new time slot has just been booked. Please select another time.');
    }

    // Store original date/time if first reschedule
    const originalDate = appointment.originalDate || appointment.date;
    const originalTime = appointment.originalTime || appointment.startTime;

    return tx.appointment.update({
      where: { id: appointmentId },
      data: {
        date: dateStart,
        startTime: newTime,
        endTime: newEndTime,
        status: 'CONFIRMED',
        rescheduleCount: { increment: 1 },
        originalDate,
        originalTime,
      },
      include: {
        doctorProfile: {
          select: {
            name: true,
            clinicName: true,
            address: true,
            phone: true,
            slug: true,
          },
        },
        patient: true,
        consultationType: true,
        clinic: true,
      },
    });
  }, {
    isolationLevel: 'Serializable',
    maxWait: 5000,
    timeout: 10000,
  }).then(rescheduledAppointment => {
    // Send reschedule message (async, don't wait)
    if (appointment.patient.phone) {
      const oldDate = appointment.originalDate || appointment.date;
      const oldTime = appointment.originalTime || appointment.startTime;
      
      setImmediate(async () => {
        try {
          const { sendAppointmentReschedule } = await import('./messaging-service');
          await sendAppointmentReschedule({
            appointmentId: appointment.id,
            patientName: appointment.patient.name,
            patientPhone: appointment.patient.phone,
            doctorName: appointment.doctorProfile?.name || 'Doctor',
            date: rescheduledAppointment.date,
            time: rescheduledAppointment.startTime,
            bookingRef: appointment.bookingRef,
            clinicId: appointment.clinicId,
            clinicName: appointment.clinic.name,
            clinicPhone: appointment.clinic.phone || undefined,
            clinicAddress: appointment.clinic.address || undefined,
            consultationType: appointment.consultationType.name,
          }, oldDate, oldTime);
        } catch (err) {
          console.error('Failed to send reschedule message:', err);
        }
      });
    }
    
    return rescheduledAppointment;
  });
}

/**
 * Update payment status for an appointment
 * Updates or creates a payment record
 */
export async function updatePaymentStatus(
  appointmentId: string,
  paymentStatus: PaymentStatus,
  externalPaymentId?: string
) {
  // Get appointment to get clinic and patient info
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { clinicId: true, patientId: true, fee: true },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  // Upsert payment record
  await prisma.payment.upsert({
    where: { appointmentId },
    update: {
      status: paymentStatus,
      ...(externalPaymentId && { externalPaymentId }),
      ...(paymentStatus === 'PAID' && { paidAt: new Date() }),
    },
    create: {
      clinicId: appointment.clinicId,
      appointmentId,
      patientId: appointment.patientId,
      amount: appointment.fee,
      status: paymentStatus,
      ...(externalPaymentId && { externalPaymentId }),
      ...(paymentStatus === 'PAID' && { paidAt: new Date() }),
    },
  });

  // Update appointment status if paid
  if (paymentStatus === 'PAID') {
    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
    });
  }

  return prisma.appointment.findUnique({ where: { id: appointmentId } });
}

/**
 * Add doctor notes to appointment
 */
export async function addAppointmentNotes(appointmentId: string, notes: string) {
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { notes },
  });
}

/**
 * Get appointment statistics for a doctor
 */
export async function getAppointmentStats(doctorProfileId: string) {
  const today = startOfDay(new Date());

  const [
    totalAppointments,
    todayAppointments,
    completedToday,
    pendingCount,
    cancelledCount,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { doctorProfileId },
    }),
    prisma.appointment.count({
      where: {
        doctorProfileId,
        date: today,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
    prisma.appointment.count({
      where: {
        doctorProfileId,
        date: today,
        status: 'COMPLETED',
      },
    }),
    prisma.appointment.count({
      where: {
        doctorProfileId,
        status: 'PENDING',
      },
    }),
    prisma.appointment.count({
      where: {
        doctorProfileId,
        status: 'CANCELLED',
      },
    }),
  ]);

  // Calculate revenue (from completed appointments)
  const revenue = await prisma.appointment.aggregate({
    where: {
      doctorProfileId,
      status: 'COMPLETED',
    },
    _sum: {
      fee: true,
    },
  });

  return {
    totalAppointments,
    todayAppointments,
    completedToday,
    pendingCount,
    cancelledCount,
    totalRevenue: revenue._sum.fee || 0,
  };
}
