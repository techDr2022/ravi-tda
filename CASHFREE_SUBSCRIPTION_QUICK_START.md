# Cashfree Subscription Quick Start Guide

This is a quick reference guide for implementing Cashfree subscriptions. For detailed documentation, see `CASHFREE_SUBSCRIPTION_GUIDE.md`.

## Quick Setup (5 Steps)

### Step 1: Database Migration

```bash
npx prisma migrate dev --name add_subscription_model
npx prisma generate
```

### Step 2: Environment Variables

Add to `.env.local`:

```env
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENVIRONMENT=sandbox
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Cashfree Dashboard

1. Go to [Cashfree Dashboard](https://merchant.cashfree.com)
2. Copy App ID and Secret Key from **Developer** → **Credentials**
3. Configure webhook URL: `https://yourdomain.com/api/subscriptions/webhook`
4. Enable webhook events for subscriptions

### Step 4: Update Pricing Component

The Pricing component (`src/components/sections/Pricing.tsx`) now:
- Requires user to be logged in
- Uses `clinicId` from session
- Creates subscriptions instead of one-time orders

### Step 5: Test

1. Login to your app
2. Navigate to `/pricing`
3. Select a plan
4. Complete payment with test card: `4111 1111 1111 1111`
5. Verify subscription is created in database

## Important Notes

### For New Users (No Clinic Yet)

If a user subscribes before creating a clinic, you have two options:

**Option A**: Create clinic during onboarding, then link subscription
```typescript
// After payment success, create clinic with subscription reference
const clinic = await prisma.clinic.create({
  data: {
    name: user.name,
    email: user.email,
    subscriptionPlan: planId,
    // ... other fields
  }
});

// Link subscription to clinic
await prisma.subscription.update({
  where: { cashfreeSubscriptionId },
  data: { clinicId: clinic.id }
});
```

**Option B**: Allow subscription creation without clinicId, create clinic later
- Modify `/api/subscriptions/create` to accept optional clinicId
- Create clinic after subscription is confirmed
- Update subscription with clinicId in webhook handler

### Webhook Testing Locally

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use ngrok URL in Cashfree webhook config
# https://your-ngrok-url.ngrok.io/api/subscriptions/webhook
```

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscriptions/create` | POST | Create new subscription |
| `/api/subscriptions/status` | GET | Get subscription status |
| `/api/subscriptions/cancel` | POST | Cancel subscription |
| `/api/subscriptions/verify` | POST | Verify subscription payment |
| `/api/subscriptions/webhook` | POST | Webhook handler (Cashfree calls this) |

## Common Issues

**Issue**: "Clinic ID is required" error
- **Solution**: User needs to create clinic first, or modify flow to create clinic during subscription

**Issue**: Webhooks not received
- **Solution**: Use ngrok for local testing, verify URL is publicly accessible

**Issue**: Subscription status not updating
- **Solution**: Check webhook handler logs, verify database updates are working

## Testing Cards (Sandbox)

- **Success**: `4111 1111 1111 1111`
- **Failure**: `5555 5555 5555 4444`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Next Steps

1. Implement subscription management UI in dashboard
2. Add trial expiry reminders
3. Handle payment failures gracefully
4. Add upgrade/downgrade functionality
5. Implement proration for plan changes

For detailed documentation, see `CASHFREE_SUBSCRIPTION_GUIDE.md`.
