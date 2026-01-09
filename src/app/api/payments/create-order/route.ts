import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Cashfree API endpoints
const CASHFREE_API = {
  sandbox: 'https://sandbox.cashfree.com/pg/orders',
  production: 'https://api.cashfree.com/pg/orders',
};

/**
 * Create a Cashfree order
 * POST /api/payments/create-order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, planId, email, name, phone } = body;

    // Validate required fields
    if (!amount || !planId) {
      return NextResponse.json(
        { error: 'Amount and planId are required' },
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

    // Generate unique order ID
    const orderId = `order_${planId}_${Date.now()}`;

    // Create order via Cashfree API
    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: name || 'Customer',
        customer_email: email || 'customer@example.com',
        customer_phone: phone || '9999999999',
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?order_id={order_id}&plan=${planId}`,
        notify_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payments/webhook`,
      },
      order_note: `Subscription for ${planId} plan`,
    };

    const apiUrl = environment === 'production' 
      ? CASHFREE_API.production 
      : CASHFREE_API.sandbox;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cashfree order creation failed:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to create order' },
        { status: 500 }
      );
    }

    const order = await response.json();
    
    console.log('Cashfree order response:', JSON.stringify(order, null, 2));

    return NextResponse.json({
      orderId: order.order_id,
      orderToken: order.order_token, // For older SDK
      paymentSessionId: order.payment_session_id, // For newer SDK
      orderAmount: order.order_amount,
      orderCurrency: order.order_currency,
      environment: environment,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
