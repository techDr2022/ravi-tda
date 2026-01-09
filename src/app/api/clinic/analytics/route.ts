/**
 * Clinic Analytics API
 * 
 * STRICT Role-based access control:
 * - ADMIN: Full analytics including revenue, financial metrics
 * - MANAGER: Operational metrics only (appointments, patients, sources)
 * - RECEPTION: Basic operational metrics only
 * 
 * Financial data is NEVER exposed to non-ADMIN roles at the backend level.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withClinic,
  createAuditLog,
  getRequestMetadata,
} from '@/lib/middleware/auth-middleware';
import { 
  canViewFinancialAnalytics, 
  hasPermission, 
  Permission 
} from '@/lib/permissions';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const AnalyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
});

// ============================================================================
// GET - Fetch Analytics
// ============================================================================

export const GET = withClinic(async (request, context, auth) => {
  // Check basic analytics permission
  if (!hasPermission(auth.clinic.role, Permission.ANALYTICS_VIEW)) {
    return NextResponse.json(
      { error: 'Permission denied: Cannot view analytics' },
      { status: 403 }
    );
  }
  
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  
  const parseResult = AnalyticsQuerySchema.safeParse(params);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parseResult.error.issues },
      { status: 400 }
    );
  }
  
  const { startDate, endDate, period } = parseResult.data;
  
  // Default to last 30 days
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate 
    ? new Date(startDate) 
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const clinicId = auth.clinic.clinicId;
  const canSeeFinancials = canViewFinancialAnalytics(auth.clinic.role);
  
  try {
    // ========================================
    // OPERATIONAL METRICS (All roles can see)
    // ========================================
    
    // Appointment counts by status
    const appointmentsByStatus = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        clinicId,
        date: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });
    
    // Appointments by source
    const appointmentsBySource = await prisma.appointment.groupBy({
      by: ['patientSource'],
      where: {
        clinicId,
        date: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });
    
    // Appointments by booking type
    const appointmentsByBookingType = await prisma.appointment.groupBy({
      by: ['bookingType'],
      where: {
        clinicId,
        date: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });
    
    // Total appointments
    const totalAppointments = await prisma.appointment.count({
      where: {
        clinicId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });
    
    // Today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayAppointments = await prisma.appointment.count({
      where: {
        clinicId,
        date: {
          gte: today,
          lte: todayEnd,
        },
      },
    });
    
    // New patients in period
    const newPatients = await prisma.patient.count({
      where: {
        clinicId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });
    
    // Total patients
    const totalPatients = await prisma.patient.count({
      where: { clinicId },
    });
    
    // Patients by source
    const patientsBySource = await prisma.patient.groupBy({
      by: ['source'],
      where: {
        clinicId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });
    
    // Daily appointment trend
    const dailyAppointments = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(date) as date, COUNT(*) as count
      FROM appointments
      WHERE clinic_id = ${clinicId}
        AND date >= ${start}
        AND date <= ${end}
      GROUP BY DATE(date)
      ORDER BY date ASC
    `;
    
    // Build operational response
    const operationalMetrics = {
      summary: {
        totalAppointments,
        todayAppointments,
        newPatients,
        totalPatients,
      },
      appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      appointmentsBySource: appointmentsBySource.reduce((acc, item) => {
        acc[item.patientSource] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      appointmentsByBookingType: appointmentsByBookingType.reduce((acc, item) => {
        acc[item.bookingType] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      patientsBySource: patientsBySource.reduce((acc, item) => {
        acc[item.source] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      dailyTrend: dailyAppointments.map(item => ({
        date: item.date,
        count: Number(item.count),
      })),
    };
    
    // ========================================
    // FINANCIAL METRICS (ADMIN ONLY)
    // ========================================
    
    if (!canSeeFinancials) {
      // Non-admin response - NO financial data
      return NextResponse.json({
        period: { start, end },
        metrics: operationalMetrics,
        // Explicitly note that financial data is restricted
        financialMetrics: null,
        _notice: 'Financial metrics require ADMIN role',
      });
    }
    
    // ADMIN ONLY: Financial metrics
    const paidPayments = await prisma.payment.aggregate({
      where: {
        clinicId,
        status: 'PAID',
        paidAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });
    
    const pendingPayments = await prisma.payment.aggregate({
      where: {
        clinicId,
        status: 'PENDING',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });
    
    // Revenue by payment type
    const revenueByPaymentType = await prisma.payment.groupBy({
      by: ['paymentType'],
      where: {
        clinicId,
        status: 'PAID',
        paidAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        amount: true,
      },
    });
    
    // Daily revenue trend
    const dailyRevenue = await prisma.$queryRaw<Array<{ date: Date; total: number }>>`
      SELECT DATE(paid_at) as date, SUM(amount) as total
      FROM payments
      WHERE clinic_id = ${clinicId}
        AND status = 'PAID'
        AND paid_at >= ${start}
        AND paid_at <= ${end}
      GROUP BY DATE(paid_at)
      ORDER BY date ASC
    `;
    
    // Revenue by patient source
    const revenueBySource = await prisma.$queryRaw<Array<{ source: string; total: number }>>`
      SELECT p.source, SUM(pay.amount) as total
      FROM payments pay
      JOIN patients p ON pay.patient_id = p.id
      WHERE pay.clinic_id = ${clinicId}
        AND pay.status = 'PAID'
        AND pay.paid_at >= ${start}
        AND pay.paid_at <= ${end}
      GROUP BY p.source
    `;
    
    const financialMetrics = {
      totalRevenue: Number(paidPayments._sum.amount || 0),
      pendingRevenue: Number(pendingPayments._sum.amount || 0),
      totalPaidPayments: paidPayments._count.id,
      totalPendingPayments: pendingPayments._count.id,
      revenueByPaymentType: revenueByPaymentType.reduce((acc, item) => {
        acc[item.paymentType] = Number(item._sum.amount || 0);
        return acc;
      }, {} as Record<string, number>),
      revenueBySource: revenueBySource.reduce((acc, item) => {
        acc[item.source] = Number(item.total || 0);
        return acc;
      }, {} as Record<string, number>),
      dailyRevenueTrend: dailyRevenue.map(item => ({
        date: item.date,
        revenue: Number(item.total || 0),
      })),
    };
    
    // Log financial data access for audit
    await createAuditLog({
      clinicId,
      entityType: 'Analytics',
      entityId: clinicId,
      action: 'VIEW_FINANCIAL_ANALYTICS',
      changes: {
        period: { start, end },
        accessedMetrics: Object.keys(financialMetrics),
      },
      performedById: auth.user.id,
      performedByRole: auth.clinic.role,
      ...getRequestMetadata(request),
    });
    
    return NextResponse.json({
      period: { start, end },
      metrics: operationalMetrics,
      financialMetrics,
    });
    
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
});
