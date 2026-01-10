import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
 * Cancel subscription
 * POST /api/subscriptions/cancel
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clinicId, cancelAtPeriodEnd = false, reason } = body;

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinicId is required' },
        { status: 400 }
      );
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { clinicId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (!subscription.cashfreeSubscriptionId) {
      return NextResponse.json(
        { error: 'Cashfree subscription ID not found' },
        { status: 400 }
      );
    }

    // Get Cashfree credentials
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const environment = process.env.CASHFREE_ENVIRONMENT || 'sandbox';

    if (!appId || !secretKey) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Cancel subscription in Cashfree
    const apiUrl =
      environment === 'production'
        ? CASHFREE_API.production.subscriptions
        : CASHFREE_API.sandbox.subscriptions;

    const cancelUrl = `${apiUrl}/${subscription.cashfreeSubscriptionId}/cancel`;

    const response = await fetch(cancelUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify({
        cancellation_reason: reason || 'Customer requested cancellation',
        cancel_at_period_end: cancelAtPeriodEnd,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cashfree cancellation failed:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to cancel subscription' },
        { status: 500 }
      );
    }

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelledAt: cancelAtPeriodEnd ? null : new Date(),
        cancelAtPeriodEnd,
        cancellationReason: reason,
        status: cancelAtPeriodEnd ? subscription.status : 'CANCELLED',
      },
    });

    // Update clinic status
    await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        subscriptionStatus: cancelAtPeriodEnd ? subscription.status : 'CANCELLED',
      },
    });

    return NextResponse.json({
      success: true,
      message: cancelAtPeriodEnd
        ? 'Subscription will be cancelled at the end of the billing period'
        : 'Subscription cancelled successfully',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancelledAt: updatedSubscription.cancelledAt?.toISOString(),
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      },
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
