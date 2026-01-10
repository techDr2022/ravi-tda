# Cashfree Subscription Model Implementation Guide

This guide provides step-by-step instructions for implementing a subscription model with Cashfree in your TDAppointments application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Cashfree Dashboard Setup](#cashfree-dashboard-setup)
6. [API Endpoints](#api-endpoints)
7. [Webhook Configuration](#webhook-configuration)
8. [Frontend Integration](#frontend-integration)
9. [Testing](#testing)
10. [Production Deployment](#production-deployment)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The subscription model allows clinics to:
- Subscribe to yearly or monthly plans (Basic, Professional, Enterprise)
- Get a 14-day free trial period
- Auto-renew subscriptions
- Cancel subscriptions (immediately or at period end)
- Handle payment failures gracefully
- Track subscription lifecycle through webhooks

---

## Prerequisites

1. **Cashfree Account**: Sign up at [https://www.cashfree.com](https://www.cashfree.com)
2. **Node.js & Next.js**: Already set up in your project
3. **Database**: PostgreSQL with Prisma (already configured)
4. **Environment Variables**: Access to set up Cashfree credentials

---

## Database Setup

### Step 1: Run Prisma Migration

The schema has been updated with a `Subscription` model. Run the migration:

```bash
npx prisma migrate dev --name add_subscription_model
```

This will:
- Create the `subscriptions` table
- Add indexes for performance
- Link subscriptions to clinics

### Step 2: Verify Migration

Check that the migration was successful:

```bash
npx prisma studio
```

Navigate to the `Subscription` model and verify the structure.

---

## Environment Configuration

### Step 1: Get Cashfree Credentials

1. Log in to [Cashfree Dashboard](https://merchant.cashfree.com)
2. Navigate to **Developer** → **Credentials**
3. Copy your **App ID** and **Secret Key**
4. Note: Use **Sandbox** credentials for testing, **Production** for live

### Step 2: Set Environment Variables

Add to your `.env.local` file:

```env
# Cashfree Configuration
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_ENVIRONMENT=sandbox  # Use 'production' for live

# Site URL (for webhooks and return URLs)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change for production
```

### Step 3: Update Production Environment

For production (Vercel, Railway, etc.):

1. Go to your hosting platform's environment variables
2. Add the same variables with production values
3. Set `CASHFREE_ENVIRONMENT=production`
4. Set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

---

## Cashfree Dashboard Setup

### Step 1: Configure Webhook URL

1. Go to **Developer** → **Webhooks** in Cashfree Dashboard
2. Add webhook URL: `https://yourdomain.com/api/subscriptions/webhook`
3. Select events to receive:
   - `SUBSCRIPTION_ACTIVATED`
   - `SUBSCRIPTION_CHARGED`
   - `SUBSCRIPTION_CHARGE_FAILED`
   - `SUBSCRIPTION_CANCELLED`
   - `SUBSCRIPTION_PAUSED`
   - `SUBSCRIPTION_RESUMED`
   - `SUBSCRIPTION_COMPLETED`
4. Save webhook configuration

### Step 2: Test Webhook (Sandbox)

1. Use Cashfree's webhook testing tool
2. Send test events to verify your webhook endpoint
3. Check logs to ensure events are received correctly

---

## API Endpoints

### 1. Create Subscription

**Endpoint**: `POST /api/subscriptions/create`

**Request Body**:
```json
{
  "planId": "basic",
  "clinicId": "clinic_id_here",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "9999999999"
}
```

**Response**:
```json
{
  "subscriptionId": "sub_xxx",
  "subscriptionToken": "token_xxx",
  "paymentSessionId": "session_xxx",
  "planId": "basic",
  "planName": "Basic",
  "amount": 7999,
  "billingPeriod": "year",
  "environment": "sandbox",
  "trialEndsAt": "2024-01-15T00:00:00.000Z",
  "subscriptionEndsAt": "2025-01-15T00:00:00.000Z"
}
```

### 2. Get Subscription Status

**Endpoint**: `GET /api/subscriptions/status?clinicId=xxx`

**Response**:
```json
{
  "subscription": {
    "id": "sub_id",
    "planId": "basic",
    "planName": "Basic",
    "status": "ACTIVE",
    "trialEndsAt": "2024-01-15T00:00:00.000Z",
    "nextBillingDate": "2025-01-15T00:00:00.000Z",
    "clinic": { ... }
  }
}
```

### 3. Cancel Subscription

**Endpoint**: `POST /api/subscriptions/cancel`

**Request Body**:
```json
{
  "clinicId": "clinic_id_here",
  "cancelAtPeriodEnd": false,
  "reason": "No longer needed"
}
```

### 4. Verify Subscription

**Endpoint**: `POST /api/subscriptions/verify`

**Request Body**:
```json
{
  "subscriptionId": "sub_xxx",
  "clinicId": "clinic_id_here",
  "planId": "basic"
}
```

### 5. Webhook Handler

**Endpoint**: `POST /api/subscriptions/webhook`

This endpoint automatically receives webhook events from Cashfree. No manual calls needed.

---

## Webhook Configuration

### Webhook Events Handled

1. **SUBSCRIPTION_ACTIVATED**: First payment successful, subscription activated
2. **SUBSCRIPTION_CHARGED**: Recurring payment successful
3. **SUBSCRIPTION_CHARGE_FAILED**: Payment failed, increments failure count
4. **SUBSCRIPTION_CANCELLED**: Subscription cancelled
5. **SUBSCRIPTION_PAUSED**: Subscription paused
6. **SUBSCRIPTION_RESUMED**: Subscription resumed
7. **SUBSCRIPTION_COMPLETED**: All billing cycles completed

### Webhook Security (Production)

In production, enable webhook signature verification:

1. Get webhook secret from Cashfree Dashboard
2. Uncomment signature verification in `/api/subscriptions/webhook/route.ts`
3. Add `CASHFREE_WEBHOOK_SECRET` to environment variables

```typescript
// In webhook handler
if (!verifyWebhookSignature(rawBody, signature, secretKey)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

---

## Frontend Integration

### Step 1: Update Pricing Component

The Pricing component (`src/components/sections/Pricing.tsx`) has been updated to use subscriptions. 

**Key Changes**:
- Uses `createSubscription` instead of `createOrder`
- Requires `clinicId` from authenticated user
- Handles subscription checkout flow

### Step 2: Get Clinic ID from Session

Update your authentication to include `clinicId`:

```typescript
// In your auth context or session
const { data: session } = useSession();
const clinicId = session?.user?.clinicId;
```

### Step 3: Initialize Subscription Checkout

```typescript
import { initializeCashfreeCheckout } from '@/lib/cashfree';

const handleSubscribe = async (planId: string) => {
  const result = await initializeCashfreeCheckout(planId, {
    clinicId: user.clinicId,
    email: user.email,
    name: user.name,
    phone: user.phone,
  });

  if (result.success) {
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
};
```

### Step 4: Display Subscription Status

Create a subscription status component:

```typescript
import { getSubscriptionStatus } from '@/lib/subscription-service';

const SubscriptionStatus = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getSubscriptionStatus(clinicId).then(setStatus);
  }, [clinicId]);

  return (
    <div>
      <p>Plan: {status?.planName}</p>
      <p>Status: {status?.status}</p>
      <p>Next Billing: {status?.nextBillingDate}</p>
    </div>
  );
};
```

---

## Testing

### Step 1: Test Subscription Creation

1. Use Cashfree sandbox credentials
2. Create a test clinic in your database
3. Call the create subscription endpoint
4. Verify subscription is created in Cashfree dashboard

### Step 2: Test Payment Flow

1. Use Cashfree test cards:
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `5555 5555 5555 4444`
2. Complete checkout flow
3. Verify webhook events are received
4. Check database for subscription status update

### Step 3: Test Webhooks Locally

For local testing, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Update webhook URL in Cashfree dashboard
# Use: https://your-ngrok-url.ngrok.io/api/subscriptions/webhook
```

### Step 4: Test Subscription Cancellation

1. Cancel subscription via API
2. Verify status updates in database
3. Test cancellation at period end vs immediate

---

## Production Deployment

### Step 1: Switch to Production Mode

1. Update environment variables:
   ```env
   CASHFREE_ENVIRONMENT=production
   CASHFREE_APP_ID=your_production_app_id
   CASHFREE_SECRET_KEY=your_production_secret_key
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

2. Update webhook URL in Cashfree dashboard:
   ```
   https://yourdomain.com/api/subscriptions/webhook
   ```

### Step 2: Enable Webhook Signature Verification

Uncomment and enable signature verification in webhook handler.

### Step 3: Monitor Webhooks

Set up monitoring for webhook events:
- Log all webhook events
- Set up alerts for failed webhooks
- Monitor subscription status changes

### Step 4: Handle Edge Cases

1. **Payment Failures**: Implement retry logic and notifications
2. **Expired Subscriptions**: Add background jobs to check expiry
3. **Trial Expiry**: Send reminders before trial ends
4. **Cancellation**: Handle graceful degradation of features

---

## Troubleshooting

### Issue: Subscription Creation Fails

**Solution**:
- Verify Cashfree credentials are correct
- Check API version matches (`2023-08-01`)
- Verify request payload format
- Check Cashfree dashboard for error logs

### Issue: Webhooks Not Received

**Solution**:
- Verify webhook URL is publicly accessible
- Check webhook URL in Cashfree dashboard
- Ensure webhook events are enabled
- Use ngrok for local testing
- Check server logs for incoming requests

### Issue: Subscription Status Not Updating

**Solution**:
- Verify webhook handler is processing events
- Check database for subscription records
- Verify clinicId matches correctly
- Check Prisma client is regenerated (`npx prisma generate`)

### Issue: Payment Session Not Created

**Solution**:
- Verify amount is in smallest currency unit (paise for INR)
- Check plan details are correct
- Verify customer details format
- Check Cashfree API response for errors

### Issue: Subscription Cancellation Fails

**Solution**:
- Verify subscription exists in Cashfree
- Check subscription status (can't cancel already cancelled)
- Verify Cashfree subscription ID is correct
- Check API response for specific errors

---

## Next Steps

1. **Add Subscription Management UI**: Create dashboard for managing subscriptions
2. **Implement Trial Reminders**: Send notifications before trial ends
3. **Add Payment Method Management**: Allow users to update payment methods
4. **Implement Upgrade/Downgrade**: Handle plan changes
5. **Add Usage Tracking**: Track feature usage per plan
6. **Implement Proration**: Handle mid-cycle plan changes
7. **Add Subscription Analytics**: Track subscription metrics

---

## Support

For issues or questions:
- Check Cashfree documentation: [https://docs.cashfree.com](https://docs.cashfree.com)
- Review Cashfree API reference for subscriptions
- Contact Cashfree support for payment-related issues
- Check your application logs for debugging

---

## Migration Checklist

- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] Cashfree credentials added
- [ ] Webhook URL configured
- [ ] Subscription creation tested
- [ ] Payment flow tested
- [ ] Webhook events tested
- [ ] Subscription cancellation tested
- [ ] Production credentials configured
- [ ] Webhook signature verification enabled (production)
- [ ] Monitoring and logging set up
- [ ] Documentation updated

---

**Last Updated**: January 2025
**Version**: 1.0.0
