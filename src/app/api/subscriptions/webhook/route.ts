import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Force dynamic rendering for webhook endpoints
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Cashfree API endpoints
const CASHFREE_API = {
  sandbox: {
    subscriptions: 'https://sandbox.cashfree.com/pg/subscriptions',
  },
  production: {
    subscriptions: 'https://api.cashfree.com/pg/subscriptions',
  },
};

/**
 * Verify webhook signature from Cashfree
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  try {
    const computedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');
    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Handle webhook health checks (GET requests from Cashfree)
 * GET /api/subscriptions/webhook
 */
export async function GET(request: NextRequest) {
  try {
    // Return a success response for webhook endpoint health checks
    // Cashfree tests the endpoint with GET request during configuration
    return NextResponse.json(
      {
        status: 'active',
        endpoint: '/api/subscriptions/webhook',
        environment: process.env.CASHFREE_ENVIRONMENT || 'sandbox',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error in webhook health check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle Cashfree subscription webhooks
 * POST /api/subscriptions/webhook
 * 
 * Webhook events:
 * - SUBSCRIPTION_ACTIVATED: Subscription activated after payment
 * - SUBSCRIPTION_CHARGED: Successful recurring payment
 * - SUBSCRIPTION_CHARGE_FAILED: Payment failed
 * - SUBSCRIPTION_CANCELLED: Subscription cancelled
 * - SUBSCRIPTION_PAUSED: Subscription paused
 * - SUBSCRIPTION_RESUMED: Subscription resumed
 * - SUBSCRIPTION_COMPLETED: Subscription completed (all cycles done)
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Handle empty body (some test requests may have empty body)
    if (!rawBody || rawBody.trim() === '') {
      console.log('Received empty webhook body, responding with OK');
      return NextResponse.json(
        { status: 'ok', message: 'Webhook endpoint is active' },
        { status: 200 }
      );
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Invalid JSON in webhook body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const signature = request.headers.get('x-webhook-signature') || 
                     request.headers.get('x-cf-signature') || 
                     request.headers.get('x-webhook-signature-2') || '';

    // Get Cashfree secret key for signature verification
    const secretKey = process.env.CASHFREE_SECRET_KEY || '';
    const environment = process.env.CASHFREE_ENVIRONMENT || 'sandbox';

    // Log webhook receipt for debugging
    console.log('Webhook received:', {
      headers: {
        'x-webhook-signature': signature ? 'present' : 'missing',
        'content-type': request.headers.get('content-type'),
      },
      bodyKeys: Object.keys(body),
    });

    // Verify webhook signature (optional but recommended for production)
    // Uncomment in production when webhook signature is configured:
    // if (secretKey && signature && !verifyWebhookSignature(rawBody, signature, secretKey)) {
    //   console.error('Invalid webhook signature');
    //   return NextResponse.json(
    //     { error: 'Invalid signature' },
    //     { status: 401 }
    //   );
    // }

    // Handle test webhook events from Cashfree
    if (body.type === 'TEST' || body.event === 'test' || body.test === true) {
      console.log('Received test webhook from Cashfree');
      return NextResponse.json(
        { 
          status: 'ok', 
          message: 'Test webhook received successfully',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    const { type, event, data } = body;
    const eventType = type || event;

    if (!eventType) {
      console.log('Webhook received without type/event, responding with OK');
      return NextResponse.json(
        { status: 'ok', message: 'Webhook received' },
        { status: 200 }
      );
    }

    console.log('Received webhook event:', eventType, JSON.stringify(data || body, null, 2));

    // Handle different webhook event types
    switch (eventType) {
      case 'SUBSCRIPTION_ACTIVATED':
      case 'subscription.activated':
        await handleSubscriptionActivated(data || body);
        break;

      case 'SUBSCRIPTION_CHARGED':
      case 'subscription.charged':
        await handleSubscriptionCharged(data || body);
        break;

      case 'SUBSCRIPTION_CHARGE_FAILED':
      case 'subscription.charge_failed':
        await handleSubscriptionChargeFailed(data || body);
        break;

      case 'SUBSCRIPTION_CANCELLED':
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data || body);
        break;

      case 'SUBSCRIPTION_PAUSED':
      case 'subscription.paused':
        await handleSubscriptionPaused(data || body);
        break;

      case 'SUBSCRIPTION_RESUMED':
      case 'subscription.resumed':
        await handleSubscriptionResumed(data || body);
        break;

      case 'SUBSCRIPTION_COMPLETED':
      case 'subscription.completed':
        await handleSubscriptionCompleted(data || body);
        break;

      default:
        console.log('Unhandled webhook type:', eventType);
        // Still return success to acknowledge receipt
    }

    // Always return 200 OK to acknowledge webhook receipt
    // Cashfree will retry if non-2xx response is returned
    return NextResponse.json(
      { 
        received: true,
        status: 'ok',
        event: eventType,
        timestamp: new Date().toISOString(),
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Return 200 to prevent Cashfree from retrying, but log the error
    // In production, you might want to return 500 to trigger retries for transient errors
    return NextResponse.json(
      { 
        error: 'Internal server error',
        received: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription activation after initial payment
 */
async function handleSubscriptionActivated(data: any) {
  try {
    const { subscription, payment } = data;

    if (!subscription || !subscription.id) {
      console.error('Invalid subscription data in webhook:', data);
      return;
    }

    // Find subscription by Cashfree subscription ID
    const dbSubscription = await prisma.subscription.findUnique({
      where: { cashfreeSubscriptionId: subscription.id },
      include: { clinic: true },
    });

    if (!dbSubscription) {
      console.error('Subscription not found in database:', subscription.id);
      return;
    }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'ACTIVE',
      startsAt: new Date(subscription.created_at),
      currentPeriodStart: new Date(subscription.current_period_start),
      currentPeriodEnd: new Date(subscription.current_period_end),
      nextBillingDate: new Date(subscription.next_charge_at || subscription.current_period_end),
      lastPaymentId: payment?.id,
      lastPaymentAt: payment?.created_at ? new Date(payment.created_at) : new Date(),
      paymentFailureCount: 0,
    },
  });

  // Update clinic subscription status
  await prisma.clinic.update({
    where: { id: dbSubscription.clinicId },
    data: {
      subscriptionStatus: 'ACTIVE',
    },
  });

    console.log('Subscription activated:', dbSubscription.id);
  } catch (error) {
    console.error('Error handling subscription activation:', error);
    // Don't throw - allow webhook to return success
  }
}

/**
 * Handle successful recurring payment
 */
async function handleSubscriptionCharged(data: any) {
  const { subscription, payment } = data;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { cashfreeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    console.error('Subscription not found:', subscription.id);
    return;
  }

  // Update subscription with new billing period
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start),
      currentPeriodEnd: new Date(subscription.current_period_end),
      nextBillingDate: new Date(subscription.next_charge_at || subscription.current_period_end),
      lastPaymentId: payment?.id,
      lastPaymentAt: payment?.created_at ? new Date(payment.created_at) : new Date(),
      paymentFailureCount: 0,
      lastPaymentFailureAt: null,
    },
  });

  // Update clinic subscription end date
  await prisma.clinic.update({
    where: { id: dbSubscription.clinicId },
    data: {
      subscriptionStatus: 'ACTIVE',
      subscriptionEndsAt: new Date(subscription.current_period_end),
    },
  });

  console.log('Subscription charged successfully:', dbSubscription.id);
}

/**
 * Handle failed payment
 */
async function handleSubscriptionChargeFailed(data: any) {
  const { subscription, payment } = data;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { cashfreeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    console.error('Subscription not found:', subscription.id);
    return;
  }

  // Increment payment failure count
  const newFailureCount = dbSubscription.paymentFailureCount + 1;

  // Update subscription
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      paymentFailureCount: newFailureCount,
      lastPaymentFailureAt: new Date(),
      // Update status based on failure count
      // You might want to pause/expire after multiple failures
      status: newFailureCount >= 3 ? 'EXPIRED' : dbSubscription.status,
    },
  });

  // If too many failures, update clinic status
  if (newFailureCount >= 3) {
    await prisma.clinic.update({
      where: { id: dbSubscription.clinicId },
      data: {
        subscriptionStatus: 'EXPIRED',
      },
    });
  }

  console.log('Subscription charge failed:', dbSubscription.id, 'Failures:', newFailureCount);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(data: any) {
  const { subscription } = data;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { cashfreeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    console.error('Subscription not found:', subscription.id);
    return;
  }

  // Update subscription
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelAtPeriodEnd: false,
    },
  });

  // Update clinic status
  await prisma.clinic.update({
    where: { id: dbSubscription.clinicId },
    data: {
      subscriptionStatus: 'CANCELLED',
    },
  });

  console.log('Subscription cancelled:', dbSubscription.id);
}

/**
 * Handle subscription paused
 */
async function handleSubscriptionPaused(data: any) {
  const { subscription } = data;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { cashfreeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    console.error('Subscription not found:', subscription.id);
    return;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'CANCELLED', // Or add PAUSED status if needed
    },
  });

  console.log('Subscription paused:', dbSubscription.id);
}

/**
 * Handle subscription resumed
 */
async function handleSubscriptionResumed(data: any) {
  const { subscription } = data;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { cashfreeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    console.error('Subscription not found:', subscription.id);
    return;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'ACTIVE',
    },
  });

  await prisma.clinic.update({
    where: { id: dbSubscription.clinicId },
    data: {
      subscriptionStatus: 'ACTIVE',
    },
  });

  console.log('Subscription resumed:', dbSubscription.id);
}

/**
 * Handle subscription completed
 */
async function handleSubscriptionCompleted(data: any) {
  const { subscription } = data;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { cashfreeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    console.error('Subscription not found:', subscription.id);
    return;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'EXPIRED',
    },
  });

  await prisma.clinic.update({
    where: { id: dbSubscription.clinicId },
    data: {
      subscriptionStatus: 'EXPIRED',
    },
  });

  console.log('Subscription completed:', dbSubscription.id);
}
