import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PRICING_PLANS } from '@/lib/constants';

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
 * Create a Cashfree subscription
 * POST /api/subscriptions/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, clinicId, email, name, phone } = body;

    // Validate required fields
    if (!planId || !clinicId) {
      return NextResponse.json(
        { error: 'planId and clinicId are required' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan || !plan.price) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Check if clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Check if clinic already has an active subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { clinicId },
    });

    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Clinic already has an active subscription' },
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

    // Calculate billing period details
    const billingPeriod = plan.period || 'year';
    const subscriptionAmount = plan.price;
    
    // Calculate trial period end (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    
    // Calculate subscription period end
    const subscriptionEndsAt = new Date();
    if (billingPeriod === 'year') {
      subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);
    } else {
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
    }

    // Create subscription in Cashfree
    const subscriptionData = {
      subscription_id: `sub_${clinicId}_${Date.now()}`,
      customer_details: {
        customer_id: `cust_${clinicId}`,
        customer_name: name || clinic.name || 'Clinic Owner',
        customer_email: email || clinic.email || 'clinic@example.com',
        customer_phone: phone || clinic.phone || '9999999999',
      },
      subscription_plan: {
        plan_id: planId,
        plan_name: plan.name,
        type: 'PERIODIC', // PERIODIC for recurring subscriptions
        amount: subscriptionAmount,
        interval_type: billingPeriod === 'year' ? 'YEAR' : 'MONTH',
        intervals: 1,
      },
      subscription_meta: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?subscription_id={subscription_id}&plan=${planId}`,
        notify_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/subscriptions/webhook`,
      },
      expires_after: billingPeriod === 'year' ? 365 : 30, // Days until expiry
    };

    const apiUrl = environment === 'production'
      ? CASHFREE_API.production.subscriptions
      : CASHFREE_API.sandbox.subscriptions;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cashfree subscription creation failed:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to create subscription' },
        { status: 500 }
      );
    }

    const cashfreeSubscription = await response.json();

    // Create subscription record in database
    const subscription = await prisma.subscription.upsert({
      where: { clinicId },
      create: {
        clinicId,
        planId,
        planName: plan.name,
        planPrice: subscriptionAmount,
        billingPeriod,
        cashfreeSubscriptionId: cashfreeSubscription.subscription_id,
        cashfreeSubscriptionToken: cashfreeSubscription.subscription_token,
        status: 'TRIAL',
        trialEndsAt,
        trialDays: 14,
        startsAt: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: subscriptionEndsAt,
        subscriptionEndsAt,
        nextBillingDate: subscriptionEndsAt,
      },
      update: {
        planId,
        planName: plan.name,
        planPrice: subscriptionAmount,
        billingPeriod,
        cashfreeSubscriptionId: cashfreeSubscription.subscription_id,
        cashfreeSubscriptionToken: cashfreeSubscription.subscription_token,
        status: 'TRIAL',
        trialEndsAt,
        trialDays: 14,
        currentPeriodStart: new Date(),
        currentPeriodEnd: subscriptionEndsAt,
        subscriptionEndsAt,
        nextBillingDate: subscriptionEndsAt,
        cancelledAt: null,
        cancelAtPeriodEnd: false,
      },
    });

    // Update clinic subscription status
    await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        subscriptionPlan: planId,
        subscriptionStatus: 'TRIAL',
        trialEndsAt,
        subscriptionEndsAt,
      },
    });

    console.log('Subscription created successfully:', subscription.id);

    return NextResponse.json({
      subscriptionId: cashfreeSubscription.subscription_id,
      subscriptionToken: cashfreeSubscription.subscription_token,
      paymentSessionId: cashfreeSubscription.payment_session_id,
      planId,
      planName: plan.name,
      amount: subscriptionAmount,
      billingPeriod,
      environment,
      trialEndsAt: trialEndsAt.toISOString(),
      subscriptionEndsAt: subscriptionEndsAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
