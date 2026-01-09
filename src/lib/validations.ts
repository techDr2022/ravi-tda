/**
 * Zod Validation Schemas
 * For API request validation
 */

import { z } from 'zod';

// ============================================================================
// USER & AUTH VALIDATIONS
// ============================================================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase, one lowercase, and one number'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// DOCTOR PROFILE VALIDATIONS
// ============================================================================

export const doctorProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  specialization: z.string().min(2, 'Specialization is required'),
  qualifications: z.string().optional(),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  experience: z.number().int().min(0).max(70).optional(),
  phone: z.string().optional(),
  clinicName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  defaultDuration: z.number().int().min(5).max(120).default(15),
  bufferTime: z.number().int().min(0).max(60).default(5),
});

export const updateDoctorProfileSchema = doctorProfileSchema.partial();

// ============================================================================
// CONSULTATION TYPE VALIDATIONS
// ============================================================================

export const consultationTypeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.enum(['IN_PERSON', 'VIDEO_CALL', 'PHONE_CALL']),
  description: z.string().optional(),
  fee: z.number().positive('Fee must be positive'),
  duration: z.number().int().min(5).max(180),
  isActive: z.boolean().default(true),
  platformUrl: z.string().url().optional().nullable(),
});

// ============================================================================
// AVAILABILITY VALIDATIONS
// ============================================================================

export const availabilitySchema = z.object({
  dayOfWeek: z.enum([
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  isActive: z.boolean().default(true),
  customFee: z.number().positive().optional().nullable(),
});

export const bulkAvailabilitySchema = z.array(availabilitySchema);

// ============================================================================
// APPOINTMENT RULES VALIDATIONS
// ============================================================================

export const appointmentRulesSchema = z.object({
  minAdvanceBooking: z.number().int().min(0).default(60),
  maxAdvanceBooking: z.number().int().min(60).default(43200),
  allowCancellation: z.boolean().default(true),
  cancellationWindow: z.number().int().min(0).default(240),
  allowRescheduling: z.boolean().default(true),
  reschedulingWindow: z.number().int().min(0).default(240),
  maxReschedules: z.number().int().min(0).default(2),
  maxBookingsPerDay: z.number().int().positive().optional().nullable(),
  maxBookingsPerPatient: z.number().int().positive().optional().nullable(),
  requirePayment: z.boolean().default(false),
  paymentMode: z.enum(['PAY_AT_CLINIC', 'PAY_ONLINE', 'BOTH']).default('PAY_AT_CLINIC'),
  sendConfirmation: z.boolean().default(true),
  sendReminder: z.boolean().default(true),
  reminderHours: z.number().int().min(1).max(72).default(24),
});

// ============================================================================
// PATIENT VALIDATIONS
// ============================================================================

export const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
});

// ============================================================================
// APPOINTMENT VALIDATIONS
// ============================================================================

export const createAppointmentSchema = z.object({
  doctorSlug: z.string().min(1, 'Doctor is required'),
  consultationTypeId: z.string().min(1, 'Consultation type is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  patient: z.object({
    name: z.string().min(2, 'Patient name is required'),
    phone: z.string().min(10, 'Phone number is required'),
    email: z.string().email().optional().nullable(),
  }),
  reasonForVisit: z.string().max(500).optional().nullable(),
  symptoms: z.string().max(1000).optional().nullable(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  notes: z.string().optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'REFUNDED', 'FAILED']).optional(),
  paymentId: z.string().optional(),
});

export const rescheduleAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
});

// ============================================================================
// BLOCKED SLOT VALIDATIONS
// ============================================================================

export const blockedSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  reason: z.string().max(200).optional().nullable(),
});

// ============================================================================
// ONBOARDING WIZARD VALIDATIONS
// ============================================================================

export const onboardingStep1Schema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z
    .string()
    .min(3, 'URL slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  specialization: z.string().min(2, 'Specialization is required'),
  phone: z.string().optional(),
  clinicName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export const onboardingStep2Schema = z.object({
  consultationTypes: z.array(consultationTypeSchema).min(1, 'At least one consultation type is required'),
});

export const onboardingStep3Schema = z.object({
  defaultDuration: z.number().int().min(5).max(120),
  bufferTime: z.number().int().min(0).max(60),
  availability: z.array(availabilitySchema).min(1, 'At least one availability slot is required'),
});

export const onboardingStep4Schema = z.object({
  appointmentRules: appointmentRulesSchema,
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type DoctorProfileInput = z.infer<typeof doctorProfileSchema>;
export type ConsultationTypeInput = z.infer<typeof consultationTypeSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type AppointmentRulesInput = z.infer<typeof appointmentRulesSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type BlockedSlotInput = z.infer<typeof blockedSlotSchema>;
