/*
  # Fix Infinite Recursion in Profiles RLS Policy

  This migration fixes the infinite recursion error in the profiles table RLS policy.
  
  ## Problem
  The `profiles_select_policy` was querying the profiles table within its own policy check,
  causing infinite recursion.
  
  ## Solution
  1. Drop the problematic policy
  2. Create a simpler policy that allows users to view their own profile
  3. Keep the admin policy separate for admin access
  
  ## Changes
  - Drop `profiles_select_policy`
  - Create new simple policy for users to view their own profiles
*/

-- Drop the problematic policy with infinite recursion
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;

-- Create a simple policy for users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
