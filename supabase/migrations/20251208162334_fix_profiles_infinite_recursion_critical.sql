/*
  # Fix Profiles Infinite Recursion - Critical Fix

  1. Problem
    - Profiles policy checks admin status by querying profiles table
    - This creates infinite recursion loop
    - Users cannot load their profile

  2. Solution
    - Simplify profiles SELECT policy
    - Users can only view their own profile
    - Remove admin self-referencing check
    - Create separate admin function if needed

  3. Security
    - Users can only view their own profile
    - Admins handled separately through admin_users table
*/

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Fix admin_users table policies (remove profile reference)
DROP POLICY IF EXISTS "Users can view own admin status" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update own settings" ON public.admin_users;

CREATE POLICY "Users can view own admin status" ON public.admin_users
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can update own settings" ON public.admin_users
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix support tickets - remove circular profile reference
DROP POLICY IF EXISTS "Users manage own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins view all tickets" ON public.support_tickets;

CREATE POLICY "Users manage own tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Create view-only policy for admin access via admin_users table
CREATE POLICY "Admins can view all tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

-- Fix support ticket replies - remove circular reference
DROP POLICY IF EXISTS "Users can view replies to own tickets" ON public.support_ticket_replies;
DROP POLICY IF EXISTS "Users can create replies to own tickets" ON public.support_ticket_replies;

CREATE POLICY "Users can view replies to own tickets" ON public.support_ticket_replies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = support_ticket_replies.ticket_id 
      AND support_tickets.user_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users and admins can create replies" ON public.support_ticket_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    (EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = support_ticket_replies.ticket_id 
      AND support_tickets.user_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    ))
  );

-- Fix support responses - remove circular reference
DROP POLICY IF EXISTS "Users view and respond to own ticket responses" ON public.support_responses;
DROP POLICY IF EXISTS "Users can view responses on their tickets" ON public.support_responses;
DROP POLICY IF EXISTS "Users can respond to their own tickets" ON public.support_responses;
DROP POLICY IF EXISTS "Admins can view all responses" ON public.support_responses;
DROP POLICY IF EXISTS "Admins can create responses" ON public.support_responses;

CREATE POLICY "Users view and respond to ticket responses" ON public.support_responses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = support_responses.ticket_id 
      AND support_tickets.user_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    (EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = support_responses.ticket_id 
      AND support_tickets.user_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    ))
  );

-- Fix user subscriptions - remove circular reference
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix user activity logs - remove circular reference
DROP POLICY IF EXISTS "Users view own activity" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.user_activity_logs;

CREATE POLICY "Users view own activity" ON public.user_activity_logs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins view all activity" ON public.user_activity_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

-- Fix audit logs - remove circular reference
DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Service role can manage audit logs" ON public.audit_logs
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

-- Fix email campaigns - remove circular reference
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.email_campaigns;

CREATE POLICY "Admins can manage campaigns" ON public.email_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

-- Fix achievements admin policy - remove circular reference
DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;

CREATE POLICY "Admins can manage achievements" ON public.achievements
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

-- Fix learning modules admin policy - remove circular reference (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learning_modules') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage learning modules" ON public.learning_modules';
    EXECUTE 'CREATE POLICY "Admins can manage learning modules" ON public.learning_modules FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (SELECT auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (SELECT auth.uid())))';
  END IF;
END $$;

-- Fix courses admin policy - remove circular reference (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses';
    EXECUTE 'CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (SELECT auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (SELECT auth.uid())))';
  END IF;
END $$;

-- Fix challenges admin policy - remove circular reference
DROP POLICY IF EXISTS "Admins can manage challenges" ON public.trading_challenges;

CREATE POLICY "Admins can manage challenges" ON public.trading_challenges
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

-- Fix blog posts admin policy - remove circular reference
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (
    author_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    author_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );