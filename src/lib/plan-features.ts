/**
 * Subscription Plan Feature Access Control
 * 
 * Defines which features are available for each subscription plan.
 * Features are restricted based on the clinic's active subscription plan.
 * 
 * Plans:
 * - Basic: Core appointment booking features
 * - Professional: Basic + Advanced features (GMB, Analytics, Teleconsultation)
 * - Enterprise: Professional + Multi-branch, API, Custom integrations
 */

import { PRICING_PLANS } from './constants';

// ============================================================================
// FEATURE DEFINITIONS
// ============================================================================

export const PlanFeature = {
  // Core features (available in all plans)
  APPOINTMENT_BOOKING: 'appointment:booking',
  WHATSAPP_NOTIFICATIONS: 'whatsapp:notifications',
  CLINIC_DASHBOARD: 'dashboard:view',
  PATIENT_MANAGEMENT: 'patient:management',
  EMAIL_SUPPORT: 'support:email',
  
  // Professional features
  GOOGLE_BOOK_NOW: 'integration:google_book_now',
  REVIEW_REMINDERS: 'whatsapp:review_reminders',
  ANALYTICS: 'analytics:view',
  SECURE_PAYMENTS: 'payments:secure',
  TELECONSULTATION: 'consultation:teleconsultation',
  PRIORITY_SUPPORT: 'support:priority',
  
  // Enterprise features
  MULTI_BRANCH: 'clinic:multi_branch',
  API_ACCESS: 'integration:api',
  CUSTOM_INTEGRATIONS: 'integration:custom',
  DEDICATED_ACCOUNT_MANAGER: 'support:account_manager',
  SLA_SUPPORT: 'support:sla',
  WHITE_LABEL: 'branding:white_label',
} as const;

export type PlanFeatureType = typeof PlanFeature[keyof typeof PlanFeature];

// ============================================================================
// PLAN-FEATURE MAPPING
// ============================================================================

/**
 * Features available in Basic plan
 */
const BASIC_FEATURES: PlanFeatureType[] = [
  PlanFeature.APPOINTMENT_BOOKING,
  PlanFeature.WHATSAPP_NOTIFICATIONS,
  PlanFeature.CLINIC_DASHBOARD,
  PlanFeature.PATIENT_MANAGEMENT,
  PlanFeature.EMAIL_SUPPORT,
];

/**
 * Features available in Professional plan (includes all Basic features)
 */
const PROFESSIONAL_FEATURES: PlanFeatureType[] = [
  ...BASIC_FEATURES,
  PlanFeature.GOOGLE_BOOK_NOW,
  PlanFeature.REVIEW_REMINDERS,
  PlanFeature.ANALYTICS,
  PlanFeature.SECURE_PAYMENTS,
  PlanFeature.TELECONSULTATION,
  PlanFeature.PRIORITY_SUPPORT,
];

/**
 * Features available in Enterprise plan (includes all Professional features)
 */
const ENTERPRISE_FEATURES: PlanFeatureType[] = [
  ...PROFESSIONAL_FEATURES,
  PlanFeature.MULTI_BRANCH,
  PlanFeature.API_ACCESS,
  PlanFeature.CUSTOM_INTEGRATIONS,
  PlanFeature.DEDICATED_ACCOUNT_MANAGER,
  PlanFeature.SLA_SUPPORT,
  PlanFeature.WHITE_LABEL,
];

/**
 * Map plan IDs to their available features
 */
export const PlanFeatures: Record<string, PlanFeatureType[]> = {
  basic: BASIC_FEATURES,
  professional: PROFESSIONAL_FEATURES,
  enterprise: ENTERPRISE_FEATURES,
  // Free/trial plans have basic features only
  free: BASIC_FEATURES,
  trial: BASIC_FEATURES,
};

// ============================================================================
// FEATURE CHECKING UTILITIES
// ============================================================================

/**
 * Check if a plan has access to a specific feature
 */
export function planHasFeature(planId: string, feature: PlanFeatureType): boolean {
  const features = PlanFeatures[planId.toLowerCase()];
  if (!features) {
    // Unknown plan - default to basic features only
    return BASIC_FEATURES.includes(feature);
  }
  return features.includes(feature);
}

/**
 * Check if a plan has access to ALL specified features
 */
export function planHasAllFeatures(planId: string, features: PlanFeatureType[]): boolean {
  return features.every(feature => planHasFeature(planId, feature));
}

/**
 * Check if a plan has access to ANY of the specified features
 */
export function planHasAnyFeature(planId: string, features: PlanFeatureType[]): boolean {
  return features.some(feature => planHasFeature(planId, feature));
}

/**
 * Get all features available for a plan
 */
export function getPlanFeatures(planId: string): PlanFeatureType[] {
  return PlanFeatures[planId.toLowerCase()] || BASIC_FEATURES;
}

/**
 * Get features that are NOT available for a plan
 */
export function getPlanMissingFeatures(planId: string): PlanFeatureType[] {
  const planFeatures = getPlanFeatures(planId);
  const allFeatures = Object.values(PlanFeature);
  return allFeatures.filter(feature => !planFeatures.includes(feature));
}

