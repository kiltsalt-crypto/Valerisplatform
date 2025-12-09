# Stripe Integration Guide

This guide explains how to integrate Stripe payments into Valeris.

## Overview

Valeris uses Stripe for subscription payments. The integration includes:
- Subscription checkout
- Payment method management
- Webhook handling for subscription events
- Upgrade/downgrade flows
- Trial management

## Prerequisites

1. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Business Verification**: Complete Stripe's verification process
3. **API Keys**: Get from Developers > API Keys

## Setup Steps

### 1. Get Your Stripe Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Developers > API Keys
3. Copy both keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. Configure Environment Variables

Add to your `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

Add to Supabase Edge Function Secrets:
- Go to Supabase Dashboard
- Navigate to Edge Functions > Manage Secrets
- Add: `STRIPE_SECRET_KEY` = `sk_test_your_key_here`

### 3. Create Stripe Products

In Stripe Dashboard:

1. Go to Products > Add Product

#### Free Plan
- Name: Free
- Price: $0/month
- Product ID: Save for later

#### Starter Plan
- Name: Starter
- Price: $29/month
- Billing: Monthly recurring
- Product ID: Save for later

#### Pro Plan
- Name: Pro
- Price: $79/month
- Billing: Monthly recurring
- Product ID: Save for later

#### Elite Plan
- Name: Elite
- Price: $149/month
- Billing: Monthly recurring
- Product ID: Save for later

### 4. Set Up Webhooks

1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhooks`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Copy the webhook secret (starts with `whsec_`)
6. Add to Supabase secrets: `STRIPE_WEBHOOK_SECRET`

### 5. Update Price IDs

After creating products, update the Stripe price IDs in your database:

```sql
-- Update subscription_tiers table with your Stripe price IDs
UPDATE subscription_tiers
SET stripe_price_id = 'price_your_starter_id'
WHERE tier = 'starter';

UPDATE subscription_tiers
SET stripe_price_id = 'price_your_pro_id'
WHERE tier = 'pro';

UPDATE subscription_tiers
SET stripe_price_id = 'price_your_elite_id'
WHERE tier = 'elite';
```

## Implementation

The Stripe integration consists of several components:

### Edge Functions

#### 1. `create-checkout-session`
Creates a Stripe Checkout session for subscriptions.

**Endpoint**: `/functions/v1/create-checkout-session`

**Request**:
```json
{
  "priceId": "price_123",
  "customerId": "cus_123" // optional
}
```

**Response**:
```json
{
  "sessionId": "cs_123",
  "url": "https://checkout.stripe.com/..."
}
```

#### 2. `create-portal-session`
Creates a Stripe Customer Portal session for managing subscriptions.

**Endpoint**: `/functions/v1/create-portal-session`

**Request**:
```json
{
  "customerId": "cus_123"
}
```

**Response**:
```json
{
  "url": "https://billing.stripe.com/..."
}
```

#### 3. `stripe-webhooks`
Handles webhook events from Stripe.

**Endpoint**: `/functions/v1/stripe-webhooks`

Events handled:
- `checkout.session.completed`: Create subscription record
- `customer.subscription.updated`: Update subscription status
- `customer.subscription.deleted`: Cancel subscription
- `invoice.payment_succeeded`: Confirm payment
- `invoice.payment_failed`: Handle failed payment

### Frontend Components

#### 1. Pricing Page
Displays subscription plans and initiates checkout.

**File**: `src/components/Pricing.tsx`

```typescript
const handleSubscribe = async (priceId: string) => {
  const response = await fetch('/functions/v1/create-checkout-session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });

  const { url } = await response.json();
  window.location.href = url;
};
```

#### 2. Subscription Management
Allows users to manage their subscriptions.

**File**: `src/components/SubscriptionManager.tsx`

```typescript
const handleManageSubscription = async () => {
  const response = await fetch('/functions/v1/create-portal-session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerId: user.stripe_customer_id }),
  });

  const { url } = await response.json();
  window.location.href = url;
};
```

## Testing

### Test Mode

Use Stripe's test mode for development:

1. Use test API keys (starts with `sk_test_` and `pk_test_`)
2. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0027 6000 3184`

### Test Webhooks Locally

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login:
   ```bash
   stripe login
   ```

3. Forward webhooks:
   ```bash
   stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhooks
   ```

4. Get webhook secret from output and add to secrets

### Test Scenarios

1. **Successful Subscription**:
   - Select a plan
   - Use test card `4242 4242 4242 4242`
   - Complete checkout
   - Verify subscription in database

2. **Failed Payment**:
   - Select a plan
   - Use test card `4000 0000 0000 0002`
   - Verify error handling

3. **Subscription Upgrade**:
   - Subscribe to Starter
   - Upgrade to Pro
   - Verify prorated charges

4. **Subscription Cancellation**:
   - Open billing portal
   - Cancel subscription
   - Verify access until period end

## Production Checklist

Before going live:

- [ ] Switch to live API keys (`sk_live_`, `pk_live_`)
- [ ] Update webhook endpoint to production URL
- [ ] Test all payment flows with live mode
- [ ] Configure proper error handling
- [ ] Set up Stripe Radar for fraud prevention
- [ ] Configure email receipts
- [ ] Set up Stripe billing portal customization
- [ ] Test subscription lifecycle (create, update, cancel)
- [ ] Verify webhook signature validation
- [ ] Test failed payment handling
- [ ] Verify subscription upgrade/downgrade proration

## Security Best Practices

1. **Never expose secret key**: Always use edge functions
2. **Verify webhook signatures**: Prevent webhook spoofing
3. **Use HTTPS**: Required for all Stripe API calls
4. **Validate prices server-side**: Don't trust client
5. **Implement idempotency**: Use idempotency keys for retries
6. **Handle webhooks asynchronously**: Return 200 quickly
7. **Store minimal data**: Don't store full card numbers
8. **Use Stripe elements**: PCI compliance made easy
9. **Enable Stripe Radar**: Fraud detection
10. **Monitor webhook failures**: Set up alerts

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Events

**Solution**:
- Verify webhook URL is correct
- Check webhook signing secret
- Ensure edge function is deployed
- Check Supabase logs for errors

#### 2. Payment Fails but Subscription Created

**Solution**:
- Check webhook event order
- Implement proper error handling
- Use webhook events as source of truth

#### 3. Duplicate Subscriptions

**Solution**:
- Check for race conditions
- Implement idempotency keys
- Use unique constraints in database

#### 4. Trial Not Working

**Solution**:
- Verify trial period in Stripe product
- Check subscription_tiers table
- Ensure webhook handles trial subscriptions

## Support

For Stripe-specific issues:
- Stripe Support: [support.stripe.com](https://support.stripe.com)
- Stripe Documentation: [docs.stripe.com](https://docs.stripe.com)
- Stripe Discord: [discord.gg/stripe](https://discord.gg/stripe)

For Valeris integration issues:
- Email: support@valeris.io
- Documentation: docs.valeris.io

## Next Steps

After Stripe is configured:

1. Test all payment flows thoroughly
2. Set up error monitoring for payment failures
3. Configure email notifications for payment events
4. Monitor subscription metrics in Stripe Dashboard
5. Set up automated invoicing
6. Configure tax collection (if applicable)

---

**Need Help?** Visit https://bolt.new/setup/stripe for assistance.

**Last Updated**: December 2024
**Version**: 1.0.0
