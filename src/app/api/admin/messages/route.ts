/**
 * Message Logs API
 * 
 * ADMIN-ONLY ACCESS
 * - Only ADMIN role can view message logs
 * - Supports filtering by date, status, message type, appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminOnly } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const MessageLogQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED']).optional(),
  messageType: z.enum(['APPOINTMENT_CONFIRMATION', 'APPOINTMENT_REMINDER', 'APPOINTMENT_CANCELLATION', 'APPOINTMENT_RESCHEDULE', 'CUSTOM']).optional(),
  appointmentId: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
});

// ============================================================================
// GET - Fetch Message Logs
// ============================================================================

export const GET = withAdminOnly(async (request, context, auth) => {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Validate query parameters
    const validationResult = MessageLogQuerySchema.safeParse(params);
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
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Status filter
    if (filters.status) {
      whereClause.status = filters.status;
    }

    // Message type filter
    if (filters.messageType) {
      whereClause.messageType = filters.messageType;
    }

    // Appointment filter
    if (filters.appointmentId) {
      whereClause.appointmentId = filters.appointmentId;
    }

    // Fetch message logs
    const [messageLogs, total] = await Promise.all([
      prisma.messageLog.findMany({
        where: whereClause,
        include: {
          appointment: {
            select: {
              id: true,
              bookingRef: true,
              date: true,
              startTime: true,
              patient: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: filters.limit,
        skip: filters.offset,
      }),
      prisma.messageLog.count({
        where: whereClause,
      }),
    ]);

    // Get statistics
    const stats = await prisma.messageLog.groupBy({
      by: ['status'],
      where: {
        clinicId: clinic.clinicId,
        ...(filters.startDate || filters.endDate ? {
          createdAt: {
            ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
            ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
          },
        } : {}),
      },
      _count: {
        id: true,
      },
    });

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      messageLogs,
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filters.offset + filters.limit < total,
      },
      stats: {
        total: total,
        pending: statusStats.PENDING || 0,
        sent: statusStats.SENT || 0,
        delivered: statusStats.DELIVERED || 0,
        read: statusStats.READ || 0,
        failed: statusStats.FAILED || 0,
      },
    });
  } catch (error) {
    console.error('Get message logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message logs' },
      { status: 500 }
    );
  }
});
