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

    // Get plan details - validate against PRICING_PLANS
    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { error: `Invalid plan selected. Available plans: ${PRICING_PLANS.map(p => p.id).join(', ')}` },
        { status: 400 }
      );
    }

    // Enterprise plan requires contact, not direct subscription
    if (plan.contactUs || plan.price === null) {
      return NextResponse.json(
        { error: 'Enterprise plan requires contacting sales. Please use the Contact Sales option.' },
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

    // Check if clinic already has an active or trial subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { clinicId },
    });

    // Allow subscription if:
    // 1. No subscription exists
    // 2. Existing subscription is EXPIRED or CANCELLED
    // 3. Existing subscription is TRIAL and user wants to upgrade/downgrade
    if (existingSubscription) {
      if (existingSubscription.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'Clinic already has an active subscription. Please cancel the current subscription before creating a new one.' },
          { status: 400 }
        );
      }
      // If TRIAL, allow plan change (upgrade/downgrade)
      if (existingSubscription.status === 'TRIAL' && existingSubscription.planId === planId) {
        return NextResponse.json(
          { error: 'You already have a trial subscription for this plan.' },
          { status: 400 }
        );
      }
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

    // Calculate billing period details from plan
    const billingPeriod = plan.period || 'year';
    const subscriptionAmount = Number(plan.price); // Ensure it's a number
    
    // Validate subscription amount
    if (isNaN(subscriptionAmount) || subscriptionAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid subscription amount for selected plan' },
        { status: 400 }
      );
    }
    
    // Calculate trial period end (14 days from now)
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    
    // Calculate subscription period end (after trial + billing period)
    const subscriptionEndsAt = new Date(trialEndsAt);
    if (billingPeriod === 'year') {
      subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);
    } else {
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
    }
    
    // Next billing date is after trial ends
    const nextBillingDate = new Date(trialEndsAt);

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
        plan_id: `plan_${planId}_${billingPeriod}`, // Unique plan ID for Cashfree
        plan_name: `${plan.name} Plan (${billingPeriod === 'year' ? 'Annual' : 'Monthly'})`,
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

    // Create or update subscription record in database
    const subscription = await prisma.subscription.upsert({
      where: { clinicId },
      create: {
        clinicId,
        planId: plan.id, // Store the plan ID from constants
        planName: plan.name,
        planPrice: subscriptionAmount,
        billingPeriod,
        cashfreeSubscriptionId: cashfreeSubscription.subscription_id,
        cashfreeSubscriptionToken: cashfreeSubscription.subscription_token,
        status: 'TRIAL',
        trialEndsAt,
        trialDays: 14,
        startsAt: now,
        currentPeriodStart: now,
        currentPeriodEnd: subscriptionEndsAt,
        subscriptionEndsAt,
        nextBillingDate: nextBillingDate,
        paymentFailureCount: 0,
      },
      update: {
        planId: plan.id, // Update to new plan
        planName: plan.name,
        planPrice: subscriptionAmount,
        billingPeriod,
        cashfreeSubscriptionId: cashfreeSubscription.subscription_id,
        cashfreeSubscriptionToken: cashfreeSubscription.subscription_token,
        status: 'TRIAL', // Reset to trial for new subscription
        trialEndsAt,
        trialDays: 14,
        startsAt: now,
        currentPeriodStart: now,
        currentPeriodEnd: subscriptionEndsAt,
        subscriptionEndsAt,
        nextBillingDate: nextBillingDate,
        cancelledAt: null,
        cancelAtPeriodEnd: false,
        paymentFailureCount: 0,
        lastPaymentFailureAt: null,
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
      paymentSessionId: cashfreeSubscription.payment_session_id || cashfreeSubscription.subscription_token,
      planId: plan.id,
      planName: plan.name,
      amount: subscriptionAmount,
      billingPeriod,
      environment,
      trialEndsAt: trialEndsAt.toISOString(),
      subscriptionEndsAt: subscriptionEndsAt.toISOString(),
      nextBillingDate: nextBillingDate.toISOString(),
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
