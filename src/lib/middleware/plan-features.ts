/**
 * Plan Features Middleware
 * 
 * Server-side middleware for checking subscription plan features in API routes.
 * Use this to restrict API endpoints based on the clinic's subscription plan.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  PlanFeature,
  PlanFeatureType,
  planHasFeature,
  getUpgradeMessageForFeature,
} from '@/lib/plan-features';

/**
 * Get clinic's subscription plan ID
 */
export async function getClinicPlanId(clinicId: string): Promise<string> {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: {
        subscriptionPlan: true,
        subscription: {
          select: {
            planId: true,
            status: true,
          },
        },
      },
    });

    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Use subscription plan if available, otherwise use clinic's subscriptionPlan
    const planId = clinic.subscription?.planId || clinic.subscriptionPlan || 'basic';
    
    // Check if subscription is active (TRIAL or ACTIVE)
    const subscriptionStatus = clinic.subscription?.status;
    if (subscriptionStatus && subscriptionStatus !== 'TRIAL' && subscriptionStatus !== 'ACTIVE') {
      // If subscription is expired/cancelled, default to basic
      return 'basic';
    }

    return planId;
  } catch (error) {
    console.error('Error fetching clinic plan:', error);
    return 'basic'; // Default to basic on error
  }
}

/**
 * Check if clinic has access to a feature
 */
export async function clinicHasFeature(
  clinicId: string,
  feature: PlanFeatureType
): Promise<boolean> {
  const planId = await getClinicPlanId(clinicId);
  return planHasFeature(planId, feature);
}

/**
 * Middleware to check if clinic has access to a feature
 * Returns NextResponse with error if feature is not available
 */
export async function requirePlanFeature(
  clinicId: string,
  feature: PlanFeatureType,
  errorMessage?: string
): Promise<NextResponse | null> {
  const hasAccess = await clinicHasFeature(clinicId, feature);
  
  if (!hasAccess) {
    const planId = await getClinicPlanId(clinicId);
    const upgradeMessage = getUpgradeMessageForFeature(feature);
    
    return NextResponse.json(
      {
        error: errorMessage || 'This feature is not available in your current plan',
        feature,
        currentPlan: planId,
        upgradeMessage,
        requiresUpgrade: true,
      },
      { status: 403 }
    );
  }

  return null; // Feature is available
}

/**
 * Check if clinic has access to ALL specified features
 */
export async function requireAllPlanFeatures(
  clinicId: string,
  features: PlanFeatureType[]
): Promise<NextResponse | null> {
  for (const feature of features) {
    const error = await requirePlanFeature(clinicId, feature);
    if (error) {
      return error;
    }
  }
  return null;
}

/**
 * Check if clinic has access to ANY of the specified features
 */
export async function requireAnyPlanFeature(
  clinicId: string,
  features: PlanFeatureType[]
): Promise<NextResponse | null> {
  for (const feature of features) {
    const hasAccess = await clinicHasFeature(clinicId, feature);
    if (hasAccess) {
      return null; // At least one feature is available
    }
  }
  
  // None of the features are available
  const planId = await getClinicPlanId(clinicId);
  const upgradeMessages = features.map(f => getUpgradeMessageForFeature(f));
  
  return NextResponse.json(
    {
      error: 'None of the required features are available in your current plan',
      features,
      currentPlan: planId,
      upgradeMessages,
      requiresUpgrade: true,
    },
    { status: 403 }
  );
}

/**
 * Quick check helpers for common features
 */
export async function requireGoogleBookNow(clinicId: string): Promise<NextResponse | null> {
  return requirePlanFeature(clinicId, PlanFeature.GOOGLE_BOOK_NOW);
}

export async function requireAnalytics(clinicId: string): Promise<NextResponse | null> {
  return requirePlanFeature(clinicId, PlanFeature.ANALYTICS);
}

export async function requireTeleconsultation(clinicId: string): Promise<NextResponse | null> {
  return requirePlanFeature(clinicId, PlanFeature.TELECONSULTATION);
}

export async function requireMultiBranch(clinicId: string): Promise<NextResponse | null> {
  return requirePlanFeature(clinicId, PlanFeature.MULTI_BRANCH);
}

export async function requireApiAccess(clinicId: string): Promise<NextResponse | null> {
  return requirePlanFeature(clinicId, PlanFeature.API_ACCESS);
}

export async function requireReviewReminders(clinicId: string): Promise<NextResponse | null> {
  return requirePlanFeature(clinicId, PlanFeature.REVIEW_REMINDERS);
}

export async function requireSecurePayments(clinicId: string): Promise<NextResponse | null> {
  return requirePlanFeature(clinicId, PlanFeature.SECURE_PAYMENTS);
}
