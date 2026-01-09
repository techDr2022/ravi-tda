/**
 * Role-Based Access Control (RBAC) System
 * 
 * Roles:
 * - ADMIN: Full access including financial data, analytics, and settings
 * - MANAGER: Can manage appointments, patients, scheduling. NO financial data
 * - RECEPTION: Can book appointments, check-in patients. NO financial data
 * 
 * Core Rules:
 * - Only ADMIN can see revenue, payment amounts, reports
 * - MANAGER and RECEPTION must NEVER see money (UI + backend)
 * - Reception/Manager can mark payment done but cannot see amount
 */

import { StaffRole } from '@prisma/client';

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

export const Permission = {
  // Appointment permissions
  APPOINTMENT_VIEW: 'appointment:view',
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_UPDATE: 'appointment:update',
  APPOINTMENT_CANCEL: 'appointment:cancel',
  APPOINTMENT_RESCHEDULE: 'appointment:reschedule',
  
  // Patient permissions
  PATIENT_VIEW: 'patient:view',
  PATIENT_CREATE: 'patient:create',
  PATIENT_UPDATE: 'patient:update',
  PATIENT_DELETE: 'patient:delete',
  PATIENT_MEDICAL_HISTORY: 'patient:medical_history',
  
  // Schedule/Availability permissions
  SCHEDULE_VIEW: 'schedule:view',
  SCHEDULE_MANAGE: 'schedule:manage',
  
  // Payment permissions (ADMIN ONLY)
  PAYMENT_VIEW_AMOUNT: 'payment:view_amount',       // See actual payment amounts
  PAYMENT_MARK_DONE: 'payment:mark_done',           // Mark payment as completed
  PAYMENT_REFUND: 'payment:refund',                 // Process refunds
  
  // Financial permissions (ADMIN ONLY)
  FINANCIAL_VIEW_REVENUE: 'financial:view_revenue',
  FINANCIAL_VIEW_REPORTS: 'financial:view_reports',
  FINANCIAL_EXPORT: 'financial:export',
  
  // Analytics permissions (ADMIN ONLY)
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_VIEW_FINANCIAL: 'analytics:view_financial',
  
  // Staff management permissions
  STAFF_VIEW: 'staff:view',
  STAFF_MANAGE: 'staff:manage',
  STAFF_INVITE: 'staff:invite',
  
  // Clinic settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',
  SETTINGS_BILLING: 'settings:billing',
  
  // Consultation types
  CONSULTATION_VIEW: 'consultation:view',
  CONSULTATION_VIEW_FEE: 'consultation:view_fee',   // ADMIN ONLY
  CONSULTATION_MANAGE: 'consultation:manage',
} as const;

export type PermissionType = typeof Permission[keyof typeof Permission];

// ============================================================================
// ROLE-PERMISSION MAPPING
// ============================================================================

export const RolePermissions: Record<StaffRole, PermissionType[]> = {
  ADMIN: [
    // All permissions
    Permission.APPOINTMENT_VIEW,
    Permission.APPOINTMENT_CREATE,
    Permission.APPOINTMENT_UPDATE,
    Permission.APPOINTMENT_CANCEL,
    Permission.APPOINTMENT_RESCHEDULE,
    
    Permission.PATIENT_VIEW,
    Permission.PATIENT_CREATE,
    Permission.PATIENT_UPDATE,
    Permission.PATIENT_DELETE,
    Permission.PATIENT_MEDICAL_HISTORY,
    
    Permission.SCHEDULE_VIEW,
    Permission.SCHEDULE_MANAGE,
    
    // ADMIN ONLY - Payment & Financial
    Permission.PAYMENT_VIEW_AMOUNT,
    Permission.PAYMENT_MARK_DONE,
    Permission.PAYMENT_REFUND,
    
    Permission.FINANCIAL_VIEW_REVENUE,
    Permission.FINANCIAL_VIEW_REPORTS,
    Permission.FINANCIAL_EXPORT,
    
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_VIEW_FINANCIAL,
    
    Permission.STAFF_VIEW,
    Permission.STAFF_MANAGE,
    Permission.STAFF_INVITE,
    
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_MANAGE,
    Permission.SETTINGS_BILLING,
    
    Permission.CONSULTATION_VIEW,
    Permission.CONSULTATION_VIEW_FEE,
    Permission.CONSULTATION_MANAGE,
  ],
  
  MANAGER: [
    Permission.APPOINTMENT_VIEW,
    Permission.APPOINTMENT_CREATE,
    Permission.APPOINTMENT_UPDATE,
    Permission.APPOINTMENT_CANCEL,
    Permission.APPOINTMENT_RESCHEDULE,
    
    Permission.PATIENT_VIEW,
    Permission.PATIENT_CREATE,
    Permission.PATIENT_UPDATE,
    Permission.PATIENT_MEDICAL_HISTORY,
    
    Permission.SCHEDULE_VIEW,
    Permission.SCHEDULE_MANAGE,
    
    // Can mark payment done but NOT see amount
    Permission.PAYMENT_MARK_DONE,
    
    // Non-financial analytics only
    Permission.ANALYTICS_VIEW,
    
    Permission.STAFF_VIEW,
    
    Permission.SETTINGS_VIEW,
    
    Permission.CONSULTATION_VIEW,
    // NO consultation fee visibility
  ],
  
  RECEPTION: [
    Permission.APPOINTMENT_VIEW,
    Permission.APPOINTMENT_CREATE,
    Permission.APPOINTMENT_UPDATE,
    Permission.APPOINTMENT_CANCEL,
    Permission.APPOINTMENT_RESCHEDULE,
    
    Permission.PATIENT_VIEW,
    Permission.PATIENT_CREATE,
    Permission.PATIENT_UPDATE,
    
    Permission.SCHEDULE_VIEW,
    
    // Can mark payment done but NOT see amount
    Permission.PAYMENT_MARK_DONE,
    
    Permission.CONSULTATION_VIEW,
    // NO consultation fee visibility
  ],
};

