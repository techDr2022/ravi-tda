import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PRICING_PLANS } from '@/lib/constants';

/**
 * Get subscription status
 * GET /api/subscriptions/status?clinicId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinicId is required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { clinicId },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            trialEndsAt: true,
            subscriptionEndsAt: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Get plan details from PRICING_PLANS to ensure consistency
    const planDetails = PRICING_PLANS.find((p) => p.id === subscription.planId);
    
    return NextResponse.json({
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        planName: subscription.planName,
        planPrice: subscription.planPrice.toString(),
        billingPeriod: subscription.billingPeriod,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt?.toISOString(),
        currentPeriodStart: subscription.currentPeriodStart?.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
        subscriptionEndsAt: subscription.subscriptionEndsAt?.toISOString(),
        nextBillingDate: subscription.nextBillingDate?.toISOString(),
        cancelledAt: subscription.cancelledAt?.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        paymentFailureCount: subscription.paymentFailureCount,
        lastPaymentAt: subscription.lastPaymentAt?.toISOString(),
        clinic: subscription.clinic,
        // Include plan details for frontend use
        planDetails: planDetails ? {
          id: planDetails.id,
          name: planDetails.name,
          price: planDetails.price,
          period: planDetails.period,
          features: planDetails.features,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
