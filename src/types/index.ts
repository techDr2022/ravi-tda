// TDAppointments - Type Definitions

import { StaffRole, PaymentType, PatientSource, BookingType } from '@prisma/client';

// ============================================================================
// NAVIGATION & UI
// ============================================================================

export interface NavLink {
  href: string;
  label: string;
}

export interface TrustBadge {
  icon: string;
  text: string;
}

export interface WhyUsPoint {
  title: string;
  description: string;
  icon: string;
  stat: string;
  statLabel: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
  color: 'primary' | 'secondary' | 'accent';
}

export interface DashboardTab {
  id: string;
  label: string;
  icon: string;
  requiredPermission?: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  popular: boolean;
  features: string[];
  notIncluded: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GeoSEOContent {
  title: string;
  description: string;
  keywords: string[];
}

// ============================================================================
// USER & AUTH
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  clinicName?: string;
  plan?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Extended session user with clinic context
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  clinicId?: string;
  clinicSlug?: string;
  clinicName?: string;
  staffId?: string;
  role?: StaffRole;
}

// ============================================================================
// CLINIC & STAFF
// ============================================================================

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ClinicStaff {
  id: string;
  clinicId: string;
  userId: string;
  role: StaffRole;
  jobTitle?: string;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

// ============================================================================
// APPOINTMENTS
// ============================================================================

export interface Appointment {
  id: string;
  bookingRef: string;
  clinicId: string;
  patientId: string;
  consultationTypeId: string;
  doctorProfileId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  bookingType: BookingType;
  patientSource: PatientSource;
  reasonForVisit?: string;
  symptoms?: string;
  notes?: string;
  // Fee only visible to ADMIN
  fee?: number;
  bookedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

// Filtered appointment for non-admin roles (no financial data)
export interface FilteredAppointment extends Omit<Appointment, 'fee'> {
  patient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  consultationType: {
    id: string;
    name: string;
    type: string;
    duration: number;
  };
  bookedBy?: {
    id: string;
    user: { name: string };
  };
  payment?: {
    id: string;
    status: string;
    paymentType: PaymentType;
    paidAt?: Date;
  };
}

// Full appointment for ADMIN (includes financial data)
export interface AdminAppointment extends FilteredAppointment {
  fee: number;
  consultationType: {
    id: string;
    name: string;
    type: string;
    duration: number;
    fee: number;
  };
  payment?: {
    id: string;
    status: string;
    paymentType: PaymentType;
    amount: number;
    paidAt?: Date;
  };
}

// ============================================================================
// PATIENTS
// ============================================================================

export interface Patient {
  id: string;
  clinicId: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  pincode?: string;
  allergies?: string;
  medicalHistory?: string;
  source: PatientSource;
  referredBy?: string;
  sourceDetails?: string;
  createdAt: Date;
}

// ============================================================================
// PAYMENTS
// ============================================================================

// Base payment info (visible to all roles)
export interface BasePayment {
  id: string;
  status: string;
  paymentType: PaymentType;
  paidAt?: Date;
  markedAt?: Date;
  createdAt: Date;
  appointment: {
    id: string;
    bookingRef: string;
    date: Date;
    startTime: string;
    status: string;
  };
  patient: {
    id: string;
    name: string;
    phone: string;
  };
  markedBy?: {
    id: string;
    user: { name: string };
  };
}

// ADMIN-only payment info (includes financial data)
export interface AdminPayment extends BasePayment {
  amount: number;
  currency: string;
  externalPaymentId?: string;
  externalOrderId?: string;
}

// ============================================================================
// ANALYTICS
// ============================================================================

// Operational metrics (visible to all roles with analytics permission)
export interface OperationalMetrics {
  summary: {
    totalAppointments: number;
    todayAppointments: number;
    newPatients: number;
    totalPatients: number;
  };
  appointmentsByStatus: Record<string, number>;
  appointmentsBySource: Record<string, number>;
  appointmentsByBookingType: Record<string, number>;
  patientsBySource: Record<string, number>;
  dailyTrend: Array<{ date: Date; count: number }>;
}

// Financial metrics (ADMIN only)
export interface FinancialMetrics {
  totalRevenue: number;
  pendingRevenue: number;
  totalPaidPayments: number;
  totalPendingPayments: number;
  revenueByPaymentType: Record<string, number>;
  revenueBySource: Record<string, number>;
  dailyRevenueTrend: Array<{ date: Date; revenue: number }>;
}

// Dashboard stats for different roles
export interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  completedToday: number;
  newPatients: number;
  // ADMIN only
  revenue?: number;
  pendingPayments?: number;
}

// Legacy compatibility
export interface LegacyDashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  completedToday: number;
  revenue: number;
  newPatients: number;
  reviewsThisMonth: number;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AppointmentsResponse {
  appointments: FilteredAppointment[] | AdminAppointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentsResponse {
  payments: BasePayment[] | AdminPayment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // ADMIN only
  totals?: {
    totalRevenue: number;
    cashRevenue: number;
    onlineRevenue: number;
  };
}

export interface AnalyticsResponse {
  period: { start: Date; end: Date };
  metrics: OperationalMetrics;
  // ADMIN only
  financialMetrics?: FinancialMetrics;
  _notice?: string;
}

// ============================================================================
// SUBSCRIPTIONS & PAYMENTS (External)
// ============================================================================

export interface SubscriptionPayload {
  planId: string;
  amount: number;
  email?: string;
  name?: string;
  contact?: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ============================================================================
// FORM SCHEMAS
// ============================================================================

export interface CreateAppointmentForm {
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  consultationTypeId: string;
  doctorProfileId?: string;
  date: string;
  startTime: string;
  reasonForVisit?: string;
  symptoms?: string;
  bookingType: BookingType;
  patientSource: PatientSource;
  referredBy?: string;
  sourceDetails?: string;
}

export interface MarkPaymentForm {
  appointmentId: string;
  paymentType: PaymentType;
  // ADMIN only
  amount?: number;
  externalPaymentId?: string;
  externalOrderId?: string;
}

// ============================================================================
// PERMISSION TYPES (Re-exported for convenience)
// ============================================================================

export { StaffRole, PaymentType, PatientSource, BookingType };
