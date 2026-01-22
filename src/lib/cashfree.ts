/**
 * Cashfree Client-Side Integration
 * Handles loading the Cashfree SDK and checkout functionality
 */

import { PRICING_PLANS } from './constants';

// Cashfree SDK type declarations
declare global {
  interface Window {
    Cashfree: (options: { mode: 'sandbox' | 'production' }) => CashfreeInstance;
  }
}

export interface CashfreeInstance {
  checkout: (options: CashfreeCheckoutOptions) => Promise<CashfreeCheckoutResult>;
}

export interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  redirectTarget?: '_self' | '_blank' | '_modal';
}

export interface CashfreeCheckoutResult {
  error?: {
    message: string;
  };
  redirect?: boolean;
  paymentDetails?: {
    paymentMessage: string;
  };
}

export interface OrderResponse {
  orderId: string;
  orderToken?: string;
  paymentSessionId: string;
  orderAmount: number;
  orderCurrency: string;
  environment: string;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Load Cashfree script dynamically with optimized caching
 * Returns a promise that resolves when the script is loaded
 * 
 * Optimization: Uses cache-friendly approach with crossOrigin for better caching
 */
export function loadCashfreeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && 'Cashfree' in window) {
      console.log('Cashfree SDK already loaded');
      resolve(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="cashfree.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    console.log('Loading Cashfree SDK...');
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.defer = false; // Keep async for non-blocking load
    script.crossOrigin = 'anonymous'; // Enable CORS for better caching
    script.integrity = ''; // Will be empty, but crossOrigin helps with caching
    
    // Add cache-friendly attributes for better browser caching
    script.setAttribute('data-cache', 'true');
    
    script.onload = () => {
      console.log('Cashfree SDK loaded successfully');
      resolve(true);
    };
    script.onerror = (error) => {
      console.error('Failed to load Cashfree SDK:', error);
      resolve(false);
    };
    
    // Append to head instead of body for better loading control
    document.head.appendChild(script);
  });
}

/**
 * Create a subscription on the server
 * NOTE: This now creates subscriptions instead of one-time orders
 */
export async function createSubscription(
  planId: string,
  clinicId: string,
  email?: string,
  name?: string,
  phone?: string
): Promise<OrderResponse> {
  console.log('Creating subscription for plan:', planId, 'clinic:', clinicId);
  
  const response = await fetch('/api/subscriptions/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      planId,
      clinicId,
      email,
      name,
      phone,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Subscription creation failed:', data);
    throw new Error(data.error || 'Failed to create subscription');
  }

  console.log('Subscription created successfully:', data);
  
  // Map subscription response to OrderResponse format for compatibility
  return {
    orderId: data.subscriptionId,
    orderToken: data.subscriptionToken,
    paymentSessionId: data.paymentSessionId,
    orderAmount: data.amount,
    orderCurrency: 'INR',
    environment: data.environment,
  };
}

/**
 * Create an order on the server (DEPRECATED - Use createSubscription instead)
 * Kept for backward compatibility with existing code
 */
export async function createOrder(
  amount: number,
  planId: string,
  email?: string,
  name?: string,
  phone?: string
): Promise<OrderResponse> {
  console.warn('createOrder is deprecated. Use createSubscription with clinicId instead.');
  
  // For backward compatibility, you might want to create a temporary clinic or handle this differently
  // This is a placeholder - adjust based on your requirements
  const clinicId = `temp_clinic_${Date.now()}`;
  
  return createSubscription(planId, clinicId, email, name, phone);
}

/**
 * Verify payment on the server
 */
export async function verifyPayment(
  orderId: string,
  planId: string,
  email?: string,
  name?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const verifyResponse = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId,
      planId,
      email,
      name,
    }),
  });

  return verifyResponse.json();
}

/**
 * Initialize Cashfree checkout
 * @param planId - The selected plan ID
 * @param userInfo - Optional user information for prefill
 * @returns Promise with payment result
 */
