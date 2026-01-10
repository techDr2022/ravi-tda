/**
 * Subscription Service
 * Client-side functions for managing subscriptions
 */

export interface SubscriptionResponse {
  subscriptionId: string;
  subscriptionToken: string;
  paymentSessionId: string;
  planId: string;
  planName: string;
  amount: number;
  billingPeriod: string;
  environment: string;
  trialEndsAt: string;
  subscriptionEndsAt: string;
}

export interface SubscriptionStatus {
  id: string;
  planId: string;
  planName: string;
  planPrice: string;
  billingPeriod: string;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  subscriptionEndsAt?: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  cancelAtPeriodEnd: boolean;
  paymentFailureCount: number;
  lastPaymentAt?: string;
  clinic: {
    id: string;
    name: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
  };
}

/**
 * Create a subscription
 */
export async function createSubscription(
  planId: string,
  clinicId: string,
  userInfo?: { name?: string; email?: string; phone?: string }
): Promise<SubscriptionResponse> {
  console.log('Creating subscription for plan:', planId, 'clinic:', clinicId);

  const response = await fetch('/api/subscriptions/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      planId,
      clinicId,
      email: userInfo?.email,
      name: userInfo?.name,
      phone: userInfo?.phone,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Subscription creation failed:', data);
    throw new Error(data.error || 'Failed to create subscription');
  }

  console.log('Subscription created successfully:', data);
  return data;
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(
  clinicId: string
): Promise<SubscriptionStatus> {
  const response = await fetch(`/api/subscriptions/status?clinicId=${clinicId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Failed to fetch subscription status:', data);
    throw new Error(data.error || 'Failed to fetch subscription status');
  }

  return data.subscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  clinicId: string,
  cancelAtPeriodEnd = false,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/subscriptions/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clinicId,
      cancelAtPeriodEnd,
      reason,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Failed to cancel subscription:', data);
    throw new Error(data.error || 'Failed to cancel subscription');
  }

  return data;
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    TRIAL: 'Trial',
    ACTIVE: 'Active',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
  };
  return statusMap[status] || status;
}

/**
 * Check if subscription is active (trial or paid)
 */
export function isSubscriptionActive(status: string): boolean {
  return status === 'TRIAL' || status === 'ACTIVE';
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(trialEndsAt?: string): number {
  if (!trialEndsAt) return 0;
  const endDate = new Date(trialEndsAt);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
