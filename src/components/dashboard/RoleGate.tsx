'use client';

/**
 * RoleGate Component
 * 
 * Conditionally renders children based on user's permissions.
 * IMPORTANT: This is for UI display only. Backend always enforces permissions.
 */

import { ReactNode } from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { StaffRole } from '@prisma/client';
import { PermissionType } from '@/lib/permissions';

interface RoleGateProps {
  children: ReactNode;
  // Show content if user has this permission
  permission?: PermissionType;
  // Show content if user has ALL of these permissions
  permissions?: PermissionType[];
  // Show content if user has ANY of these permissions
  anyPermission?: PermissionType[];
  // Show content only for specific roles
  allowedRoles?: StaffRole[];
  // Fallback content when access is denied
  fallback?: ReactNode;
  // Show nothing (null) instead of fallback when access denied
  hideOnDenied?: boolean;
}

export function RoleGate({
  children,
  permission,
  permissions,
  anyPermission,
  allowedRoles,
  fallback = null,
  hideOnDenied = true,
}: RoleGateProps) {
  const { can, canAll, canAny, role, isLoading } = usePermissions();
  
  // While loading, show nothing to prevent flicker
  if (isLoading) {
    return null;
  }
  
  // Check role restriction
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return hideOnDenied ? null : <>{fallback}</>;
  }
  
  // Check single permission
  if (permission && !can(permission)) {
    return hideOnDenied ? null : <>{fallback}</>;
  }
  
  // Check all permissions
  if (permissions && !canAll(permissions)) {
    return hideOnDenied ? null : <>{fallback}</>;
  }
  
  // Check any permission
  if (anyPermission && !canAny(anyPermission)) {
    return hideOnDenied ? null : <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * AdminOnly Component
 * Shortcut for content that should only be visible to ADMIN role
 */
export function AdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <RoleGate allowedRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * FinancialDataGate Component
 * Gate for content containing financial information
 */
export function FinancialDataGate({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <RoleGate 
      permission={Permission.PAYMENT_VIEW_AMOUNT} 
      fallback={fallback}
    >
      {children}
    </RoleGate>
  );
}

/**
 * ManagerOrAbove Component
 * Content visible to MANAGER and ADMIN
 */
export function ManagerOrAbove({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <RoleGate 
      allowedRoles={['ADMIN', 'MANAGER']} 
      fallback={fallback}
    >
      {children}
    </RoleGate>
  );
}

/**
 * AccessDeniedMessage Component
 * Shows a friendly message when access is denied
 */
export function AccessDeniedMessage({ 
  title = 'Access Restricted',
  message = 'You do not have permission to view this content.',
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm">{message}</p>
    </div>
  );
}
