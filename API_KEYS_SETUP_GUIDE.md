# API Keys Setup Guide

Quick reference for adding your API keys and deploying to production.

---

## Required API Keys

### 1. Supabase (Already Set Up)
Your `.env` file should already have these:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

✅ These are already configured and working.

---

## Optional API Keys (Add Tonight)

### 2. Stripe (For Payments)

**Where to get:**
1. Go to https://dashboard.stripe.com
2. Navigate to Developers → API Keys
3. Copy your keys

**Add to `.env`:**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**For production:**
- Switch to live keys (pk_live_... and sk_live_...)
- Never commit secret keys to git

---

### 3. Google Analytics

**Where to get:**
1. Go to https://analytics.google.com
2. Create property
3. Get Measurement ID (G-XXXXXXXXXX)

**Add to `.env`:**
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Then add to index.html:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

### 4. Sentry (Error Tracking)

**Where to get:**
1. Go to https://sentry.io
2. Create project
3. Get DSN

**Add to `.env`:**
```bash
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_ORG=your-org
VITE_SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
```

**Already integrated** in the code at `src/lib/sentry.ts`

---

### 5. Email Service (SendGrid/Mailgun/Resend)

**Recommended: Resend (easiest)**

**Where to get:**
1. Go to https://resend.com
2. Create API key

**Add to `.env`:**
```bash
RESEND_API_KEY=re_...
```

**Or use SendGrid:**
```bash
SENDGRID_API_KEY=SG....
```

---

### 6. hCaptcha (Spam Protection)

**Where to get:**
1. Go to https://www.hcaptcha.com
2. Create site
3. Get site key and secret

**Add to `.env`:**
```bash
VITE_HCAPTCHA_SITE_KEY=your_site_key
HCAPTCHA_SECRET_KEY=your_secret
```

**Already integrated** in Auth component

---

## GitHub Secrets (For CI/CD)

Add these to your GitHub repository:

**Repository → Settings → Secrets and variables → Actions**

### Required:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Optional (but recommended):
```
VITE_STRIPE_PUBLISHABLE_KEY
VITE_GA_MEASUREMENT_ID
VITE_SENTRY_DSN
VITE_SENTRY_ORG
VITE_SENTRY_PROJECT
SENTRY_AUTH_TOKEN
```

---

## Deployment Platforms

### Option 1: Netlify (Recommended)

**Steps:**
1. Go to https://netlify.com
2. Connect GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables
6. Deploy

**Add these environment variables in Netlify:**
- All VITE_* variables from your .env

**Custom Domain:**
- Netlify dashboard → Domain settings
- Add your domain
- Update DNS records

---

### Option 2: Vercel

**Steps:**
1. Go to https://vercel.com
2. Import GitHub repo
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables
7. Deploy

**Environment variables:**
- Same as Netlify (all VITE_* variables)

---

## Quick Deployment Checklist

### Before First Deploy:
- [ ] Add all API keys to `.env`
- [ ] Test locally: `npm run dev`
- [ ] Build: `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Commit changes
- [ ] Push to main branch

### Platform Setup:
- [ ] Choose platform (Netlify/Vercel)
- [ ] Connect GitHub repo
- [ ] Add environment variables
- [ ] Configure build settings
- [ ] Deploy

### After Deploy:
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Check analytics
- [ ] Verify Sentry is receiving events
- [ ] Test one payment (if Stripe is ready)

### Custom Domain:
- [ ] Purchase domain (if needed)
- [ ] Add to platform
- [ ] Update DNS records
- [ ] Wait for SSL certificate
- [ ] Test HTTPS

---

## Environment Variables Reference

### Full .env Template

```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (For payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google Analytics (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry (Optional but recommended)
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_ORG=your-org
VITE_SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token

# Email Service (Choose one)
RESEND_API_KEY=re_...
# OR
SENDGRID_API_KEY=SG....

# hCaptcha (Optional)
VITE_HCAPTCHA_SITE_KEY=your_site_key
HCAPTCHA_SECRET_KEY=your_secret

# App Config
VITE_APP_URL=https://valeris.trading
NODE_ENV=production
```

---

## Testing Checklist

### After adding all keys:

**Local Testing:**
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test these:
1. Sign up with new account
2. Log in
3. Log a trade
4. View analytics
5. Test payment flow (if Stripe ready)
6. Check for console errors
```

**Production Testing:**
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Same tests as above
```

---

## Common Issues & Solutions

### Issue: Build fails
**Solution:** Check that all VITE_* variables are set

### Issue: Supabase connection error
**Solution:** Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

### Issue: Stripe not working
**Solution:** Make sure you're using test keys for testing

### Issue: Analytics not tracking
**Solution:** Check GA_MEASUREMENT_ID and script in index.html

### Issue: Sentry not receiving errors
**Solution:** Verify DSN and that sentry is initialized

---

## Security Reminders

🔒 **NEVER commit .env to git**
- Already in .gitignore
- Use GitHub Secrets for CI/CD
- Use platform env vars for deployment

🔒 **Use different keys for development/production**
- Stripe: test vs live keys
- Supabase: can use same or separate projects
- Sentry: can use same or separate projects

🔒 **Rotate keys if exposed**
- Immediately regenerate any leaked keys
- Update everywhere they're used

---

## Quick Start Commands

```bash
# Development
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build

# Preview build
npm run preview

# Deploy (after setting up Netlify CLI)
netlify deploy --prod

# Or Vercel
vercel --prod
```

---

## Support Links

- **Supabase:** https://supabase.com/docs
- **Stripe:** https://stripe.com/docs
- **Netlify:** https://docs.netlify.com
- **Vercel:** https://vercel.com/docs
- **Sentry:** https://docs.sentry.io
- **Resend:** https://resend.com/docs

---

## Ready to Deploy?

1. Add your API keys to `.env`
2. Test locally
3. Choose deployment platform
4. Add environment variables to platform
5. Deploy
6. Test in production
7. Set up custom domain
8. Launch! 🚀

Everything else is ready to go.
