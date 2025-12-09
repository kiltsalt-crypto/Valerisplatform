# Production Deployment Guide for Valeris

This guide covers all steps required to deploy Valeris to production safely and securely.

## Prerequisites

Before deploying to production, ensure you have:
- [x] Domain name (e.g., app.valeris.io)
- [ ] Supabase production project
- [ ] Email service account (Resend)
- [ ] Error monitoring account (Sentry)
- [ ] CAPTCHA service account (hCaptcha)
- [ ] Stripe account (for payments)
- [ ] SSL certificate (automated via Netlify/Vercel)

## 1. Environment Variables Configuration

Create a `.env.production` file with the following variables:

```env
# Supabase (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Environment
VITE_ENVIRONMENT=production

# Sentry Error Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_SENTRY_ORG=your-org-name
VITE_SENTRY_PROJECT=valeris
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# hCaptcha
VITE_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key

# Resend Email Service (Edge Function Secret)
RESEND_API_KEY=your-resend-api-key

# Stripe (Edge Function Secret)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

### Setting Up Edge Function Secrets

Edge function secrets are automatically configured in Supabase. To update them:

1. Go to Supabase Dashboard > Edge Functions > Manage Secrets
2. Add the following secrets:
   - `RESEND_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

## 2. Service Setup

### A. Resend Email Service

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (valeris.io)
3. Add DNS records:
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [provided by Resend]
   ```
4. Get API key from Settings > API Keys
5. Add to Supabase secrets: `RESEND_API_KEY`

### B. Sentry Error Monitoring

1. Sign up at [sentry.io](https://sentry.io)
2. Create new project: "Valeris"
3. Get DSN from Settings > Client Keys
4. Create auth token from Settings > Auth Tokens
5. Add to `.env.production`:
   - `VITE_SENTRY_DSN`
   - `VITE_SENTRY_ORG`
   - `VITE_SENTRY_PROJECT`
   - `SENTRY_AUTH_TOKEN`

### C. hCaptcha Setup

1. Sign up at [hcaptcha.com](https://hcaptcha.com)
2. Create new site
3. Add domain: valeris.io
4. Get site key from dashboard
5. Add to `.env.production`: `VITE_HCAPTCHA_SITE_KEY`

### D. Stripe Payments

1. Sign up at [stripe.com](https://stripe.com)
2. Complete business verification
3. Get API keys from Developers > API Keys
4. Set up webhooks:
   - URL: `https://your-project.supabase.co/functions/v1/webhook-handler`
   - Events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
5. Get webhook secret
6. Add to Supabase secrets:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

## 3. Database Setup

### Migration to Production

Your database is already set up with all necessary tables and security policies. Verify:

```sql
-- Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

Expected output: No tables should have `rowsecurity = false`

### Create First Admin User

```sql
-- After signing up through the UI, promote user to admin
INSERT INTO admin_users (user_id, email, role, requires_2fa)
VALUES ('user-uuid', 'admin@valeris.io', 'super_admin', true);
```

## 4. Deployment Steps

### Option A: Netlify

1. Connect GitHub repository to Netlify
2. Configure build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
3. Add environment variables from `.env.production`
4. Deploy!

### Option B: Vercel

1. Connect GitHub repository to Vercel
2. Configure build settings:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   ```
3. Add environment variables from `.env.production`
4. Deploy!

### Option C: Supabase Storage

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Supabase Storage:
   ```bash
   supabase storage cp -r ./dist/* bucket-name/
   ```

## 5. Domain Configuration

### DNS Setup

Add the following DNS records:

```
Type: A
Name: @
Value: [Your hosting provider IP]

Type: CNAME
Name: www
Value: your-site.netlify.app (or vercel.app)

Type: CNAME
Name: app
Value: your-site.netlify.app (or vercel.app)
```

### SSL Certificate

- Netlify/Vercel: Automatic SSL via Let's Encrypt
- Custom: Use Cloudflare for free SSL

## 6. Security Checklist

- [x] All environment variables configured
- [x] RLS policies enabled on all tables
- [x] HTTPS enforced (HSTS headers)
- [x] CAPTCHA on signup/login
- [x] Rate limiting on edge functions
- [x] Content Security Policy headers
- [x] 2FA enforced for admin accounts
- [x] Sentry error tracking enabled
- [ ] Regular database backups scheduled
- [ ] Security monitoring alerts configured

## 7. Performance Optimization

### CDN Configuration

Enable CDN for static assets:
- Netlify: Automatic
- Vercel: Automatic
- Cloudflare: Configure page rules

### Caching Headers

Already configured in `public/_headers`:
```
/*
  Cache-Control: public, max-age=31536000, immutable
```

## 8. Monitoring & Alerts

### Sentry Alerts

Configure alerts in Sentry:
1. Go to Alerts > Create Alert
2. Set conditions:
   - Error rate exceeds 10 per minute
   - New issue detected
   - Performance degradation
3. Add notification channels (email, Slack)

### Uptime Monitoring

Set up with:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://pingdom.com)
- [Better Stack](https://betterstack.com)

Monitor:
- Main app: https://app.valeris.io
- API health: https://your-project.supabase.co/rest/v1/

## 9. Backup Strategy

### Database Backups

Supabase provides automatic daily backups. For additional safety:

```bash
# Manual backup
pg_dump -h db.your-project.supabase.co -U postgres valeris > backup.sql
```

Schedule weekly full backups to external storage (S3, Google Cloud Storage).

### Data Export

Users can export their data via:
- Trading journal: CSV export
- Analytics: PDF reports
- Account data: JSON export

## 10. Launch Checklist

Before going live:

- [ ] Test all user flows (signup, login, trading journal, payments)
- [ ] Verify email notifications work
- [ ] Test CAPTCHA on signup/login
- [ ] Verify Stripe payments process correctly
- [ ] Test 2FA setup and enforcement
- [ ] Check all pages load under 3 seconds
- [ ] Verify mobile responsiveness
- [ ] Test error tracking (trigger test error)
- [ ] Verify rate limiting works
- [ ] Check all links work
- [ ] Test password reset flow
- [ ] Verify admin dashboard access
- [ ] Test support ticket system
- [ ] Check SEO meta tags
- [ ] Verify analytics tracking
- [ ] Test subscription upgrades/downgrades

## 11. Post-Launch Monitoring

Monitor these metrics daily:

### Technical Metrics
- Error rate (should be < 0.1%)
- Response time (should be < 500ms)
- Uptime (target: 99.9%)
- Database performance
- Edge function cold starts

### Business Metrics
- New signups
- Conversion rate (trial → paid)
- Monthly recurring revenue (MRR)
- Churn rate
- Average revenue per user (ARPU)

### User Metrics
- Daily active users (DAU)
- Monthly active users (MAU)
- Session duration
- Feature usage
- Support ticket volume

## 12. Scaling Considerations

### When to Scale

Scale when:
- Response time > 1 second consistently
- Error rate > 1%
- Database CPU > 80%
- Concurrent users > 1000

### Scaling Options

1. **Database**: Upgrade Supabase plan
2. **Edge Functions**: Automatically scales
3. **Frontend**: CDN handles this automatically
4. **Monitoring**: Upgrade Sentry plan as needed

## 13. Disaster Recovery

### Recovery Time Objectives (RTO)

- Database failure: < 1 hour
- Application failure: < 15 minutes
- CDN failure: < 5 minutes

### Recovery Procedures

1. **Database Restore**:
   ```bash
   psql -h db.your-project.supabase.co -U postgres valeris < backup.sql
   ```

2. **Application Restore**:
   - Revert to previous deployment in Netlify/Vercel
   - Or redeploy from known-good commit

3. **Edge Function Restore**:
   - Redeploy from repository
   - Or revert via Supabase dashboard

## Support

For deployment issues:
- Email: support@valeris.io
- Documentation: docs.valeris.io
- Status page: status.valeris.io

---

**Last Updated**: December 2024
**Version**: 1.0.0
