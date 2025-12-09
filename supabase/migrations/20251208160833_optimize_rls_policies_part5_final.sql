/*
  # Optimize RLS Policies - Part 5 (Final Batch)

  1. Performance Optimization
    - Continue fixing auth.uid() -> (select auth.uid())
    - Remove all remaining duplicate policies

  2. Tables Fixed
    - user_subscriptions, user_feature_usage, legal_acceptances
    - user_quiz_attempts, user_challenges, trading_streaks
    - competition_participants, support_tickets, profiles
    - admin_users, and all remaining tables
*/

-- USER SUBSCRIPTIONS (Remove duplicates, add admin check)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true)
  );

CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- USER FEATURE USAGE
DROP POLICY IF EXISTS "Users can view own feature usage" ON public.user_feature_usage;
CREATE POLICY "Users can view own feature usage" ON public.user_feature_usage
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own feature usage" ON public.user_feature_usage;
CREATE POLICY "Users can insert own feature usage" ON public.user_feature_usage
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own feature usage" ON public.user_feature_usage;
CREATE POLICY "Users can update own feature usage" ON public.user_feature_usage
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- LEGAL ACCEPTANCES
DROP POLICY IF EXISTS "Users can view own legal acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can view own legal acceptances" ON public.legal_acceptances
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own legal acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can insert own legal acceptances" ON public.legal_acceptances
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- USER QUIZ ATTEMPTS
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON public.user_quiz_attempts;
CREATE POLICY "Users can view own quiz attempts" ON public.user_quiz_attempts
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create quiz attempts" ON public.user_quiz_attempts;
CREATE POLICY "Users can create quiz attempts" ON public.user_quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- USER CHALLENGES
DROP POLICY IF EXISTS "Users can view own challenges" ON public.user_challenges;
CREATE POLICY "Users can view own challenges" ON public.user_challenges
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create challenges" ON public.user_challenges;
CREATE POLICY "Users can create challenges" ON public.user_challenges
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own challenges" ON public.user_challenges;
CREATE POLICY "Users can update own challenges" ON public.user_challenges
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADING STREAKS (Remove duplicates)
DROP POLICY IF EXISTS "Users can view own streaks" ON public.trading_streaks;
DROP POLICY IF EXISTS "Users can manage own streaks" ON public.trading_streaks;

CREATE POLICY "Users manage own streaks" ON public.trading_streaks
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- COMPETITION PARTICIPANTS
DROP POLICY IF EXISTS "Users can join competitions" ON public.competition_participants;
CREATE POLICY "Users can join competitions" ON public.competition_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own participation" ON public.competition_participants;
CREATE POLICY "Users can view own participation" ON public.competition_participants
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- SUPPORT TICKETS (Remove duplicates)
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins view all tickets" ON public.support_tickets;

CREATE POLICY "Users manage own tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true)
  )
  WITH CHECK (user_id = (SELECT auth.uid()));

-- SUPPORT TICKET REPLIES
DROP POLICY IF EXISTS "Users can view replies to own tickets" ON public.support_ticket_replies;
CREATE POLICY "Users can view replies to own tickets" ON public.support_ticket_replies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = support_ticket_replies.ticket_id 
      AND (support_tickets.user_id = (SELECT auth.uid()) OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
    )
  );

DROP POLICY IF EXISTS "Users can create replies to own tickets" ON public.support_ticket_replies;
CREATE POLICY "Users can create replies to own tickets" ON public.support_ticket_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = support_ticket_replies.ticket_id 
      AND (support_tickets.user_id = (SELECT auth.uid()) OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
    )
  );

-- SUPPORT RESPONSES (Remove duplicates)
DROP POLICY IF EXISTS "Users can view responses on their tickets" ON public.support_responses;
DROP POLICY IF EXISTS "Users can respond to their own tickets" ON public.support_responses;
DROP POLICY IF EXISTS "Admins can view all responses" ON public.support_responses;
DROP POLICY IF EXISTS "Admins can create responses" ON public.support_responses;

CREATE POLICY "Users view and respond to own ticket responses" ON public.support_responses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = support_responses.ticket_id 
      AND (support_tickets.user_id = (SELECT auth.uid()) OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = support_responses.ticket_id 
      AND (support_tickets.user_id = (SELECT auth.uid()) OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
    )
  );

-- PROFILES (Remove duplicates)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true)
  );

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ADMIN USERS
DROP POLICY IF EXISTS "Users can view own admin status" ON public.admin_users;
CREATE POLICY "Users can view own admin status" ON public.admin_users
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can update own settings" ON public.admin_users;
CREATE POLICY "Admins can update own settings" ON public.admin_users
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TWO FACTOR AUTH (Remove duplicates)
DROP POLICY IF EXISTS "Users view own 2FA" ON public.two_factor_auth;
DROP POLICY IF EXISTS "Users manage own 2FA" ON public.two_factor_auth;

CREATE POLICY "Users manage own 2FA" ON public.two_factor_auth
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- USER FOLLOWS
DROP POLICY IF EXISTS "Users manage follows" ON public.user_follows;
CREATE POLICY "Users manage follows" ON public.user_follows
  FOR ALL TO authenticated
  USING (follower_id = (SELECT auth.uid()))
  WITH CHECK (follower_id = (SELECT auth.uid()));

CREATE POLICY "Users can view all follows" ON public.user_follows
  FOR SELECT TO authenticated
  USING (true);

-- SHARED TRADES
DROP POLICY IF EXISTS "Public shared trades" ON public.shared_trades;
DROP POLICY IF EXISTS "Users create shared trades" ON public.shared_trades;

CREATE POLICY "Users manage own shared trades" ON public.shared_trades
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view public shared trades" ON public.shared_trades
  FOR SELECT TO authenticated
  USING (visibility = 'public' OR user_id = (SELECT auth.uid()));

-- TRADE COMMENTS
DROP POLICY IF EXISTS "Users create comments" ON public.trade_comments;
CREATE POLICY "Users manage own comments" ON public.trade_comments
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view comments" ON public.trade_comments
  FOR SELECT TO authenticated
  USING (true);

-- TRADE LIKES
DROP POLICY IF EXISTS "Users manage likes" ON public.trade_likes;
CREATE POLICY "Users manage likes" ON public.trade_likes
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- GENERATED REPORTS
DROP POLICY IF EXISTS "Users view own reports" ON public.generated_reports;
CREATE POLICY "Users view own reports" ON public.generated_reports
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- SCHEDULED REPORTS
DROP POLICY IF EXISTS "Users manage scheduled reports" ON public.scheduled_reports;
CREATE POLICY "Users manage scheduled reports" ON public.scheduled_reports
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- API KEYS
DROP POLICY IF EXISTS "Users manage API keys" ON public.api_keys;
CREATE POLICY "Users manage API keys" ON public.api_keys
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- WEBHOOK ENDPOINTS
DROP POLICY IF EXISTS "Users manage webhooks" ON public.webhook_endpoints;
CREATE POLICY "Users manage webhooks" ON public.webhook_endpoints
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- NOTIFICATION PREFERENCES
DROP POLICY IF EXISTS "Users view own notifications" ON public.notification_preferences;
CREATE POLICY "Users manage notification preferences" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));