# 🚀 Deploy Valeris in 5 Minutes

## Option 1: Netlify (Recommended - Easiest)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Valeris Trading Platform"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/valeris.git
git push -u origin main
```

### Step 2: Deploy to Netlify
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Netlify will auto-detect settings from `netlify.toml`
5. Add environment variables:
   - `VITE_SUPABASE_URL`: `https://ihvotremeyzwynqhhqzl.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodm90cmVtZXl6d3lucWhocXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTEyMjIsImV4cCI6MjA3OTU4NzIyMn0.6taB5h62LkNhYzXXpq5VPREPF4-rLyA5yGS7PNOoD-I`
6. Click "Deploy"

**Your app will be live in ~2 minutes!**

---

## Option 2: Vercel (Also Easy)

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables (same as Netlify)
5. Click "Deploy"

**Live in ~2 minutes!**

---

## Option 3: Manual Deploy (Any Host)

### Step 1: Build
```bash
npm run build
```

### Step 2: Upload
Upload the entire `dist/` folder to your hosting provider:
- **DigitalOcean App Platform**: Drag & drop the dist folder
- **AWS S3 + CloudFront**: Upload to S3 bucket
- **Traditional hosting**: Upload via FTP/SFTP

### Configure SPA Routing
Most hosts need to redirect all routes to `index.html`:
- **Nginx**: See `nginx.conf` in docs
- **Apache**: Use `.htaccess` file
- **Others**: Check host documentation for SPA support

---

## After Deployment Checklist

✅ **Test the live URL**
- Sign up with a test account
- Create a journal entry
- Test paper trading
- Check watchlist functionality

✅ **Set up custom domain** (Optional)
- Add CNAME record: `www` → `your-app.netlify.app`
- Add A record: `@` → Netlify IP
- Enable SSL (auto on Netlify/Vercel)

✅ **Configure DNS**
- Domain registrar: GoDaddy, Namecheap, Cloudflare
- Point to Netlify/Vercel nameservers
- Wait 5-30 minutes for DNS propagation

---

## Production URLs

Once deployed, you'll have:
- **Production**: `https://your-app.netlify.app`
- **Deploy Previews**: Automatic for every PR
- **Branch Deploys**: `https://branch-name--your-app.netlify.app`

---

## Environment Variables for Weekend

When you set up APIs this weekend, add these to Netlify:

**hCaptcha** (anti-bot):
- `VITE_HCAPTCHA_SITE_KEY`

**Sentry** (error monitoring):
- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ORG`
- `VITE_SENTRY_PROJECT`

**Broker APIs** (live trading):
- `VITE_ETRADE_CLIENT_ID`
- `VITE_SCHWAB_CLIENT_ID`

**Payments** (when ready):
- `VITE_STRIPE_PUBLISHABLE_KEY`

---

## Troubleshooting

### Build fails on Netlify
- Check Node version is 20+ in build settings
- Try: `npm install --legacy-peer-deps`

### Routes not working (404 errors)
- Verify SPA fallback is configured
- Check `netlify.toml` redirects are present

### Environment variables not working
- Restart deployment after adding env vars
- Check variable names start with `VITE_`
- Clear build cache and redeploy

### Supabase connection fails
- Verify CORS settings in Supabase dashboard
- Check API URL and anon key are correct
- Test connection in browser console

---

## Next Steps

1. **Deploy NOW** (5 minutes)
2. **Share URL with beta testers**
3. **Set up APIs this weekend**
4. **Announce launch next week**

---

**Need help?** Check Netlify docs or Vercel docs for detailed guides.
