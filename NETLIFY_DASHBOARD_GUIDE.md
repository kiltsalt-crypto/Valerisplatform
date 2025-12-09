# 🌐 Netlify Dashboard Guide

## Your App is Deployed! Now What?

This guide shows you how to use the Netlify dashboard to manage your live Valeris trading platform.

---

## 📍 Accessing Your Dashboard

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click on your site name (e.g., "valeris" or "your-site-name")
3. You'll see the main dashboard

---

## 🏠 Main Dashboard Overview

### Top Section - Site Overview

**Your Live URL** (Top of page)
```
https://your-site-name.netlify.app
```
- Click to open your live site
- Click the copy icon to copy URL
- Click the settings gear to configure domain

**Site Information Card**
- **Production branch**: `main` (or `master`)
- **Latest deploy**: Shows when last deployed
- **Deploy status**: Should show "Published"
- **Build time**: How long the build took

---

## 🚀 Key Sections You'll Use

### 1. Deploys Tab (Most Important!)

**What you'll see:**
- List of all deployments (newest first)
- Each deploy shows:
  - ✅ Published (green) = Live now
  - 🔄 Building (yellow) = In progress
  - ❌ Failed (red) = Build error
  - Timestamp
  - Commit message
  - Deploy time

**What you can do:**
- **View deploy log**: Click any deploy → See full build output
- **Rollback**: Click old deploy → "Publish deploy" to restore
- **Trigger new deploy**: Click "Trigger deploy" button → "Clear cache and deploy"
- **Stop auto-publishing**: Useful for testing

**Common Actions:**

**Force a New Deploy:**
```
1. Click "Trigger deploy" (top right)
2. Select "Deploy site"
3. Wait 2-3 minutes
```

**Rollback to Previous Version:**
```
1. Find the old deploy you want
2. Click on it
3. Click "Publish deploy" button
4. Confirm
5. Live in 30 seconds!
```

---

### 2. Site Settings Tab

**General Settings**
- **Site name**: Change your subdomain (e.g., `valeris.netlify.app`)
  - Click "Change site name"
  - Enter new name
  - Click "Save"

- **Site details**: Description, repo info
- **Danger zone**: Transfer or delete site

**Build & Deploy Settings**

**Build settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- (Already configured via netlify.toml)

**Deploy contexts:**
- Production: Deploys from `main` branch
- Deploy previews: Auto-deploy PRs
- Branch deploys: Deploy other branches

**Environment variables** (CRITICAL!)
```
Click "Environment variables" in left sidebar
```

Current variables:
- `VITE_SUPABASE_URL`: Your Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase key

**To Add New Variables:**
```
1. Click "Add a variable"
2. Select scope: "All" or specific deploys
3. Key: Variable name (e.g., VITE_HCAPTCHA_SITE_KEY)
4. Value: The actual key
5. Click "Create variable"
6. Trigger new deploy to apply
```

**Important**: Any variable starting with `VITE_` is exposed to the frontend!

---

### 3. Domain Management Tab

**Current domain:**
```
https://your-site-name.netlify.app
```

**Add Custom Domain:**
```
1. Click "Add custom domain"
2. Enter your domain (e.g., valeris.com)
3. Follow DNS configuration steps
4. Wait for SSL certificate (auto, ~5 min)
```

**DNS Configuration:**

If you own `valeris.com`:
```
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add DNS records:

   For apex domain (valeris.com):
   - Type: A
   - Name: @
   - Value: 75.2.60.5 (Netlify's IP)

   For www subdomain (www.valeris.com):
   - Type: CNAME
   - Name: www
   - Value: your-site-name.netlify.app

3. Wait 5-30 minutes for propagation
4. Netlify will auto-enable HTTPS
```

**SSL Certificate:**
- Automatically provisioned by Let's Encrypt
- Free and auto-renews
- No action needed from you

---

### 4. Functions Tab (For Edge Functions)

Since you have Supabase Edge Functions, you probably won't use Netlify Functions, but they're available if needed.

