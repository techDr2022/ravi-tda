/**
 * Clinic Appointments API
 * 
 * Role-based access control:
 * - All roles can view and create appointments
 * - ADMIN can see appointment fees
 * - MANAGER/RECEPTION cannot see fees
 * 
 * Supports:
 * - Online bookings (from patients)
 * - Walk-in bookings (from reception)
 * - Source tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withClinic,
  filterResponseArray,
  filterResponseData,
  createAuditLog,
  getRequestMetadata,
} from '@/lib/middleware/auth-middleware';
import { hasPermission, Permission } from '@/lib/permissions';
import { 
  BookingType, 
  PatientSource, 
  AppointmentStatus,
  PaymentStatus,
  PaymentType,
} from '@prisma/client';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateAppointmentSchema = z.object({
  // Patient info
  patientId: z.string().optional(),
  patientName: z.string().min(1).optional(),
  patientPhone: z.string().min(10).optional(),
  patientEmail: z.string().email().optional(),
  
  // Appointment details
  consultationTypeId: z.string(),
  doctorProfileId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  reasonForVisit: z.string().optional(),
  symptoms: z.string().optional(),
  
  // Source tracking
  bookingType: z.enum(['ONLINE', 'WALK_IN', 'PHONE']).default('ONLINE'),
  patientSource: z.enum(['WALK_IN', 'REFERRED', 'GOOGLE', 'WEBSITE', 'SOCIAL', 'OTHER']).default('WALK_IN'),
  referredBy: z.string().optional(),
  sourceDetails: z.string().optional(),
});

const ListAppointmentsSchema = z.object({
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  patientId: z.string().optional(),
  bookingType: z.enum(['ONLINE', 'WALK_IN', 'PHONE']).optional(),
  patientSource: z.enum(['WALK_IN', 'REFERRED', 'GOOGLE', 'WEBSITE', 'SOCIAL', 'OTHER']).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

// ============================================================================
// GET - List Appointments
// ============================================================================

export const GET = withClinic(async (request, context, auth) => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  
  // Validate query params
  const parseResult = ListAppointmentsSchema.safeParse(params);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parseResult.error.issues },
      { status: 400 }
    );
  }
  
  const { 
    date, 
    startDate, 
    endDate, 
    status, 
    patientId, 
    bookingType, 
    patientSource,
    page, 
    limit 
  } = parseResult.data;
  
  // Build where clause
  const whereClause: Record<string, unknown> = {
    clinicId: auth.clinic.clinicId,
  };
  
  if (date) {
    whereClause.date = new Date(date);
  } else if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) (whereClause.date as Record<string, Date>).gte = new Date(startDate);
    if (endDate) (whereClause.date as Record<string, Date>).lte = new Date(endDate);
  }
  
  if (status) whereClause.status = status;
  if (patientId) whereClause.patientId = patientId;
  if (bookingType) whereClause.bookingType = bookingType;
  if (patientSource) whereClause.patientSource = patientSource;
  
  // Fetch appointments
  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            source: true,
          },
        },
        consultationType: {
          select: {
            id: true,
            name: true,
            type: true,
            duration: true,
            // Fee included - will be filtered based on role
            fee: true,
          },
        },
        doctorProfile: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
        bookedBy: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            paymentType: true,
            // Amount included - will be filtered based on role
            amount: true,
            paidAt: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.appointment.count({ where: whereClause }),
  ]);
  
  // Filter financial data based on role
  const filteredAppointments = filterResponseArray(
    appointments.map(apt => ({
      ...apt,
      // Convert Decimal to number for JSON
      fee: apt.fee ? Number(apt.fee) : null,
      consultationType: apt.consultationType ? {
        ...apt.consultationType,
        fee: apt.consultationType.fee ? Number(apt.consultationType.fee) : null,
      } : null,
      payment: apt.payment ? {
        ...apt.payment,
        amount: apt.payment.amount ? Number(apt.payment.amount) : null,
      } : null,
    })),
    auth.clinic.role,
    'appointment'
  );
  
  return NextResponse.json({
    appointments: filteredAppointments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ============================================================================
// POST - Create Appointment (with walk-in support)
// ============================================================================

export const POST = withClinic(async (request, context, auth) => {
  // Check permission
  if (!hasPermission(auth.clinic.role, Permission.APPOINTMENT_CREATE)) {
    return NextResponse.json(
      { error: 'Permission denied: Cannot create appointments' },
      { status: 403 }
    );
  }
  
  const body = await request.json();
  
  // Validate request body
  const parseResult = CreateAppointmentSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parseResult.error.issues },
      { status: 400 }
    );
  }
  
  const data = parseResult.data;
  
  try {
    // Get or create patient
    let patientId = data.patientId;
    
    if (!patientId && data.patientPhone) {
      // Try to find existing patient by phone
      const existingPatient = await prisma.patient.findUnique({
        where: {
          clinicId_phone: {
            clinicId: auth.clinic.clinicId,
            phone: data.patientPhone,
          },
        },
      });
      
      if (existingPatient) {
        patientId = existingPatient.id;
      } else if (data.patientName) {
        // Create new patient
        const newPatient = await prisma.patient.create({
          data: {
            clinicId: auth.clinic.clinicId,
            name: data.patientName,
            phone: data.patientPhone,
            email: data.patientEmail,
            source: data.patientSource as PatientSource,
            referredBy: data.referredBy,
            sourceDetails: data.sourceDetails,
          },
        });
        patientId = newPatient.id;
      }
    }
    
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient information is required' },
        { status: 400 }
      );
    }
    
    // Get consultation type to calculate end time and fee
    const consultationType = await prisma.consultationType.findFirst({
      where: {
        id: data.consultationTypeId,
        clinicId: auth.clinic.clinicId,
        isActive: true,
      },
    });
    
    if (!consultationType) {
      return NextResponse.json(
        { error: 'Invalid consultation type' },
        { status: 400 }
      );
    }
    
    // Calculate end time
    const [hours, minutes] = data.startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + consultationType.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    
    // Check for conflicting appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        clinicId: auth.clinic.clinicId,
        date: new Date(data.date),
        doctorProfileId: data.doctorProfileId,
        status: {
          notIn: ['CANCELLED', 'RESCHEDULED'],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });
    
    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is not available' },
        { status: 409 }
      );
    }
    
    // Determine initial status based on booking type
    let initialStatus: AppointmentStatus = 'PENDING';
    if (data.bookingType === 'WALK_IN') {
      initialStatus = 'CONFIRMED'; // Walk-ins are auto-confirmed
    }
    
    // Create appointment with payment record
    const appointment = await prisma.$transaction(async (tx) => {
      // Create appointment
      const apt = await tx.appointment.create({
        data: {
          clinicId: auth.clinic.clinicId,
          patientId,
          consultationTypeId: data.consultationTypeId,
          doctorProfileId: data.doctorProfileId,
          date: new Date(data.date),
          startTime: data.startTime,
          endTime,
          duration: consultationType.duration,
          fee: consultationType.fee,
          bookingType: data.bookingType as BookingType,
          patientSource: data.patientSource as PatientSource,
          bookedById: auth.clinic.staffId, // Track who booked
          status: initialStatus,
          reasonForVisit: data.reasonForVisit,
          symptoms: data.symptoms,
          bookedAt: new Date(),
          confirmedAt: data.bookingType === 'WALK_IN' ? new Date() : null,
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          consultationType: {
            select: {
              id: true,
              name: true,
              type: true,
              duration: true,
            },
          },
        },
      });
      
      // Create pending payment record
      await tx.payment.create({
        data: {
          clinicId: auth.clinic.clinicId,
          appointmentId: apt.id,
          patientId,
          amount: consultationType.fee,
          status: 'PENDING',
          paymentType: data.bookingType === 'WALK_IN' ? 'CASH' : 'ONLINE_UPI',
        },
      });
      
      return apt;
    });
    
    // Create audit log
    await createAuditLog({
      clinicId: auth.clinic.clinicId,
      entityType: 'Appointment',
      entityId: appointment.id,
      action: 'CREATE',
      changes: {
        bookingType: data.bookingType,
        patientSource: data.patientSource,
        status: initialStatus,
      },
      performedById: auth.user.id,
      performedByRole: auth.clinic.role,
      ...getRequestMetadata(request),
    });
    
    // Filter response based on role (hide fee from non-admin)
    const response = filterResponseData(
      {
        ...appointment,
        fee: Number(appointment.fee),
      },
      auth.clinic.role,
      'appointment'
    );
    
    return NextResponse.json({
      message: 'Appointment created successfully',
      appointment: response,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
});