export async function initializeCashfreeCheckout(
  planId: string,
  userInfo?: { name?: string; email?: string; phone?: string }
): Promise<PaymentResult> {
  console.log('Initializing Cashfree checkout for plan:', planId);
  
  // Load Cashfree script if not already loaded
  const scriptLoaded = await loadCashfreeScript();
  if (!scriptLoaded) {
    console.error('Cashfree SDK failed to load');
    return { success: false, error: 'Failed to load payment gateway' };
  }

  // Check if Cashfree is available
  if (typeof window.Cashfree !== 'function') {
    console.error('Cashfree SDK not available as function');
    return { success: false, error: 'Payment gateway not initialized properly' };
  }

  // Get plan details and validate
  const plan = PRICING_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return { success: false, error: `Invalid plan selected. Available plans: ${PRICING_PLANS.filter(p => !p.contactUs && p.price !== null).map(p => p.name).join(', ')}` };
  }

  // If Enterprise plan (contactUs), redirect to contact page
  if (plan.contactUs || plan.price === null) {
    window.location.href = '/contact';
    return { success: false, error: 'Enterprise plan requires contacting sales' };
  }

  // Validate plan has valid price
  if (typeof plan.price !== 'number' || plan.price <= 0) {
    return { success: false, error: 'Invalid pricing for selected plan' };
  }

  // Get clinicId from userInfo - it should be passed from the component
  const clinicId = (userInfo as any)?.clinicId;

  // If no clinicId, we need to create a clinic first or handle it differently
  // For new users, clinic will be created during onboarding after subscription
  // For now, we'll require clinicId to be passed, but you might want to create a temporary clinic
  if (!clinicId) {
    console.warn('No clinicId provided. For new subscriptions, clinic will be created after payment.');
    // For new users signing up, redirect to signup page with plan selection
    const signupUrl = `/signup?plan=${planId}`;
    window.location.href = signupUrl;
    return {
      success: false,
      error: 'Please complete signup first. Redirecting...',
    };
  }

  // Create subscription on server
  let order: OrderResponse;
  try {
    order = await createSubscription(
      planId,
      clinicId,
      userInfo?.email,
      userInfo?.name,
      userInfo?.phone
    );
  } catch (error) {
    console.error('Subscription creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subscription',
    };
  }

  // Check if payment session ID exists
  if (!order.paymentSessionId) {
    console.error('No payment session ID received');
    return { success: false, error: 'Payment session not created' };
  }

  console.log('Opening Cashfree checkout with session:', order.paymentSessionId);

  // Initialize Cashfree SDK
  const cashfreeMode = order.environment === 'production' ? 'production' : 'sandbox';
  
  try {
    const cashfree = window.Cashfree({ mode: cashfreeMode });
    
    // Open checkout
    const result = await cashfree.checkout({
      paymentSessionId: order.paymentSessionId,
      redirectTarget: '_modal',
    });

    console.log('Checkout result:', result);

    if (result.error) {
      console.error('Checkout error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Payment failed',
      };
    }

    if (result.redirect) {
      // Payment is being processed via redirect
      return {
        success: true,
        orderId: order.orderId,
      };
    }

    // Verify payment status
    try {
      const verification = await verifyPayment(
        order.orderId,
        planId,
        userInfo?.email,
        userInfo?.name
      );

      if (verification.success) {
        return {
          success: true,
          orderId: order.orderId,
        };
      } else {
        return {
          success: false,
          error: verification.error || 'Payment verification failed',
        };
      }
    } catch (error) {
      console.error('Verification error:', error);
      return {
        success: false,
        error: 'Payment verification failed',
      };
    }
  } catch (error) {
    console.error('Cashfree checkout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment checkout failed',
    };
  }
}

/**
 * Format amount for display
 * @param amount - Amount in rupees
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get plan details by ID
 */
export function getPlanById(planId: string) {
  return PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[1];
}
