/**
 * Razorpay Client-Side Integration
 * Handles loading the Razorpay SDK and checkout functionality
 */

import { PRICING_PLANS } from './constants';

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  currency: 'INR',
  name: 'TDAppointments',
  description: 'Healthcare Appointment Booking Subscription',
  image: '/favicon.png',
  theme: {
    color: '#008080',
  },
};

// Razorpay SDK type declarations
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
    confirm_close?: boolean;
  };
}

export interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, callback: (response: RazorpayFailureResponse) => void) => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id?: string;
    };
  };
}

export interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

/**
 * Load Razorpay script dynamically
 * Returns a promise that resolves when the script is loaded
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
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
  name?: string
): Promise<OrderResponse> {
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
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json();
}

/**
 * Verify payment on the server
 */
export async function verifyPayment(
  response: RazorpayResponse,
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
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      planId,
      email,
      name,
    }),
  });

  return verifyResponse.json();
}

/**
 * Initialize Razorpay checkout
 * @param planId - The selected plan ID
 * @param userInfo - Optional user information for prefill
 * @returns Promise with payment result
 */
export async function initializeRazorpayCheckout(
  planId: string,
  userInfo?: { name?: string; email?: string; contact?: string }
): Promise<PaymentResult> {
  // Load Razorpay script if not already loaded
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    return { success: false, error: 'Failed to load payment gateway' };
  }

  // Get plan details
  const plan = PRICING_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return { success: false, error: 'Invalid plan selected' };
  }

  // Create order on server
  let order: OrderResponse;
  try {
    order = await createOrder(plan.price, planId, userInfo?.email, userInfo?.name);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }

  // Return a promise that resolves when payment is complete
  return new Promise((resolve) => {
    const options: RazorpayOptions = {
      key: RAZORPAY_CONFIG.key_id,
      amount: order.amount,
      currency: order.currency,
      name: RAZORPAY_CONFIG.name,
      description: `${plan.name} Plan - ${RAZORPAY_CONFIG.description}`,
      image: RAZORPAY_CONFIG.image,
      order_id: order.id,
      handler: async (response: RazorpayResponse) => {
        // Verify payment on server
        try {
          const verification = await verifyPayment(
            response,
            planId,
            userInfo?.email,
            userInfo?.name
          );

          if (verification.success) {
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            });
          } else {
            resolve({
              success: false,
              error: verification.error || 'Payment verification failed',
            });
          }
        } catch {
          resolve({
            success: false,
            error: 'Payment verification failed',
          });
        }
      },
      prefill: {
        name: userInfo?.name || '',
        email: userInfo?.email || '',
        contact: userInfo?.contact || '',
      },
      notes: {
        planId: planId,
        planName: plan.name,
      },
      theme: RAZORPAY_CONFIG.theme,
      modal: {
        ondismiss: () => {
          resolve({ success: false, error: 'Payment cancelled' });
        },
        escape: true,
        backdropclose: false,
        confirm_close: true,
      },
    };

    const razorpay = new window.Razorpay(options);

    // Handle payment failure
    razorpay.on('payment.failed', (response: RazorpayFailureResponse) => {
      resolve({
        success: false,
        error: response.error.description || 'Payment failed',
      });
    });

    razorpay.open();
  });
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
  return PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[1]; // Default to Professional
}
