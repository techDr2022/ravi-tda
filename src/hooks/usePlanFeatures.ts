'use client';

/**
 * usePlanFeatures Hook
 * 
 * Client-side plan feature checking based on clinic's subscription plan.
 * IMPORTANT: This is for UI display purposes only.
 * Backend always enforces plan features - never rely solely on frontend hiding.
 */

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
  PlanFeature,
  PlanFeatureType,
  planHasFeature,
  planHasAllFeatures,
  planHasAnyFeature,
  getPlanFeatures,
  getPlanMissingFeatures,
  planSupportsGoogleBookNow,
  planSupportsAnalytics,
  planSupportsTeleconsultation,
  planSupportsMultiBranch,
  planSupportsApiAccess,
  planSupportsReviewReminders,
  planSupportsSecurePayments,
  getUpgradeMessageForFeature,
  canUpgradeForFeature,
} from '@/lib/plan-features';
import { getSubscriptionStatus } from '@/lib/subscription-service';

export interface UsePlanFeaturesReturn {
  // Loading state
  isLoading: boolean;
  
  // Plan info
  planId: string | undefined;
  planName: string | undefined;
  subscriptionStatus: string | undefined;
  
  // Feature checks
  hasFeature: (feature: PlanFeatureType) => boolean;
  hasAllFeatures: (features: PlanFeatureType[]) => boolean;
  hasAnyFeature: (features: PlanFeatureType[]) => boolean;
  
  // Quick feature checks
  supportsGoogleBookNow: boolean;
  supportsAnalytics: boolean;
  supportsTeleconsultation: boolean;
  supportsMultiBranch: boolean;
  supportsApiAccess: boolean;
  supportsReviewReminders: boolean;
  supportsSecurePayments: boolean;
  
  // Plan info
  availableFeatures: PlanFeatureType[];
  missingFeatures: PlanFeatureType[];
  
  // Upgrade helpers
  getUpgradeMessage: (feature: PlanFeatureType) => string;
  canUpgrade: (feature: PlanFeatureType) => boolean;
  
  // Helper to check if feature should be shown
  shouldShow: (feature: PlanFeatureType) => boolean;
}

export function usePlanFeatures(): UsePlanFeaturesReturn {
  const { data: session, status } = useSession();
  const [planId, setPlanId] = useState<string | undefined>(undefined);
  const [planName, setPlanName] = useState<string | undefined>(undefined);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user?.clinicId) {
        setIsLoading(false);
        return;
      }

      try {
        const subscription = await getSubscriptionStatus(session.user.clinicId);
        setPlanId(subscription.planId);
        setPlanName(subscription.planName);
        setSubscriptionStatus(subscription.status);
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
        // Default to basic plan if subscription fetch fails
        setPlanId('basic');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSubscription();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [session, status]);

  // Get plan ID from session or subscription
  const currentPlanId = planId || session?.user?.clinicId ? 'basic' : undefined;

  // Feature check functions
  const hasFeature = (feature: PlanFeatureType): boolean => {
    if (!currentPlanId) return false;
    return planHasFeature(currentPlanId, feature);
  };

  const hasAllFeatures = (features: PlanFeatureType[]): boolean => {
    if (!currentPlanId) return false;
    return planHasAllFeatures(currentPlanId, features);
  };

  const hasAnyFeature = (features: PlanFeatureType[]): boolean => {
    if (!currentPlanId) return false;
    return planHasAnyFeature(currentPlanId, features);
  };

  // Quick feature checks
  const supportsGoogleBookNow = currentPlanId ? planSupportsGoogleBookNow(currentPlanId) : false;
  const supportsAnalytics = currentPlanId ? planSupportsAnalytics(currentPlanId) : false;
  const supportsTeleconsultation = currentPlanId ? planSupportsTeleconsultation(currentPlanId) : false;
  const supportsMultiBranch = currentPlanId ? planSupportsMultiBranch(currentPlanId) : false;
  const supportsApiAccess = currentPlanId ? planSupportsApiAccess(currentPlanId) : false;
  const supportsReviewReminders = currentPlanId ? planSupportsReviewReminders(currentPlanId) : false;
  const supportsSecurePayments = currentPlanId ? planSupportsSecurePayments(currentPlanId) : false;

  // Plan info
  const availableFeatures = currentPlanId ? getPlanFeatures(currentPlanId) : [];
  const missingFeatures = currentPlanId ? getPlanMissingFeatures(currentPlanId) : [];

  // Upgrade helpers
  const getUpgradeMessage = (feature: PlanFeatureType): string => {
    if (!currentPlanId) return 'Please subscribe to access this feature.';
    return getUpgradeMessageForFeature(feature);
  };

  const canUpgrade = (feature: PlanFeatureType): boolean => {
    if (!currentPlanId) return true; // Can subscribe if no plan
    return canUpgradeForFeature(currentPlanId, feature);
  };

  // UI helper - same as `hasFeature` but more semantic
  const shouldShow = (feature: PlanFeatureType): boolean => hasFeature(feature);

  return {
    isLoading: isLoading || status === 'loading',
    planId: currentPlanId,
    planName,
    subscriptionStatus,
    hasFeature,
    hasAllFeatures,
    hasAnyFeature,
    supportsGoogleBookNow,
    supportsAnalytics,
    supportsTeleconsultation,
    supportsMultiBranch,
    supportsApiAccess,
    supportsReviewReminders,
    supportsSecurePayments,
    availableFeatures,
    missingFeatures,
    getUpgradeMessage,
    canUpgrade,
    shouldShow,
  };
}

// Re-export PlanFeature for convenience
export { PlanFeature };
