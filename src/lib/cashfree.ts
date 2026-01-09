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
 * Load Cashfree script dynamically
 * Returns a promise that resolves when the script is loaded
 */
export function loadCashfreeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && 'Cashfree' in window) {
      console.log('Cashfree SDK already loaded');
      resolve(true);
      return;
    }

    console.log('Loading Cashfree SDK...');
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      console.log('Cashfree SDK loaded successfully');
      resolve(true);
    };
    script.onerror = (error) => {
      console.error('Failed to load Cashfree SDK:', error);
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Create an order on the server
 */
export async function createOrder(
  amount: number,
  planId: string,
  email?: string,
  name?: string,
  phone?: string
): Promise<OrderResponse> {
  console.log('Creating order for plan:', planId, 'amount:', amount);
  
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      planId,
      email,
      name,
      phone,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Order creation failed:', data);
    throw new Error(data.error || 'Failed to create order');
  }

  console.log('Order created successfully:', data);
  return data;
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

  // Get plan details
  const plan = PRICING_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return { success: false, error: 'Invalid plan selected' };
  }

  // Create order on server
  let order: OrderResponse;
  try {
    order = await createOrder(
      plan.price,
      planId,
      userInfo?.email,
      userInfo?.name,
      userInfo?.phone
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
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
