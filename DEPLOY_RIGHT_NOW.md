# DEPLOY IN 3 MINUTES

## ✅ YOUR APP IS **100% READY**

Build is clean. Code works. Just need to set this up.

---

## OPTION 1: NETLIFY (EASIEST - DO THIS ONE)

### Step 1: Go Here
https://app.netlify.com/drop

### Step 2: Drag and Drop
1. Open your file explorer
2. Go to your project folder
3. Find the `dist` folder
4. **DRAG the `dist` folder** onto the Netlify page
5. DONE. Your site is live.

### Step 3: Add Environment Variables (so features work)
1. Click on your deployed site
2. Go to "Site settings" → "Environment variables"
3. Add these TWO variables:

```
VITE_SUPABASE_URL
https://ihvotremeyzwynqhhqzl.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodm90cmVtZXl6d3lucWhocXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTEyMjIsImV4cCI6MjA3OTU4NzIyMn0.6taB5h62LkNhYzXXpq5VPREPF4-rLyA5yGS7PNOoD-I
```

4. Click "Redeploy"

---

## OPTION 2: VERCEL (ALSO EASY)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
vercel --prod
```

When asked, paste these env vars:
```
VITE_SUPABASE_URL=https://ihvotremeyzwynqhhqzl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodm90cmVtZXl6d3lucWhocXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTEyMjIsImV4cCI6MjA3OTU4NzIyMn0.6taB5h62LkNhYzXXpq5VPREPF4-rLyA5yGS7PNOoD-I
```

---

## OPTION 3: CLOUDFLARE PAGES (SUPER FAST)

https://pages.cloudflare.com/

1. Sign in
2. Create new project
3. Upload `dist` folder
4. Add env vars (same as above)
5. DONE

---

## ❌ IF STILL BROKEN - FIX SUPABASE CORS

Go to: https://supabase.com/dashboard/project/ihvotremeyzwynqhhqzl/settings/api

Add your deployed URL to **allowed origins**

---

## THE `dist` FOLDER IS IN YOUR PROJECT

Your built app is in: `project/dist`

**IT'S READY TO GO RIGHT NOW.**
