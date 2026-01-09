/**
 * Authentication & Authorization Middleware
 * 
 * Provides middleware functions for protecting API routes with role-based access control.
 * 
 * IMPORTANT: All financial data protection is enforced at the API level.
 * Do NOT rely on frontend hiding alone.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { 
  PermissionType, 
  hasAllPermissions,
  hasAnyPermission,
  filterFinancialData,
  filterAppointmentData,
  filterPaymentData,
  filterAnalyticsData,
  canViewFinancialData,
} from '@/lib/permissions';
import { StaffRole } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface ClinicContext {
  clinicId: string;
  clinicSlug: string;
  clinicName: string;
  staffId: string;
  role: StaffRole;
  permissions: PermissionType[];
}

export interface AuthContext {
  user: AuthenticatedUser;
  clinic: ClinicContext | null;
}

export type AuthenticatedHandler<T = unknown> = (
  request: NextRequest,
  context: { params: Record<string, string> },
  auth: AuthContext
) => Promise<NextResponse<T>>;

export type ProtectedHandler<T = unknown> = (
  request: NextRequest,
  context: { params: Record<string, string> },
  auth: AuthContext & { clinic: ClinicContext }
) => Promise<NextResponse<T>>;

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export const AuthErrors = {
  UNAUTHORIZED: NextResponse.json(
    { error: 'Authentication required', code: 'UNAUTHORIZED' },
    { status: 401 }
  ),
  FORBIDDEN: NextResponse.json(
    { error: 'Access denied', code: 'FORBIDDEN' },
    { status: 403 }
  ),
  NO_CLINIC: NextResponse.json(
    { error: 'No clinic context found', code: 'NO_CLINIC' },
    { status: 403 }
  ),
  INSUFFICIENT_PERMISSIONS: (required: PermissionType[]) => NextResponse.json(
    { 
      error: 'Insufficient permissions', 
      code: 'INSUFFICIENT_PERMISSIONS',
      required 
    },
    { status: 403 }
  ),
  FINANCIAL_ACCESS_DENIED: NextResponse.json(
    { error: 'Financial data access denied', code: 'FINANCIAL_ACCESS_DENIED' },
    { status: 403 }
  ),
};

// ============================================================================
// SESSION & CONTEXT HELPERS
// ============================================================================

/**
 * Get the authenticated user from session
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }
  
  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
  };
}

/**
 * Get clinic context for a user
 * Returns the first active clinic membership for the user
 */
export async function getClinicContext(
  userId: string,
  clinicId?: string
): Promise<ClinicContext | null> {
  const whereClause: Record<string, unknown> = {
    userId,
    isActive: true,
    clinic: { isActive: true },
  };
  
  if (clinicId) {
    whereClause.clinicId = clinicId;
  }
  
  const staffMembership = await prisma.clinicStaff.findFirst({
    where: whereClause,
    include: {
      clinic: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  if (!staffMembership) {
    return null;
  }
  
  const { RolePermissions } = await import('@/lib/permissions');
  
  return {
    clinicId: staffMembership.clinic.id,
    clinicSlug: staffMembership.clinic.slug,
    clinicName: staffMembership.clinic.name,
    staffId: staffMembership.id,
    role: staffMembership.role,
    permissions: RolePermissions[staffMembership.role],
  };
}

/**
 * Get full auth context for a user
 */
export async function getAuthContext(clinicId?: string): Promise<AuthContext | null> {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return null;
  }
  
  const clinic = await getClinicContext(user.id, clinicId);
  
  return { user, clinic };
}

// ============================================================================
// MIDDLEWARE WRAPPERS
// ============================================================================

/**
 * Wrapper for routes that require authentication only
 * Does not require clinic context
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return AuthErrors.UNAUTHORIZED;
    }
    
    const clinic = await getClinicContext(user.id);
    
    return handler(request, context, { user, clinic });
  };
}

/**
 * Wrapper for routes that require authentication AND clinic context
 */
export function withClinic(handler: ProtectedHandler) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return AuthErrors.UNAUTHORIZED;
    }
    
    // Try to get clinic ID from query params or headers
    const url = new URL(request.url);
    const clinicId = url.searchParams.get('clinicId') || 
                     request.headers.get('x-clinic-id') || 
                     undefined;
    
    const clinic = await getClinicContext(user.id, clinicId || undefined);
    
    if (!clinic) {
      return AuthErrors.NO_CLINIC;
    }
    
    return handler(request, context, { user, clinic });
  };
}

