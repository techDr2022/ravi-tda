/**
 * Patient Data Export API
 * 
 * STRICT ADMIN-ONLY ACCESS
 * - Only ADMIN role can access this endpoint
 * - Exports patient and appointment data to CSV
 * - Supports filtering by date, doctor, payment status, and source
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminOnly, createAuditLog, getRequestMetadata } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { format } from 'date-fns';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const ExportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  doctorProfileId: z.string().optional(),
  paymentStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  patientSource: z.enum(['WALK_IN', 'REFERRED', 'GOOGLE', 'WEBSITE', 'SOCIAL', 'OTHER']).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
});

// ============================================================================
// CSV GENERATION
// ============================================================================

/**
 * Escape CSV field value
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Generate CSV content from appointment data
 */
function generateCSV(appointments: any[]): string {
  // CSV Headers
  const headers = [
    'Appointment ID',
    'Booking Reference',
    'Date',
    'Time',
    'Status',
    'Patient Name',
    'Patient Phone',
    'Patient Email',
    'Patient Age',
    'Patient Gender',
    'Patient Source',
    'Doctor Name',
    'Consultation Type',
    'Consultation Fee',
    'Payment Status',
    'Payment Amount',
    'Payment Type',
    'Reason for Visit',
    'Notes',
    'Booked At',
    'Completed At',
  ];

  // Generate CSV rows
  const rows = appointments.map(apt => {
    // Calculate patient age safely
    let patientAge = '';
    if (apt.patient?.dateOfBirth) {
      try {
        const birthYear = new Date(apt.patient.dateOfBirth).getFullYear();
        const currentYear = new Date().getFullYear();
        patientAge = String(currentYear - birthYear);
      } catch {
        patientAge = '';
      }
    }

    return [
      escapeCSV(apt.id),
      escapeCSV(apt.bookingRef),
      escapeCSV(apt.date ? format(new Date(apt.date), 'yyyy-MM-dd') : ''),
      escapeCSV(`${apt.startTime || ''} - ${apt.endTime || ''}`),
      escapeCSV(apt.status || ''),
      escapeCSV(apt.patient?.name || ''),
      escapeCSV(apt.patient?.phone || ''),
      escapeCSV(apt.patient?.email || ''),
      escapeCSV(patientAge),
      escapeCSV(apt.patient?.gender || ''),
      escapeCSV(apt.patientSource || ''),
      escapeCSV(apt.doctorProfile?.name || ''),
      escapeCSV(apt.consultationType?.name || ''),
      escapeCSV(apt.fee ? Number(apt.fee).toFixed(2) : ''),
      escapeCSV(apt.payment?.status || ''),
      escapeCSV(apt.payment?.amount ? Number(apt.payment.amount).toFixed(2) : ''),
      escapeCSV(apt.payment?.type || ''),
      escapeCSV(apt.reasonForVisit || ''),
      escapeCSV(apt.notes || ''),
      escapeCSV(apt.bookedAt ? format(new Date(apt.bookedAt), 'yyyy-MM-dd HH:mm:ss') : ''),
      escapeCSV(apt.completedAt ? format(new Date(apt.completedAt), 'yyyy-MM-dd HH:mm:ss') : ''),
    ];
  });

  // Combine headers and rows
  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ];

  return csvLines.join('\n');
}

// ============================================================================
// EXPORT HANDLER
// ============================================================================

export const GET = withAdminOnly(async (request, context, auth) => {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Validate query parameters
    const validationResult = ExportQuerySchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const filters = validationResult.data;
    const { clinic } = auth;

    // Build Prisma where clause
    const whereClause: any = {
      clinicId: clinic.clinicId,
    };

    // Date filter
    if (filters.startDate || filters.endDate) {
      whereClause.date = {};
      if (filters.startDate) {
        whereClause.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.date.lte = new Date(filters.endDate);
      }
    }

    // Doctor filter
    if (filters.doctorProfileId) {
      whereClause.doctorProfileId = filters.doctorProfileId;
    }

    // Status filter
    if (filters.status) {
      whereClause.status = filters.status;
    }

    // Patient source filter
    if (filters.patientSource) {
      whereClause.patientSource = filters.patientSource;
    }

    // Payment status filter
    if (filters.paymentStatus) {
      whereClause.payment = {
        status: filters.paymentStatus,
      };
    }

    // Fetch appointments with all related data
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        doctorProfile: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
        consultationType: {
          select: {
            id: true,
            name: true,
            type: true,
            fee: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            type: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' },
      ],
    });

    // Generate CSV (even if empty, return headers)
    const csvContent = generateCSV(appointments);

    // Create audit log
    const metadata = getRequestMetadata(request);
    await createAuditLog({
      clinicId: clinic.clinicId,
      entityType: 'EXPORT',
      entityId: 'patient-data',
      action: 'EXPORT_PATIENT_DATA',
      changes: {
        filters,
        recordCount: appointments.length,
      },
      performedById: auth.user.id,
      performedByRole: clinic.role,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    }).catch(err => {
      // Log but don't fail the export if audit log fails
      console.error('Failed to create audit log:', err);
    });

    // Return CSV file
    const filename = `patient-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export patient data' },
      { status: 500 }
    );
  }
});
