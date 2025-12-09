# Weekend API Setup Guide

Complete this checklist over the weekend to get all integrations ready for launch.

**Estimated Total Time: 3-4 hours**

---

## Priority 1: Security & Core Features (1 hour)

### ✅ 1. hCaptcha Setup (10 minutes)

**Purpose:** Protect signup/login from bots

**Steps:**
1. Go to https://hcaptcha.com
2. Click "Sign Up" (free tier is fine)
3. After login, click "New Site"
4. Enter:
   - Site name: "Valeris"
   - Hostname: Your domain (e.g., app.valeris.io)
   - Or use "*" for any domain during testing
5. Copy the "Site Key"
6. Add to your hosting environment variables:
   ```
   VITE_HCAPTCHA_SITE_KEY=your-site-key-here
   ```

**Test:** Visit your signup page, you should see the captcha

---

### ✅ 2. Resend Email Setup (15 minutes)

**Purpose:** Send welcome emails, password resets, notifications

**Steps:**
1. Go to https://resend.com
2. Sign up (free tier: 100 emails/day)
3. Click "Add Domain" or use resend's test domain (re@resend.dev) temporarily
4. If using custom domain:
   - Add DNS records shown by Resend
   - Wait 5-10 minutes for verification
5. Go to "API Keys" and click "Create API Key"
6. Copy the key (starts with `re_`)
7. Add to Supabase Edge Function Secrets:
   - Go to Supabase Dashboard
   - Edge Functions > Manage Secrets
   - Add: `RESEND_API_KEY` = your key

**Test:** Trigger a password reset email

---

### ✅ 3. Sentry Error Monitoring (15 minutes)

**Purpose:** Track and fix errors in production

**Steps:**
1. Go to https://sentry.io
2. Sign up (free tier: 5K errors/month)
3. Create new project:
   - Platform: React
   - Project name: "Valeris"
4. Copy the DSN (looks like: https://xxx@xxx.ingest.sentry.io/xxx)
5. Go to Settings > Auth Tokens
6. Create new token with:
   - Scopes: project:releases, project:write
   - Copy the token
7. Add to your hosting environment variables:
   ```
   VITE_SENTRY_DSN=your-dsn-here
   VITE_SENTRY_ORG=your-org-slug
   VITE_SENTRY_PROJECT=valeris
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

**Test:** Trigger a test error in your app

---

## Priority 2: Broker Integrations (1 hour)

### ✅ 4. E*TRADE API Setup (30 minutes)

**Purpose:** Enable live trading with E*TRADE accounts

**Steps:**
1. Go to https://developer.etrade.com
2. Click "Sign Up" or "Log In"
3. Accept developer agreement
4. Go to "My Apps" > "Create New Application"
5. Fill in:
   - Application Name: "Valeris Trading Platform"
   - Description: "Trading journal and analytics platform"
   - OAuth Callback URL: `https://your-domain.com/broker/etrade/callback`
6. Submit for approval (may take 1-2 business days)
7. Once approved, you'll get:
   - Consumer Key (Client ID)
   - Consumer Secret
8. Add to environment:
   - Hosting: `VITE_ETRADE_CLIENT_ID=your-key`
   - Supabase Secrets: `ETRADE_CLIENT_SECRET=your-secret`

**Note:** Approval may take 1-2 business days. You can continue with other setups.

---

### ✅ 5. Charles Schwab API Setup (30 minutes)

**Purpose:** Enable live trading with Schwab accounts

**Steps:**
1. Go to https://developer.schwab.com
2. Create developer account
3. Go to "My Apps" > "Create App"
4. Fill in:
   - App Name: "Valeris Trading Platform"
   - Redirect URI: `https://your-domain.com/broker/schwab/callback`
5. Submit application
6. Once approved, you'll get:
   - App Key (Client ID)
   - App Secret
7. Add to environment:
   - Hosting: `VITE_SCHWAB_CLIENT_ID=your-key`
   - Supabase Secrets: `SCHWAB_CLIENT_SECRET=your-secret`

**Note:** Approval may take 1-2 business days.

**Alternative:** Use paper trading mode without these APIs initially.

---

## Priority 3: Payments (30 minutes + wait time)

### ✅ 6. Stripe Setup (30 minutes + 2-3 days verification)

**Purpose:** Accept subscription payments

**Steps:**
1. Go to https://stripe.com
2. Sign up for an account
3. Complete business verification:
   - Business details
   - Bank account
   - Identity verification
   - **This takes 2-3 business days**
4. While waiting, get test keys:
   - Go to Developers > API Keys
   - Toggle "Test mode" ON
   - Copy "Publishable key" and "Secret key"
5. Set up webhook:
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - URL: `https://your-supabase-project.supabase.co/functions/v1/webhook-handler`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret
6. Add to environment:
   - Hosting: `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - Supabase Secrets:
     - `STRIPE_SECRET_KEY=sk_test_...`
     - `STRIPE_WEBHOOK_SECRET=whsec_...`

**Once verified:** Switch to live keys by toggling "Test mode" OFF

**Test:** Try subscribing to a plan (use test card: 4242 4242 4242 4242)

---

## Priority 4: Optional Enhancements (1 hour)

### ✅ 7. Google Analytics (10 minutes) - Optional

**Purpose:** Track user behavior and conversions

**Steps:**
1. Go to https://analytics.google.com
2. Create new property: "Valeris"
3. Set up web stream
4. Copy Measurement ID (starts with G-)
5. Add to hosting environment:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

---

### ✅ 8. AI Enhancement (15 minutes) - Optional

**Purpose:** Better AI coach responses

**Choose ONE:**

**Option A: OpenAI**
1. Go to https://platform.openai.com
2. Create API key
3. Add to Supabase Secrets: `OPENAI_API_KEY=sk-...`

**Option B: Anthropic Claude**
1. Go to https://console.anthropic.com
2. Create API key
3. Add to Supabase Secrets: `ANTHROPIC_API_KEY=sk-ant-...`

**Note:** Not required for launch. AI Coach works in basic mode without these.

---

### ✅ 9. Premium Market Data (15 minutes) - Optional

**Purpose:** Better market data than Yahoo Finance

**Choose ONE:**

**Option A: Polygon.io** (Recommended)
1. Go to https://polygon.io
2. Sign up (free tier: 5 requests/min)
3. Get API key
4. Add to Supabase Secrets: `POLYGON_API_KEY=your-key`

**Option B: Alpha Vantage**
1. Go to https://www.alphavantage.co
2. Get free API key
3. Add to Supabase Secrets: `ALPHA_VANTAGE_API_KEY=your-key`

**Note:** Not critical for launch. Yahoo Finance works fine.

---

## Deployment Checklist

### Before Deploying

- [ ] All Priority 1 APIs configured
- [ ] Supabase Edge Function secrets added
- [ ] Domain purchased (optional, can use subdomain)
- [ ] .env.production.template filled with your values

### Deploy to Netlify

1. Go to https://netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables (all VITE_* variables from your .env.production)
6. Click "Deploy site"
7. Wait 2-3 minutes
8. Your site is live!

### Deploy to Vercel (Alternative)

1. Go to https://vercel.com
2. Click "New Project"
3. Import your Git repository
4. Vercel auto-detects Vite settings
5. Add environment variables
6. Click "Deploy"
7. Done in 1-2 minutes!

---

## Post-Deployment

### Immediate Testing (30 minutes)

Test these flows:
- [ ] Sign up new account (should work with hCaptcha)
- [ ] Receive welcome email (verify Resend works)
- [ ] Log in/out
- [ ] Create journal entry
- [ ] View analytics
- [ ] Test password reset
- [ ] Try subscription flow (Stripe)
- [ ] Check Sentry for any errors

### Set Up Monitoring (15 minutes)

1. **UptimeRobot** (https://uptimerobot.com)
   - Add your domain
   - Check every 5 minutes
   - Alert email when down

2. **Sentry Alerts**
   - Go to Alerts > Create Alert
   - Trigger: Error rate > 10/min
   - Notification: Your email

---

## What If Something Breaks?

### Common Issues

**"Supabase connection failed"**
- Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Make sure they're in Netlify/Vercel environment variables

**"Email not sending"**
- Check Resend API key in Supabase Edge Function Secrets
- Verify domain is verified in Resend dashboard
- Check edge function logs in Supabase

**"Captcha not showing"**
- Check VITE_HCAPTCHA_SITE_KEY is set
- Make sure domain matches hCaptcha settings

**"Stripe payment failing"**
- Ensure webhook secret is correct
- Check webhook endpoint URL is correct
- View webhook logs in Stripe dashboard

---

## Weekend Timeline

### Saturday Morning (2 hours)
- [ ] hCaptcha setup
- [ ] Resend setup
- [ ] Sentry setup
- [ ] Deploy to Netlify/Vercel
- [ ] Test basic flows

### Saturday Afternoon (1 hour)
- [ ] Apply for E*TRADE API
- [ ] Apply for Schwab API
- [ ] Stripe setup (start verification)

### Sunday Morning (1 hour)
- [ ] Set up monitoring (UptimeRobot, Sentry alerts)
- [ ] Add Google Analytics (optional)
- [ ] Final testing

### Sunday Afternoon (1 hour)
- [ ] Share with 5 friends for testing
- [ ] Fix any bugs found
- [ ] Celebrate! 🎉

---

## Support

Need help? Check:
- Supabase docs: https://supabase.com/docs
- Resend docs: https://resend.com/docs
- Stripe docs: https://stripe.com/docs
- Sentry docs: https://docs.sentry.io

---

## After Launch

### Week 1
- Monitor Sentry for errors daily
- Check UptimeRobot for downtime
- Respond to user feedback
- Fix critical bugs

### Week 2-4
- Get E*TRADE/Schwab API approved
- Add AI enhancement (OpenAI/Claude)
- Consider premium market data
- Optimize based on analytics

---

**You've got this! Everything is ready for you to plug in APIs over the weekend. The app will work fine even with just the Priority 1 items configured.**
