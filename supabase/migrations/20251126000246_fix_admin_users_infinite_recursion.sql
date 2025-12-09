/*
  # Fix Infinite Recursion in Admin Users RLS Policy

  This migration fixes the infinite recursion error in the admin_users table RLS policy.
  
  ## Problem
  The "Admins can view all admins" policy was querying the admin_users table within 
  its own policy check, causing infinite recursion.
  
  ## Solution
  1. Drop the problematic recursive policy
  2. Keep only the simple policy that allows users to view their own admin status
  3. Remove duplicate policies
  
  ## Changes
  - Drop "Admins can view all admins" policy (causes infinite recursion)
  - Drop duplicate "Users can check own admin status" policy
  - Keep only "Users can view own admin status" which is safe
*/

-- Drop the problematic policy with infinite recursion
DROP POLICY IF EXISTS "Admins can view all admins" ON admin_users;

-- Drop duplicate policy
DROP POLICY IF EXISTS "Users can check own admin status" ON admin_users;

-- The remaining policy "Users can view own admin status" is safe and sufficient:
-- Users can view their own admin status using: auth.uid() = user_id
