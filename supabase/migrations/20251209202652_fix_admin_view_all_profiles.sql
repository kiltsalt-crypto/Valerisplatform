/*
  # Fix Admin Access to View All Profiles
  
  ## Problem
  The current RLS policy only allows users to view their own profiles.
  This prevents admins from seeing other users in the admin dashboard.
  
  ## Solution
  Update the profiles SELECT policy to allow admins (users in admin_users table)
  to view all profiles while regular users can only view their own.
  
  ## Changes
  - Drop existing "Users can view own profile" policy
  - Create new policy that allows:
    1. Users to view their own profile
    2. Admins (users in admin_users table) to view all profiles
*/

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new policy that allows admins to view all profiles
CREATE POLICY "Users can view own profile or admins can view all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );
