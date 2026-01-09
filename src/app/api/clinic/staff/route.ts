/**
 * Clinic Staff Management API
 * 
 * Role-based access:
 * - ADMIN: Can view all staff, invite, update roles, deactivate
 * - MANAGER: Can view staff (no role modifications)
 * - RECEPTION: Can view staff list only
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withClinic,
  createAuditLog,
  getRequestMetadata,
} from '@/lib/middleware/auth-middleware';
import { hasPermission, Permission, isRoleHigherThan } from '@/lib/permissions';
import { StaffRole } from '@prisma/client';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const InviteStaffSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MANAGER', 'RECEPTION']),
  jobTitle: z.string().optional(),
});

const UpdateStaffSchema = z.object({
  staffId: z.string(),
  role: z.enum(['ADMIN', 'MANAGER', 'RECEPTION']).optional(),
  jobTitle: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// GET - List Staff
// ============================================================================

export const GET = withClinic(async (request, context, auth) => {
  if (!hasPermission(auth.clinic.role, Permission.STAFF_VIEW)) {
    return NextResponse.json(
      { error: 'Permission denied: Cannot view staff' },
      { status: 403 }
    );
  }
  
  const staff = await prisma.clinicStaff.findMany({
    where: {
      clinicId: auth.clinic.clinicId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' },
      { createdAt: 'asc' },
    ],
  });
  
  return NextResponse.json({
    staff: staff.map(s => ({
      id: s.id,
      role: s.role,
      jobTitle: s.jobTitle,
      isActive: s.isActive,
      joinedAt: s.joinedAt,
      user: s.user,
    })),
  });
});

// ============================================================================
// POST - Invite Staff
// ============================================================================

export const POST = withClinic(async (request, context, auth) => {
  if (!hasPermission(auth.clinic.role, Permission.STAFF_INVITE)) {
    return NextResponse.json(
      { error: 'Permission denied: Cannot invite staff' },
      { status: 403 }
    );
  }
  
  const body = await request.json();
  
  const parseResult = InviteStaffSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parseResult.error.issues },
      { status: 400 }
    );
  }
  
  const { email, role, jobTitle } = parseResult.data;
  
  // Cannot invite someone with higher role than yourself
  if (isRoleHigherThan(role as StaffRole, auth.clinic.role)) {
    return NextResponse.json(
      { error: 'Cannot invite staff with higher role than your own' },
      { status: 403 }
    );
  }
  
  try {
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    if (!user) {
      // Create user (they'll set password on first login)
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
        },
      });
    }
    
    // Check if already a staff member
    const existingStaff = await prisma.clinicStaff.findUnique({
      where: {
        clinicId_userId: {
          clinicId: auth.clinic.clinicId,
          userId: user.id,
        },
      },
    });
    
    if (existingStaff) {
      return NextResponse.json(
        { error: 'User is already a staff member of this clinic' },
        { status: 400 }
      );
    }
    
    // Create staff membership
    const staff = await prisma.clinicStaff.create({
      data: {
        clinicId: auth.clinic.clinicId,
        userId: user.id,
        role: role as StaffRole,
        jobTitle,
        invitedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Audit log
    await createAuditLog({
      clinicId: auth.clinic.clinicId,
      entityType: 'ClinicStaff',
      entityId: staff.id,
      action: 'INVITE',
      changes: {
        email,
        role,
        invitedBy: auth.user.email,
      },
      performedById: auth.user.id,
      performedByRole: auth.clinic.role,
      ...getRequestMetadata(request),
    });
    
    // TODO: Send invitation email
    
    return NextResponse.json({
      message: 'Staff member invited successfully',
      staff: {
        id: staff.id,
        role: staff.role,
        jobTitle: staff.jobTitle,
        user: staff.user,
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error('Failed to invite staff:', error);
    return NextResponse.json(
      { error: 'Failed to invite staff member' },
      { status: 500 }
    );
  }
});

// ============================================================================
// PATCH - Update Staff
// ============================================================================

export const PATCH = withClinic(async (request, context, auth) => {
  if (!hasPermission(auth.clinic.role, Permission.STAFF_MANAGE)) {
    return NextResponse.json(
      { error: 'Permission denied: Cannot manage staff' },
      { status: 403 }
    );
  }
  
  const body = await request.json();
  
  const parseResult = UpdateStaffSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parseResult.error.issues },
      { status: 400 }
    );
  }
  
  const { staffId, role, jobTitle, isActive } = parseResult.data;
  
  try {
    // Get existing staff member
    const existingStaff = await prisma.clinicStaff.findFirst({
      where: {
        id: staffId,
        clinicId: auth.clinic.clinicId,
      },
    });
    
    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    // Cannot modify staff with higher or equal role (unless you're ADMIN)
    if (auth.clinic.role !== 'ADMIN' && 
        !isRoleHigherThan(auth.clinic.role, existingStaff.role)) {
      return NextResponse.json(
        { error: 'Cannot modify staff with equal or higher role' },
        { status: 403 }
      );
    }
    
    // Cannot promote to higher role than yourself
    if (role && isRoleHigherThan(role as StaffRole, auth.clinic.role)) {
      return NextResponse.json(
        { error: 'Cannot assign role higher than your own' },
        { status: 403 }
      );
    }
    
    // Update staff
    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.role = role;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedStaff = await prisma.clinicStaff.update({
      where: { id: staffId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Audit log
    await createAuditLog({
      clinicId: auth.clinic.clinicId,
      entityType: 'ClinicStaff',
      entityId: staffId,
      action: 'UPDATE',
      changes: {
        before: {
          role: existingStaff.role,
          jobTitle: existingStaff.jobTitle,
          isActive: existingStaff.isActive,
        },
        after: updateData,
      },
      performedById: auth.user.id,
      performedByRole: auth.clinic.role,
      ...getRequestMetadata(request),
    });
    
    return NextResponse.json({
      message: 'Staff member updated successfully',
      staff: {
        id: updatedStaff.id,
        role: updatedStaff.role,
        jobTitle: updatedStaff.jobTitle,
        isActive: updatedStaff.isActive,
        user: updatedStaff.user,
      },
    });
    
  } catch (error) {
    console.error('Failed to update staff:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
});
