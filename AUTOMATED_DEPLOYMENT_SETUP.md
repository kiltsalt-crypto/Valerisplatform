# Automated Deployment Setup Guide

## Overview
Every time you push to your `main` or `master` branch, your app will automatically deploy to Netlify.

**NO MORE MANUAL DEPLOYMENTS!** Just push your code and it's live in 2-3 minutes.

## What's Already Set Up
- GitHub Actions workflows (already configured)
- Build pipeline (ready to go)
- Automated Netlify deployment (just needs tokens)

## Step 1: Configure GitHub Secrets

Go to your GitHub repository settings and add these secrets:

1. **VITE_SUPABASE_URL**
   ```
   https://ihvotremeyzwynqhhqzl.supabase.co
   ```

2. **VITE_SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodm90cmVtZXl6d3lucWhocXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTEyMjIsImV4cCI6MjA3OTU4NzIyMn0.6taB5h62LkNhYzXXpq5VPREPF4-rLyA5yGS7PNOoD-I
   ```

3. **NETLIFY_AUTH_TOKEN**
   - Go to https://app.netlify.com/user/applications#personal-access-tokens
   - Click "New access token"
   - Name it "GitHub Actions"
   - Copy the token and paste it here

4. **NETLIFY_SITE_ID**
   - Go to your Netlify site dashboard
   - Go to Site settings > General > Site details
   - Copy the "Site ID" (looks like: abc123-def456-ghi789)

### How to add GitHub Secrets:
1. Go to your GitHub repo
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret name and value

## Step 2: Configure Netlify Environment Variables

Go to your Netlify dashboard:

1. Select your site
2. Go to **Site settings** > **Environment variables**
3. Add these two variables:
   - `VITE_SUPABASE_URL` = `https://ihvotremeyzwynqhhqzl.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodm90cmVtZXl6d3lucWhocXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTEyMjIsImV4cCI6MjA3OTU4NzIyMn0.6taB5h62LkNhYzXXpq5VPREPF4-rLyA5yGS7PNOoD-I`

## Step 3: Configure Supabase Authentication

1. Go to https://supabase.com/dashboard/project/ihvotremeyzwynqhhqzl
2. Go to **Authentication** > **URL Configuration**
3. Add your Netlify URL to **Site URL**:
   - Example: `https://your-site-name.netlify.app`
4. Add to **Redirect URLs**:
   - `https://your-site-name.netlify.app/*`
   - `https://your-site-name.netlify.app/auth/callback`
   - `http://localhost:5173/*` (for local development)

## Step 4: Test the Setup

1. Make any small change to your code
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Test automated deployment"
   git push origin main
   ```
3. Go to GitHub **Actions** tab to watch the deployment
4. Once complete, visit your Netlify site and test login

## Why Your Login Might Not Work

If other users can login but you can't, try these:

### Option 1: Reset Your Password
1. Go to your Netlify site
2. Click "Forgot Password?"
3. Enter: `kiltsalt@gmail.com`
4. Check your email for reset link

### Option 2: Create New Password via Supabase
1. Go to Supabase Dashboard
2. Go to **Authentication** > **Users**
3. Find your user (kiltsalt@gmail.com)
4. Click the menu (•••) > **Reset password**
5. This will send you a reset email

### Option 3: Direct Password Update (Admin Method)
1. Go to Supabase SQL Editor
2. Run this query (replace YOUR_NEW_PASSWORD):
   ```sql
   UPDATE auth.users
   SET encrypted_password = crypt('YOUR_NEW_PASSWORD', gen_salt('bf'))
   WHERE email = 'kiltsalt@gmail.com';
   ```

## How It Works

- **Push to `main`** → Triggers GitHub Action
- **GitHub Action** → Builds your app with environment variables
- **Auto-deploys** → Deploys to Netlify
- **Done!** → Your site is live with latest changes

## Current Build Status

Check your deployment status:
- GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
- Netlify Deploys: Your Netlify dashboard > Deploys tab

## Troubleshooting

### Deployment fails
- Check GitHub Actions logs for errors
- Verify all secrets are set correctly
- Make sure you have the correct Netlify site ID

### Login still doesn't work
- Clear browser cache and cookies
- Try incognito/private browsing
- Check browser console for errors (F12)
- Verify Supabase redirect URLs include your Netlify URL

### Environment variables not working
- Redeploy after adding variables to Netlify
- Check that variable names match exactly (case-sensitive)