// ============================================================================
// PERMISSION CHECKING UTILITIES
// ============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: StaffRole, permission: PermissionType): boolean {
  return RolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: StaffRole, permissions: PermissionType[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: StaffRole, permissions: PermissionType[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role can view financial data
 */
export function canViewFinancialData(role: StaffRole): boolean {
  return hasPermission(role, Permission.PAYMENT_VIEW_AMOUNT);
}

/**
 * Check if a role can view analytics with financial data
 */
export function canViewFinancialAnalytics(role: StaffRole): boolean {
  return hasPermission(role, Permission.ANALYTICS_VIEW_FINANCIAL);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: StaffRole): PermissionType[] {
  return RolePermissions[role] || [];
}

// ============================================================================
// DATA FILTERING UTILITIES
// ============================================================================

/**
 * Fields that should be hidden from non-ADMIN roles
 */
export const SensitiveFinancialFields = [
  'amount',
  'fee',
  'totalRevenue',
  'cashRevenue',
  'onlineRevenue',
  'pendingPayments',
  'revenue',
  'price',
] as const;

/**
 * Remove financial fields from an object based on role
 */
export function filterFinancialData<T extends Record<string, unknown>>(
  data: T,
  role: StaffRole
): T {
  if (canViewFinancialData(role)) {
    return data;
  }
  
  const filtered = { ...data };
  
  for (const field of SensitiveFinancialFields) {
    if (field in filtered) {
      delete (filtered as Record<string, unknown>)[field];
    }
  }
  
  return filtered;
}

/**
 * Filter an array of objects to remove financial data
 */
export function filterFinancialDataArray<T extends Record<string, unknown>>(
  dataArray: T[],
  role: StaffRole
): T[] {
  if (canViewFinancialData(role)) {
    return dataArray;
  }
  
  return dataArray.map(item => filterFinancialData(item, role));
}

/**
 * Filter appointment data based on role
 */
export function filterAppointmentData(
  appointment: Record<string, unknown>,
  role: StaffRole
): Record<string, unknown> {
  const filtered = { ...appointment };
  
  if (!canViewFinancialData(role)) {
    delete filtered.fee;
    
    // Also filter nested payment data
    if (filtered.payment && typeof filtered.payment === 'object') {
      const payment = { ...filtered.payment as Record<string, unknown> };
      delete payment.amount;
      filtered.payment = payment;
    }
  }
  
  return filtered;
}

/**
 * Filter payment data based on role
 * Manager/Reception can see payment exists and status, but NOT amount
 */
export function filterPaymentData(
  payment: Record<string, unknown>,
  role: StaffRole
): Record<string, unknown> {
  const filtered = { ...payment };
  
  if (!canViewFinancialData(role)) {
    delete filtered.amount;
    delete filtered.totalRevenue;
    delete filtered.cashRevenue;
    delete filtered.onlineRevenue;
  }
  
  return filtered;
}

/**
 * Filter analytics data based on role
 * Non-ADMIN roles get operational metrics only, no financial data
 */
export function filterAnalyticsData(
  analytics: Record<string, unknown>,
  role: StaffRole
): Record<string, unknown> {
  if (canViewFinancialAnalytics(role)) {
    return analytics;
  }
  
  const filtered = { ...analytics };
  
  // Remove all financial metrics
  delete filtered.totalRevenue;
  delete filtered.cashRevenue;
  delete filtered.onlineRevenue;
  delete filtered.pendingPayments;
  delete filtered.averageRevenue;
  delete filtered.revenueBySource;
  delete filtered.revenueByPaymentType;
  
  return filtered;
}

// ============================================================================
// ROLE HIERARCHY UTILITIES
// ============================================================================

const RoleHierarchy: Record<StaffRole, number> = {
  ADMIN: 3,
  MANAGER: 2,
  RECEPTION: 1,
};

/**
 * Check if roleA is higher than roleB in hierarchy
 */
export function isRoleHigherThan(roleA: StaffRole, roleB: StaffRole): boolean {
  return RoleHierarchy[roleA] > RoleHierarchy[roleB];
}

/**
 * Check if roleA is same or higher than roleB in hierarchy
 */
export function isRoleSameOrHigherThan(roleA: StaffRole, roleB: StaffRole): boolean {
  return RoleHierarchy[roleA] >= RoleHierarchy[roleB];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: StaffRole): string {
  const names: Record<StaffRole, string> = {
    ADMIN: 'Administrator',
    MANAGER: 'Manager',
    RECEPTION: 'Receptionist',
  };
  return names[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: StaffRole): string {
  const descriptions: Record<StaffRole, string> = {
    ADMIN: 'Full access including financial data, analytics, reports, and all settings',
    MANAGER: 'Can manage appointments, patients, and schedules. Cannot see financial data',
    RECEPTION: 'Can book appointments and check-in patients. Cannot see financial data',
  };
  return descriptions[role];
}
