'use client';

/**
 * usePermissions Hook
 * 
 * Client-side permission checking based on user's role.
 * IMPORTANT: This is for UI display purposes only.
 * Backend always enforces permissions - never rely solely on frontend hiding.
 */

import { useSession } from 'next-auth/react';
import { StaffRole } from '@prisma/client';
import {
  Permission,
  PermissionType,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  canViewFinancialData,
  canViewFinancialAnalytics,
  getRoleDisplayName,
  getRoleDescription,
} from '@/lib/permissions';

export interface UsePermissionsReturn {
  // Session state
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // User info
  userId: string | undefined;
  userEmail: string | undefined;
  userName: string | undefined | null;
  
  // Clinic context
  clinicId: string | undefined;
  clinicName: string | undefined;
  clinicSlug: string | undefined;
  staffId: string | undefined;
  
  // Role info
  role: StaffRole | undefined;
  roleDisplayName: string | undefined;
  roleDescription: string | undefined;
  
  // Permission checks
  can: (permission: PermissionType) => boolean;
  canAll: (permissions: PermissionType[]) => boolean;
  canAny: (permissions: PermissionType[]) => boolean;
  
  // Financial access shortcuts
  canViewFinancials: boolean;
  canViewFinancialReports: boolean;
  
  // Role checks
  isAdmin: boolean;
  isManager: boolean;
  isReception: boolean;
  
  // Helper to check if feature should be shown
  shouldShow: (permission: PermissionType) => boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { data: session, status } = useSession();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;
  
  const role = user?.role;
  
  // Permission check functions
  const can = (permission: PermissionType): boolean => {
    if (!role) return false;
    return hasPermission(role, permission);
  };
  
  const canAll = (permissions: PermissionType[]): boolean => {
    if (!role) return false;
    return hasAllPermissions(role, permissions);
  };
  
  const canAny = (permissions: PermissionType[]): boolean => {
    if (!role) return false;
    return hasAnyPermission(role, permissions);
  };
  
  // Financial access
  const canViewFinancials = role ? canViewFinancialData(role) : false;
  const canViewFinancialReports = role ? canViewFinancialAnalytics(role) : false;
  
  // Role checks
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isReception = role === 'RECEPTION';
  
  // UI helper - same as `can` but more semantic
  const shouldShow = (permission: PermissionType): boolean => can(permission);
  
  return {
    isLoading,
    isAuthenticated,
    
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.name,
    
    clinicId: user?.clinicId,
    clinicName: user?.clinicName,
    clinicSlug: user?.clinicSlug,
    staffId: user?.staffId,
    
    role,
    roleDisplayName: role ? getRoleDisplayName(role) : undefined,
    roleDescription: role ? getRoleDescription(role) : undefined,
    
    can,
    canAll,
    canAny,
    
    canViewFinancials,
    canViewFinancialReports,
    
    isAdmin,
    isManager,
    isReception,
    
    shouldShow,
  };
}

// Re-export Permission for convenience
export { Permission };
