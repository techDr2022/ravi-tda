/**
 * Clinic Payments API
 * 
 * STRICT Role-based access control for financial data:
 * - ADMIN: Full access to all payment data including amounts
 * - MANAGER: Can mark payments as done, CANNOT see amounts
 * - RECEPTION: Can mark payments as done, CANNOT see amounts
 * 
 * All financial data is filtered at the backend level.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withClinic,
  withFinancialAccess,
  filterResponseArray,
  createAuditLog,
  getRequestMetadata,
} from '@/lib/middleware/auth-middleware';
import { hasPermission, Permission, canViewFinancialData } from '@/lib/permissions';
import { PaymentType, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ListPaymentsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'REFUNDED', 'FAILED', 'CANCELLED']).optional(),
  paymentType: z.enum(['ONLINE_UPI', 'CASH']).optional(),
  patientId: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

const MarkPaymentSchema = z.object({
  appointmentId: z.string(),
  paymentType: z.enum(['ONLINE_UPI', 'CASH']),
  // Amount is NOT accepted from non-admin roles
  // It uses the pre-set fee from the appointment
});

const AdminMarkPaymentSchema = z.object({
  appointmentId: z.string(),
  paymentType: z.enum(['ONLINE_UPI', 'CASH']),
  amount: z.number().positive().optional(), // Only ADMIN can override amount
  externalPaymentId: z.string().optional(),
  externalOrderId: z.string().optional(),
});

// ============================================================================
// GET - List Payments (ADMIN ONLY for amounts)
// ============================================================================

export const GET = withClinic(async (request, context, auth) => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  
  // Validate query params
  const parseResult = ListPaymentsSchema.safeParse(params);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parseResult.error.issues },
      { status: 400 }
    );
  }
  
  const { startDate, endDate, status, paymentType, patientId, page, limit } = parseResult.data;
  
  // Build where clause
  const whereClause: Record<string, unknown> = {
    clinicId: auth.clinic.clinicId,
  };
  
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) (whereClause.createdAt as Record<string, Date>).gte = new Date(startDate);
    if (endDate) (whereClause.createdAt as Record<string, Date>).lte = new Date(endDate);
  }
  
  if (status) whereClause.status = status;
  if (paymentType) whereClause.paymentType = paymentType;
  if (patientId) whereClause.patientId = patientId;
  
  // Fetch payments
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: whereClause,
      include: {
        appointment: {
          select: {
            id: true,
            bookingRef: true,
            date: true,
            startTime: true,
            status: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        markedBy: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where: whereClause }),
  ]);
  
  // STRICT: Filter financial data based on role
  // Non-ADMIN roles get payment status but NO amounts
  const canSeeAmounts = canViewFinancialData(auth.clinic.role);
  
  const filteredPayments = payments.map(payment => {
    const base = {
      id: payment.id,
      status: payment.status,
      paymentType: payment.paymentType,
      paidAt: payment.paidAt,
      markedAt: payment.markedAt,
      createdAt: payment.createdAt,
      appointment: payment.appointment,
      patient: payment.patient,
      markedBy: payment.markedBy,
    };
    
    if (canSeeAmounts) {
      return {
        ...base,
        amount: Number(payment.amount),
        currency: payment.currency,
        externalPaymentId: payment.externalPaymentId,
        externalOrderId: payment.externalOrderId,
      };
    }
    
    // Non-admin: NO financial data exposed
    return base;
  });
  
  // Calculate totals only for ADMIN
  let totals = null;
  if (canSeeAmounts) {
    const aggregation = await prisma.payment.aggregate({
      where: {
        ...whereClause,
        status: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });
    
    const cashTotal = await prisma.payment.aggregate({
      where: {
        ...whereClause,
        status: 'PAID',
        paymentType: 'CASH',
      },
      _sum: {
        amount: true,
      },
    });
    
    const onlineTotal = await prisma.payment.aggregate({
      where: {
        ...whereClause,
        status: 'PAID',
        paymentType: 'ONLINE_UPI',
      },
      _sum: {
        amount: true,
      },
    });
    
    totals = {
      totalRevenue: Number(aggregation._sum.amount || 0),
      cashRevenue: Number(cashTotal._sum.amount || 0),
      onlineRevenue: Number(onlineTotal._sum.amount || 0),
    };
  }
  
  return NextResponse.json({
    payments: filteredPayments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    // Totals only for ADMIN
    ...(totals ? { totals } : {}),
  });
});

// ============================================================================
// POST - Mark Payment as Completed
// Manager/Reception can mark done but CANNOT see/set amounts
// ============================================================================

export const POST = withClinic(async (request, context, auth) => {
  // Check permission - all roles with PAYMENT_MARK_DONE can use this
  if (!hasPermission(auth.clinic.role, Permission.PAYMENT_MARK_DONE)) {
    return NextResponse.json(
      { error: 'Permission denied: Cannot mark payments' },
      { status: 403 }
    );
  }
  
  const body = await request.json();
  
  // Use different validation schema based on role
  const isAdmin = canViewFinancialData(auth.clinic.role);
  const schema = isAdmin ? AdminMarkPaymentSchema : MarkPaymentSchema;
  
  const parseResult = schema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parseResult.error.issues },
      { status: 400 }
    );
  }
  
  const data = parseResult.data;
  
  try {
    // Get the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        appointmentId: data.appointmentId,
        clinicId: auth.clinic.clinicId,
      },
      include: {
        appointment: true,
      },
    });
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }
    
    if (payment.status === 'PAID') {
      return NextResponse.json(
        { error: 'Payment is already marked as paid' },
        { status: 400 }
      );
    }
    
    // Build update data
    const updateData: Record<string, unknown> = {
      status: 'PAID' as PaymentStatus,
      paymentType: data.paymentType as PaymentType,
      paidAt: new Date(),
      markedById: auth.clinic.staffId,
      markedAt: new Date(),
    };
    
    // ADMIN can override amount and set external references
    if (isAdmin && 'amount' in data && data.amount) {
      updateData.amount = data.amount;
    }
    if (isAdmin && 'externalPaymentId' in data) {
      updateData.externalPaymentId = data.externalPaymentId;
    }
    if (isAdmin && 'externalOrderId' in data) {
      updateData.externalOrderId = data.externalOrderId;
    }
    
    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
    
    // Update appointment status if needed
    if (payment.appointment.status === 'PENDING') {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { 
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });
    }
    
    // Create audit log
    await createAuditLog({
      clinicId: auth.clinic.clinicId,
      entityType: 'Payment',
      entityId: payment.id,
      action: 'MARK_PAID',
      changes: {
        previousStatus: payment.status,
        newStatus: 'PAID',
        paymentType: data.paymentType,
        markedByRole: auth.clinic.role,
      },
      performedById: auth.user.id,
      performedByRole: auth.clinic.role,
      ...getRequestMetadata(request),
    });
    
    // Filter response based on role
    const response = {
      id: updatedPayment.id,
      status: updatedPayment.status,
      paymentType: updatedPayment.paymentType,
      paidAt: updatedPayment.paidAt,
      patient: updatedPayment.patient,
      // Amount only for ADMIN
      ...(isAdmin ? { amount: Number(updatedPayment.amount) } : {}),
    };
    
    return NextResponse.json({
      message: 'Payment marked as completed',
      payment: response,
    });
    
  } catch (error) {
    console.error('Failed to mark payment:', error);
    return NextResponse.json(
      { error: 'Failed to mark payment' },
      { status: 500 }
    );
  }
});

// ============================================================================
// PATCH - Refund Payment (ADMIN ONLY)
// ============================================================================

export const PATCH = withFinancialAccess(async (request, context, auth) => {
  const body = await request.json();
  
  const schema = z.object({
    paymentId: z.string(),
    reason: z.string().optional(),
  });
  
  const parseResult = schema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parseResult.error.issues },
      { status: 400 }
    );
  }
  
  const { paymentId, reason } = parseResult.data;
  
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        clinicId: auth.clinic.clinicId,
      },
    });
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    if (payment.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Only paid payments can be refunded' },
        { status: 400 }
      );
    }
    
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
      },
    });
    
    // Create audit log
    await createAuditLog({
      clinicId: auth.clinic.clinicId,
      entityType: 'Payment',
      entityId: paymentId,
      action: 'REFUND',
      changes: {
        previousStatus: payment.status,
        newStatus: 'REFUNDED',
        amount: Number(payment.amount),
        reason,
      },
      performedById: auth.user.id,
      performedByRole: auth.clinic.role,
      ...getRequestMetadata(request),
    });
    
    return NextResponse.json({
      message: 'Payment refunded successfully',
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        amount: Number(updatedPayment.amount),
        refundedAt: updatedPayment.refundedAt,
      },
    });
    
  } catch (error) {
    console.error('Failed to refund payment:', error);
    return NextResponse.json(
      { error: 'Failed to refund payment' },
      { status: 500 }
    );
  }
});
