# Deploy to Netlify in 10 Minutes

Quick guide to get your app live RIGHT NOW (even without all APIs).

---

## What You Need

1. GitHub account (push your code if not already)
2. Netlify account (free) - https://netlify.com
3. Your Supabase URL and Anon Key (already in your .env file)

**That's it!** Everything else can be added later.

---

## Step 1: Push to GitHub (2 minutes)

If not done already:

```bash
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git remote add origin https://github.com/yourusername/valeris.git
git push -u origin main
```

---

## Step 2: Deploy to Netlify (5 minutes)

1. Go to https://netlify.com and sign up (use GitHub login)

2. Click **"Add new site"** > **"Import an existing project"**

3. Choose **GitHub** and authorize Netlify

4. Select your **Valeris repository**

5. Netlify auto-detects settings, verify:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click **"Show advanced"**

6. Add these environment variables:
   ```
   VITE_SUPABASE_URL=https://ihvotremeyzwynqhhqzl.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodm90cmVtZXl6d3lucWhocXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTEyMjIsImV4cCI6MjA3OTU4NzIyMn0.6taB5h62LkNhYzXXpq5VPREPF4-rLyA5yGS7PNOoD-I
   VITE_ENVIRONMENT=production
   ```

7. Click **"Deploy site"**

8. Wait 2-3 minutes... ☕

9. **Your app is LIVE!** 🎉

You'll get a URL like: `https://random-name-123456.netlify.app`

---

## Step 3: Test Your Site (3 minutes)

Visit your new URL and test:

- [ ] Site loads
- [ ] Sign up works (no captcha yet, that's ok)
- [ ] Log in works
- [ ] Dashboard loads
- [ ] Create a journal entry

**If it works, you're LIVE! Share it with friends!**

---

## Optional: Custom Domain (5 minutes)

If you have a domain:

1. In Netlify, go to **Site settings** > **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `app.valeris.io`)
4. Follow DNS instructions
5. SSL certificate auto-provisions in 5-10 minutes

---

## What Works Without APIs?

### ✅ Works Now
- User signup/login (Supabase auth)
- Trading journal
- Analytics dashboard
- Paper trading
- All charts and visualizations
- Goals and checklists
- Community features
- Education center
- Most features!

### ⚠️ Needs APIs (add this weekend)
- Email notifications (needs Resend)
- Bot protection (needs hCaptcha)
- Subscription payments (needs Stripe)
- E*TRADE/Schwab integration (needs broker APIs)
- Error tracking (needs Sentry)

**The app is fully functional without these!** Add them over the weekend.

---

## Adding Environment Variables Later

When you get your API keys:

1. Go to **Site settings** > **Environment variables**
2. Click **"Add a variable"**
3. Add each one:
   ```
   VITE_HCAPTCHA_SITE_KEY=your-key
   VITE_SENTRY_DSN=your-dsn
   VITE_STRIPE_PUBLISHABLE_KEY=your-key
   VITE_ETRADE_CLIENT_ID=your-key
   VITE_SCHWAB_CLIENT_ID=your-key
   ```
4. Click **"Save"**
5. Trigger a new deploy: **Deploys** > **Trigger deploy** > **Deploy site**

Changes go live in 2 minutes!

---

## Troubleshooting

**"Site won't build"**
- Check the deploy log in Netlify
- Make sure package.json is committed
- Verify Node version (should be 20)

**"Blank page after deploy"**
- Check browser console for errors
- Verify environment variables are set
- Check Supabase URL is correct

**"Can't sign up"**
- Check Supabase dashboard > Authentication > URL Configuration
- Add your Netlify URL to "Site URL"
- Add to "Redirect URLs"

---

## Next Steps

You're live! Now:

1. ✅ Share with 5 friends for testing
2. ✅ Get feedback
3. ✅ Fix any bugs
4. ⏰ Add APIs over the weekend (see WEEKEND_API_SETUP.md)
5. ⏰ Set up monitoring
6. ⏰ Start getting users!

---

## Alternative: Deploy to Vercel

Prefer Vercel? It's even faster:

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import from GitHub
4. Add same environment variables
5. Click **"Deploy"**
6. Live in 60 seconds! ⚡

Both platforms are great. Pick whichever you prefer.

---

**CONGRATULATIONS! YOU'RE LIVE! 🚀**

Now go share it with the world!
