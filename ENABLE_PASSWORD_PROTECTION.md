# Enable Leaked Password Protection

## ⚠️ CRITICAL SECURITY FEATURE

Supabase Auth can prevent users from using compromised passwords by checking against the HaveIBeenPwned.org database. This feature is currently **DISABLED** and must be enabled before launch.

## Why This Matters

**The Risk:**
- Over 12 billion passwords have been exposed in data breaches
- Users often reuse passwords across multiple sites
- Compromised passwords are actively used in credential stuffing attacks
- Without protection, your users' accounts are vulnerable

**The Protection:**
- HaveIBeenPwned has cataloged passwords from major breaches
- This check happens server-side without exposing the actual password
- It uses k-anonymity to protect user privacy
- No performance impact on authentication

## How to Enable (5 Minutes)

### Step 1: Access Your Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. You'll need to be a project owner or admin

### Step 2: Navigate to Auth Settings
1. Click **Authentication** in the left sidebar
2. Click **Policies** tab (or look for Password Settings section)
3. Look for **Password Settings** or **Security** section

### Step 3: Enable the Feature
1. Find the setting labeled **"Check for leaked passwords"** or **"Prevent use of compromised passwords"**
2. Toggle it **ON**
3. Click **Save** or **Update**

### Step 4: Verify It's Working
1. Try signing up with a known compromised password like "password123"
2. You should see an error message preventing signup
3. This confirms the feature is active

## Alternative Location (If Not Found Above)

Some Supabase dashboard versions have this under:
- **Settings** > **Authentication** > **Password Protection**
- **Authentication** > **Configuration** > **Password Settings**
- **Project Settings** > **Auth** > **Password Policies**

## What This Does

### For New Signups:
- Checks password against HaveIBeenPwned during registration
- Rejects passwords found in known data breaches
- Shows clear error message to user
- Forces user to choose a secure password

### For Password Changes:
- Also checks when users change their password
- Prevents downgrade to compromised passwords
- Maintains security over time

### Privacy Protection:
- Uses k-anonymity protocol
- Only sends first 5 characters of password hash to API
- Receives list of matching hashes, checks locally
- Your users' actual passwords never leave your server

## Impact on User Experience

**Good Password (Allowed):**
```
User enters: "MySecure!Pass2024$Trading"
Result: ✓ Account created successfully
```

**Compromised Password (Blocked):**
```
User enters: "password123"
Result: ✗ Error: "This password has been found in a data breach"
User action: Must choose different password
```

## No Code Changes Required

This is a configuration setting only - no code changes needed in your application. The protection works automatically once enabled.

## Production Checklist

Before launching:
- [ ] Enable leaked password protection
- [ ] Test with compromised password
- [ ] Verify error message appears
- [ ] Update user documentation if needed
- [ ] Consider adding custom error message in UI

## Additional Recommendations

### 1. Password Requirements
Consider also enabling in Supabase dashboard:
- Minimum password length (recommend 12+ characters)
- Require uppercase, lowercase, numbers, special chars
- Password complexity score

### 2. Account Takeover Protection
Already implemented in your app:
- ✓ Two-factor authentication (2FA)
- ✓ Admin 2FA enforcement
- ✓ Rate limiting
- ✓ Session management

### 3. User Communication
Add to your terms/privacy policy:
- "We check passwords against known breaches for your security"
- "Your password is never exposed during this check"
- Link to HaveIBeenPwned for transparency

## Technical Details

### How k-Anonymity Works:
1. Your server hashes user's password with SHA-1
2. Sends first 5 hex characters to HaveIBeenPwned API
3. Receives ~500 hashes that match those 5 characters
4. Checks locally if full hash is in the returned list
5. Accepts or rejects password based on match

### Example:
```
Password: "password123"
SHA-1: 482c811da5d5b4bc6d497ffa98491e38
Send: "482c8" to API
Receive: List of ~500 hashes starting with "482c8"
Check: Is "482c811da5d5b4bc6d497ffa98491e38" in list?
Result: YES → Reject password
```

### API Endpoint:
```
GET https://api.pwnedpasswords.com/range/{first5chars}
```

## Performance

- **Latency:** ~100-200ms added to signup/password change
- **Availability:** 99.9% uptime from Cloudflare CDN
- **Fallback:** If API is down, Supabase allows password by default
- **Cost:** Free, no rate limits for reasonable use

## Support & Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [k-Anonymity Model](https://en.wikipedia.org/wiki/K-anonymity)

## Troubleshooting

**Can't find the setting?**
- Check your Supabase CLI version: `supabase --version`
- Update if needed: `npm install -g supabase`
- Or enable via dashboard (recommended)

**Setting keeps reverting?**
- Check project permissions
- Ensure you're saving changes
- Try in different browser

**Users complaining about rejected passwords?**
- This is working correctly!
- Educate users about password security
- Provide guidance on choosing secure passwords

## Status

🔴 **Currently Disabled** - Enable before production launch

✅ **Action Required:** Follow steps above to enable this critical security feature

## Next Steps

1. Enable leaked password protection (5 minutes)
2. Review other security settings in dashboard
3. Test authentication flow with compromised password
4. Document in your security policy
5. Launch with confidence!
