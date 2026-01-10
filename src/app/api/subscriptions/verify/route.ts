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
 * Verify subscription payment status
 * POST /api/subscriptions/verify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, clinicId, planId } = body;

    // Validate required fields
    if (!subscriptionId && !clinicId) {
      return NextResponse.json(
        { error: 'subscriptionId or clinicId is required' },
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

    // Get subscription from database if clinicId provided
    let cashfreeSubscriptionId = subscriptionId;
    if (clinicId && !subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { clinicId },
      });

      if (!subscription || !subscription.cashfreeSubscriptionId) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      cashfreeSubscriptionId = subscription.cashfreeSubscriptionId;
    }

    // Verify subscription status with Cashfree
    const apiUrl =
      environment === 'production'
        ? CASHFREE_API.production.subscriptions
        : CASHFREE_API.sandbox.subscriptions;

    const response = await fetch(`${apiUrl}/${cashfreeSubscriptionId}`, {
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
      console.error('Cashfree subscription verification failed:', errorData);
      return NextResponse.json(
        { error: 'Subscription verification failed', success: false },
        { status: 400 }
      );
    }

    const subscriptionData = await response.json();

    // Check subscription status
    const isActive =
      subscriptionData.subscription_status === 'ACTIVE' ||
      subscriptionData.subscription_status === 'INITIALIZED';

    if (isActive) {
      // Update subscription in database if clinicId provided
      if (clinicId) {
        await prisma.subscription.updateMany({
          where: { clinicId },
          data: {
            status: subscriptionData.subscription_status === 'ACTIVE' ? 'ACTIVE' : 'TRIAL',
            currentPeriodStart: subscriptionData.current_period_start
              ? new Date(subscriptionData.current_period_start)
              : undefined,
            currentPeriodEnd: subscriptionData.current_period_end
              ? new Date(subscriptionData.current_period_end)
              : undefined,
            nextBillingDate: subscriptionData.next_charge_at
              ? new Date(subscriptionData.next_charge_at)
              : undefined,
          },
        });

        // Update clinic status
        await prisma.clinic.update({
          where: { id: clinicId },
          data: {
            subscriptionStatus:
              subscriptionData.subscription_status === 'ACTIVE' ? 'ACTIVE' : 'TRIAL',
          },
        });
      }

      return NextResponse.json({
        success: true,
        subscriptionId: subscriptionData.subscription_id,
        subscriptionStatus: subscriptionData.subscription_status,
        planId,
        message: 'Subscription verified successfully',
      });
    } else {
      return NextResponse.json({
        success: false,
        subscriptionId: subscriptionData.subscription_id,
        subscriptionStatus: subscriptionData.subscription_status,
        error: `Subscription status: ${subscriptionData.subscription_status}`,
      });
    }
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