/**
 * Wrapper for routes that require specific permissions
 */
export function withPermissions(
  permissions: PermissionType[],
  requireAll: boolean = true
) {
  return function(handler: ProtectedHandler) {
    return async (
      request: NextRequest,
      context: { params: Record<string, string> }
    ): Promise<NextResponse> => {
      const user = await getAuthenticatedUser();
      
      if (!user) {
        return AuthErrors.UNAUTHORIZED;
      }
      
      const url = new URL(request.url);
      const clinicId = url.searchParams.get('clinicId') || 
                       request.headers.get('x-clinic-id') || 
                       undefined;
      
      const clinic = await getClinicContext(user.id, clinicId || undefined);
      
      if (!clinic) {
        return AuthErrors.NO_CLINIC;
      }
      
      const hasAccess = requireAll 
        ? hasAllPermissions(clinic.role, permissions)
        : hasAnyPermission(clinic.role, permissions);
      
      if (!hasAccess) {
        return AuthErrors.INSUFFICIENT_PERMISSIONS(permissions);
      }
      
      return handler(request, context, { user, clinic });
    };
  };
}

/**
 * Wrapper specifically for ADMIN-only routes
 */
export function withAdminOnly(handler: ProtectedHandler) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return AuthErrors.UNAUTHORIZED;
    }
    
    const url = new URL(request.url);
    const clinicId = url.searchParams.get('clinicId') || 
                     request.headers.get('x-clinic-id') || 
                     undefined;
    
    const clinic = await getClinicContext(user.id, clinicId || undefined);
    
    if (!clinic) {
      return AuthErrors.NO_CLINIC;
    }
    
    if (clinic.role !== 'ADMIN') {
      return AuthErrors.FORBIDDEN;
    }
    
    return handler(request, context, { user, clinic });
  };
}

/**
 * Wrapper for routes that handle financial data
 * Automatically blocks non-ADMIN access
 */
export function withFinancialAccess(handler: ProtectedHandler) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return AuthErrors.UNAUTHORIZED;
    }
    
    const url = new URL(request.url);
    const clinicId = url.searchParams.get('clinicId') || 
                     request.headers.get('x-clinic-id') || 
                     undefined;
    
    const clinic = await getClinicContext(user.id, clinicId || undefined);
    
    if (!clinic) {
      return AuthErrors.NO_CLINIC;
    }
    
    if (!canViewFinancialData(clinic.role)) {
      return AuthErrors.FINANCIAL_ACCESS_DENIED;
    }
    
    return handler(request, context, { user, clinic });
  };
}

// ============================================================================
// DATA FILTERING HELPERS (for use in handlers)
// ============================================================================

/**
 * Filter response data based on user's role
 */
export function filterResponseData<T extends Record<string, unknown>>(
  data: T,
  role: StaffRole,
  dataType: 'appointment' | 'payment' | 'analytics' | 'general'
): T {
  switch (dataType) {
    case 'appointment':
      return filterAppointmentData(data, role) as T;
    case 'payment':
      return filterPaymentData(data, role) as T;
    case 'analytics':
      return filterAnalyticsData(data, role) as T;
    default:
      return filterFinancialData(data, role);
  }
}

/**
 * Filter array response data based on user's role
 */
export function filterResponseArray<T extends Record<string, unknown>>(
  dataArray: T[],
  role: StaffRole,
  dataType: 'appointment' | 'payment' | 'analytics' | 'general'
): T[] {
  return dataArray.map(item => filterResponseData(item, role, dataType));
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export interface AuditLogData {
  clinicId: string;
  entityType: string;
  entityId: string;
  action: string;
  changes?: Record<string, unknown>;
  performedById: string;
  performedByRole: StaffRole;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        clinicId: data.clinicId,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        changes: data.changes as object | undefined,
        performedById: data.performedById,
        performedByRole: data.performedByRole,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit log failure shouldn't break the operation
  }
}

/**
 * Extract request metadata for audit logging
 */
export function getRequestMetadata(request: NextRequest): {
  ipAddress?: string;
  userAgent?: string;
} {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };
}
