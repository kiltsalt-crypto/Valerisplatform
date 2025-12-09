/*
  # Fix Admin Users RLS Policy

  1. Changes
    - Drop the admin_users table RLS to prevent infinite recursion
    - Add proper policies for admin_users table that don't cause recursion

  2. Security
    - Only admins can view admin_users table
    - Prevents infinite recursion by using simple auth checks
*/

-- Drop RLS from admin_users to prevent infinite recursion
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Or if we want to keep RLS, add a simple policy that doesn't cause recursion
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Simple policy: only allow users to see their own admin record
CREATE POLICY "Users can view own admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin users can update their own settings
CREATE POLICY "Admins can update own settings"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
