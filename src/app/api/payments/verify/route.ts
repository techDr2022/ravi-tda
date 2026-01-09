import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Cashfree API endpoints
const CASHFREE_API = {
  sandbox: 'https://sandbox.cashfree.com/pg/orders',
  production: 'https://api.cashfree.com/pg/orders',
};

/**
 * Verify Cashfree payment
 * POST /api/payments/verify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, planId, email, name } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get Cashfree credentials from environment
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const environment = process.env.CASHFREE_ENVIRONMENT || 'sandbox';

    if (!appId || !secretKey) {
      console.error('Cashfree credentials not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Verify order status with Cashfree
    const apiUrl = environment === 'production'
      ? `${CASHFREE_API.production}/${orderId}`
      : `${CASHFREE_API.sandbox}/${orderId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cashfree order verification failed:', errorData);
      return NextResponse.json(
        { error: 'Payment verification failed', success: false },
        { status: 400 }
      );
    }

    const orderData = await response.json();

    // Check if payment is successful
    if (orderData.order_status === 'PAID') {
      // Payment is verified - Here you would typically:
      // 1. Update database with subscription details
      // 2. Create user account if new
      // 3. Send confirmation email
      // 4. Activate the subscription

      return NextResponse.json({
        success: true,
        orderId: orderData.order_id,
        orderStatus: orderData.order_status,
        orderAmount: orderData.order_amount,
        planId,
        email,
        name,
        message: 'Payment verified successfully',
      });
    } else {
      return NextResponse.json({
        success: false,
        orderId: orderData.order_id,
        orderStatus: orderData.order_status,
        error: `Payment status: ${orderData.order_status}`,
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

/**
 * Handle Cashfree webhook
 * This endpoint receives payment notifications from Cashfree
 */
export async function GET(request: NextRequest) {
  // For webhook signature verification
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
