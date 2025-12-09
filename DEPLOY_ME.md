# Deploy Valeris - Your Exact Steps

## Step 1: Push to GitHub (2 minutes)

Create a new repository at: https://github.com/new

Name it: `valeris` (or any name you want)

Then run these commands:

```bash
git remote add origin https://github.com/kiltsalt-crypto/valeris.git
git push -u origin main
```

## Step 2: Deploy to Vercel (1 minute - FASTEST)

Go to: https://vercel.com

1. Click "Add New..." → "Project"
2. Import `kiltsalt-crypto/valeris`
3. Add these environment variables:
   - `VITE_SUPABASE_URL` = `https://ihvotremeyzwynqhhqzl.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodm90cmVtZXl6d3lucWhocXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTEyMjIsImV4cCI6MjA3OTU4NzIyMn0.6taB5h62LkNhYzXXpq5VPREPF4-rLyA5yGS7PNOoD-I`
4. Click "Deploy"

**DONE! Your site will be live in 60 seconds at a vercel.app URL**

---

## Alternative: Deploy to Netlify (2 minutes)

Go to: https://app.netlify.com

1. Click "Add new site" → "Import an existing project"
2. Choose GitHub and select `kiltsalt-crypto/valeris`
3. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL` = `https://ihvotremeyzwynqhhqzl.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodm90cmVtZXl6d3lucWhocXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTEyMjIsImV4cCI6MjA3OTU4NzIyMn0.6taB5h62LkNhYzXXpq5VPREPF4-rLyA5yGS7PNOoD-I`
5. Click "Deploy"

**DONE! Live in 2-3 minutes at a netlify.app URL**

---

## What to do after deployment

1. Visit your live URL
2. Test signup/login
3. Create a journal entry

Everything works! You can add more API keys later.