/**
 * Check if plan supports Google Book Now integration
 */
export function planSupportsGoogleBookNow(planId: string): boolean {
  return planHasFeature(planId, PlanFeature.GOOGLE_BOOK_NOW);
}

/**
 * Check if plan supports analytics
 */
export function planSupportsAnalytics(planId: string): boolean {
  return planHasFeature(planId, PlanFeature.ANALYTICS);
}

/**
 * Check if plan supports teleconsultation
 */
export function planSupportsTeleconsultation(planId: string): boolean {
  return planHasFeature(planId, PlanFeature.TELECONSULTATION);
}

/**
 * Check if plan supports multi-branch clinics
 */
export function planSupportsMultiBranch(planId: string): boolean {
  return planHasFeature(planId, PlanFeature.MULTI_BRANCH);
}

/**
 * Check if plan supports API access
 */
export function planSupportsApiAccess(planId: string): boolean {
  return planHasFeature(planId, PlanFeature.API_ACCESS);
}

/**
 * Check if plan supports review reminders
 */
export function planSupportsReviewReminders(planId: string): boolean {
  return planHasFeature(planId, PlanFeature.REVIEW_REMINDERS);
}

/**
 * Check if plan supports secure payments
 */
export function planSupportsSecurePayments(planId: string): boolean {
  return planHasFeature(planId, PlanFeature.SECURE_PAYMENTS);
}

// ============================================================================
// PLAN UPGRADE HELPERS
// ============================================================================

/**
 * Get the minimum plan required for a feature
 */
export function getMinimumPlanForFeature(feature: PlanFeatureType): string {
  if (BASIC_FEATURES.includes(feature)) {
    return 'basic';
  }
  if (PROFESSIONAL_FEATURES.includes(feature)) {
    return 'professional';
  }
  if (ENTERPRISE_FEATURES.includes(feature)) {
    return 'enterprise';
  }
  return 'enterprise'; // Default to enterprise for unknown features
}

/**
 * Get upgrade message for a feature
 */
export function getUpgradeMessageForFeature(feature: PlanFeatureType): string {
  const minPlan = getMinimumPlanForFeature(feature);
  const plan = PRICING_PLANS.find(p => p.id === minPlan);
  
  if (!plan) {
    return 'This feature requires an upgrade.';
  }
  
  if (plan.contactUs) {
    return `This feature is available in ${plan.name} plan. Please contact sales.`;
  }
  
  return `This feature is available in ${plan.name} plan (₹${plan.price?.toLocaleString()}/year). Upgrade to access this feature.`;
}

/**
 * Check if current plan can be upgraded to access a feature
 */
export function canUpgradeForFeature(currentPlanId: string, feature: PlanFeatureType): boolean {
  const minPlan = getMinimumPlanForFeature(feature);
  
  // Plan hierarchy: free < basic < professional < enterprise
  const planHierarchy: Record<string, number> = {
    free: 0,
    trial: 0,
    basic: 1,
    professional: 2,
    enterprise: 3,
  };
  
  const currentLevel = planHierarchy[currentPlanId.toLowerCase()] || 0;
  const requiredLevel = planHierarchy[minPlan] || 0;
  
  return requiredLevel > currentLevel;
}

// ============================================================================
// FEATURE DESCRIPTIONS
// ============================================================================

export const FeatureDescriptions: Record<PlanFeatureType, string> = {
  [PlanFeature.APPOINTMENT_BOOKING]: 'Online appointment booking system',
  [PlanFeature.WHATSAPP_NOTIFICATIONS]: 'WhatsApp appointment confirmations and reminders',
  [PlanFeature.CLINIC_DASHBOARD]: 'Clinic management dashboard',
  [PlanFeature.PATIENT_MANAGEMENT]: 'Patient records and history management',
  [PlanFeature.EMAIL_SUPPORT]: 'Email support',
  [PlanFeature.GOOGLE_BOOK_NOW]: 'Google My Business Book Now button integration',
  [PlanFeature.REVIEW_REMINDERS]: 'Automated WhatsApp review reminders',
  [PlanFeature.ANALYTICS]: 'Monthly analytics and reports',
  [PlanFeature.SECURE_PAYMENTS]: 'Secure online payment processing',
  [PlanFeature.TELECONSULTATION]: 'Video consultation via Twilio',
  [PlanFeature.PRIORITY_SUPPORT]: 'Priority customer support',
  [PlanFeature.MULTI_BRANCH]: 'Multi-branch clinic management',
  [PlanFeature.API_ACCESS]: 'API access for custom integrations',
  [PlanFeature.CUSTOM_INTEGRATIONS]: 'Custom integration support',
  [PlanFeature.DEDICATED_ACCOUNT_MANAGER]: 'Dedicated account manager',
  [PlanFeature.SLA_SUPPORT]: 'SLA-backed support',
  [PlanFeature.WHITE_LABEL]: 'White-label branding options',
};