**Not needed for your app** (you're using Supabase Edge Functions instead)

---

### 5. Analytics Tab (Optional - Paid)

Netlify has built-in analytics (paid feature):
- Page views
- Unique visitors
- Top pages
- Traffic sources

**Not needed** - You have free internal analytics built into your app!

Use your Internal Analytics dashboard instead:
```
Admin Dashboard → Internal Analytics tab
```

---

### 6. Logs Tab

**Deploy Logs:**
- Real-time build output
- Error messages if build fails
- Useful for debugging

**Function Logs:**
- Not applicable (using Supabase)

**To view deploy logs:**
```
1. Go to Deploys tab
2. Click any deploy
3. Scroll down to see full log
```

---

## 🔧 Common Tasks

### Update Environment Variables

**When to do this:**
- Setting up hCaptcha (this weekend)
- Adding Sentry DSN (this weekend)
- Adding Stripe keys (when ready)
- Any API key changes

**Steps:**
```
1. Site Settings → Environment variables
2. Click "Add a variable"
3. Enter key and value
4. Save
5. Deploys → Trigger deploy → Clear cache and deploy
6. Wait 2-3 minutes
7. Test new variable works
```

**Example - Adding hCaptcha:**
```
Key: VITE_HCAPTCHA_SITE_KEY
Value: your-hcaptcha-site-key-here
Scope: All scopes
```

---

### Deploy Latest Changes

**After pushing code to GitHub:**
```
1. Git push triggers auto-deploy (if connected)
2. Go to Netlify → Deploys tab
3. Watch build progress (2-3 minutes)
4. When green ✅ → Live!
```

**Manual deploy (no code changes):**
```
1. Deploys tab
2. Click "Trigger deploy"
3. Select "Clear cache and deploy"
4. Wait 2-3 minutes
```

---

### Fix a Failed Deploy

**If deploy shows red ❌:**
```
1. Click the failed deploy
2. Read the error log
3. Common issues:
   - Missing env variable
   - Build error in code
   - Node version mismatch
   - Dependencies issue

4. Fix the issue
5. Push fix to GitHub
6. Auto-deploys again
```

**Build errors:**
- Read the log carefully
- Look for "ERROR" or "Failed"
- Google the error message
- Check your code locally first: `npm run build`

---

### Rollback Bad Deploy

**If you deployed broken code:**
```
1. Deploys tab
2. Find last working deploy (green ✅)
3. Click on it
4. Click "Publish deploy" button
5. Confirm
6. Live in 30 seconds!
```

Your broken code is NOT deleted - it's just unpublished.

---

### Change Site Name

**To get better URL:**
```
1. Site Settings → General
2. Click "Change site name"
3. Enter new name (e.g., "valeris-trading")
4. Save
5. New URL: https://valeris-trading.netlify.app
```

**Note:** Old URL redirects automatically for a while

---

### Enable Deploy Previews (Recommended!)

**Automatically deploy every PR for testing:**
```
1. Site Settings → Build & deploy
2. Deploy contexts → Deploy previews
3. Enable "Any pull request..."
4. Save
```

**Now when you create a PR:**
- Netlify auto-deploys preview
- You get URL like: `deploy-preview-5--your-site.netlify.app`
- Test before merging!

---

## 📊 Monitoring Your Site

### Check Deploy Status
```
Dashboard → Deploys → Look for green ✅
```

### View Traffic (With Netlify Analytics - Paid)
```
Dashboard → Analytics → See visitors, page views
```

**OR use your FREE internal analytics:**
```
Your app → Admin Dashboard → Internal Analytics
```

### Check Uptime
```
Netlify Status: https://www.netlifystatus.com
```

Your site should have 99.9%+ uptime!

---

## 🚨 Troubleshooting

### Site Not Loading

**Check:**
1. Deploy status (should be green ✅)
2. Browser cache (hard refresh: Ctrl+Shift+R)
3. Netlify status page
4. Domain DNS (if using custom domain)

**Quick fix:**
```
Trigger new deploy → Clear cache
```

---

### Environment Variables Not Working

**Check:**
1. Variable name starts with `VITE_` (for frontend access)
2. Variable saved correctly (no trailing spaces)
3. New deploy triggered after adding
4. Hard refresh browser

**Fix:**
```
1. Update variable
2. Trigger deploy → Clear cache
3. Test in browser console:
   console.log(import.meta.env.VITE_SUPABASE_URL)
```

---

### Builds Failing

**Common causes:**
1. Missing dependency in package.json
2. TypeScript errors
3. Missing environment variable
4. Node version mismatch

**Fix:**
```
1. Test locally: npm run build
2. Fix errors in code
3. Push to GitHub
4. Check deploy log for specifics
```

---

### Custom Domain Not Working

**Check:**
1. DNS records are correct (A and CNAME)
2. Wait 5-30 min for DNS propagation
3. Check DNS: https://dnschecker.org
4. SSL certificate provisioned (auto)

**Fix:**
```
1. Verify DNS at registrar
2. Wait longer (up to 48 hours in rare cases)
3. Contact Netlify support if >48 hours
```

---

## 💡 Pro Tips

### 1. Enable Deploy Notifications
```
Site Settings → Build & deploy → Deploy notifications
```

Options:
- Email when deploy succeeds/fails
- Slack notifications
- Webhook for custom integrations

**Recommended:**
- Enable "Deploy failed" email notification
- You'll know immediately if something breaks

---

### 2. Use Branch Deploys for Testing
```
Site Settings → Build & deploy → Branch deploys
```

Enable deploys for `staging` or `dev` branches:
- Test features before production
- Each branch gets its own URL
- Perfect for QA testing

---

### 3. Speed Up Builds
```
Build command: npm run build
```

Already optimized in your netlify.toml!
- Builds take 2-3 minutes
- Cached dependencies speed up rebuilds

---

### 4. Monitor Build Minutes (Free Plan)
```
Team Settings → Billing → See usage
```

Free tier includes:
- 300 build minutes/month
- 100 GB bandwidth/month
- Unlimited sites

Your app uses ~2-3 min per deploy.
~100 deploys/month for free!

---

### 5. Downgrade Builds (If Slow)
```
Site Settings → Build & deploy → Build settings
```

If builds are slow:
- Clear build cache occasionally
- Check for heavy dependencies
- Consider upgrading Node version

---

## 🎯 Your Weekly Routine

### Every Day:
- Check deploy status (quick glance)
- Monitor your internal analytics
- Reply to user feedback

### Every Deploy:
```
1. Push code to GitHub
2. Check Netlify for green ✅
3. Test live site quickly
4. Monitor for errors (Sentry when set up)
```

### Every Week:
- Review deploy history
- Check build times
- Update dependencies if needed
- Back up database (Supabase)

### Every Month:
- Review bandwidth usage
- Check for unused features
- Update documentation
- Plan new features

---

## 📱 Mobile App (Netlify)

Your site is already mobile-optimized!

**To access on phone:**
```
1. Open browser on phone
2. Go to https://your-site-name.netlify.app
3. Add to home screen:
   - iOS: Share → Add to Home Screen
   - Android: Menu → Add to Home Screen
```

Works like a native app!

---

## 🆘 Getting Help

### Netlify Docs
https://docs.netlify.com

### Netlify Support
- Community: https://answers.netlify.com
- Twitter: @Netlify
- Email: support@netlify.com

### Your Internal Docs
- `DEPLOY_INSTRUCTIONS.md` - Deployment guide
- `QA_CHECKLIST.md` - Testing procedures
- `ANALYTICS_GUIDE.md` - Analytics help

---

## 🔐 Security Best Practices

### Keep Secrets Secret
- Never commit API keys to git
- Use environment variables
- Rotate keys if exposed

### Update Dependencies
```
npm outdated
npm update
```

Run monthly to stay secure.

### Enable HTTPS (Already Done!)
Netlify auto-enables HTTPS - nothing to do!

### Monitor for Issues
Set up Sentry this weekend for error tracking.

---

## 💰 Pricing (If You Grow)

### Free Tier (Your Current Plan)
- 300 build minutes/month
- 100 GB bandwidth/month
- Unlimited sites
- HTTPS included
- Deploy previews included

**Good for:**
- ~100 deploys/month
- ~10K-50K page views/month

### Pro ($19/mo)
- 1000 build minutes
- 1 TB bandwidth
- Priority support
- Team collaboration

**Upgrade when:**
- More than 100K page views/month
- Need faster builds
- Multiple team members

---

## 🎉 You're All Set!

### Quick Reference Card

**Deploy new version:**
```
git push → Auto-deploys in 2-3 min
```

**Update environment variable:**
```
Settings → Env vars → Add/Edit → Trigger deploy
```

**Rollback:**
```
Deploys → Click old deploy → Publish
```

**Custom domain:**
```
Domain settings → Add domain → Configure DNS
```

**View logs:**
```
Deploys → Click deploy → Scroll to logs
```

---

## 📍 Important URLs

**Your Dashboard:**
https://app.netlify.com/sites/YOUR-SITE-NAME

**Your Live Site:**
https://YOUR-SITE-NAME.netlify.app

**Netlify Status:**
https://www.netlifystatus.com

**Netlify Docs:**
https://docs.netlify.com

---

## ✅ Post-Deployment Checklist

After deploying, verify:
- [ ] Site loads correctly
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard displays
- [ ] Journal entry creation works
- [ ] Paper trading works
- [ ] All images load
- [ ] Mobile version works
- [ ] HTTPS is enabled (🔒 in browser)
- [ ] No console errors

---

**Questions? Check the docs or just try things - you can't break anything permanently! Every deploy is versioned and can be rolled back. 🚀**

**Your app is live and the world can use it. Congratulations! 🎉**
