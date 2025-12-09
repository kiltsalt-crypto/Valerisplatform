/*
  # Optimize Remaining Policies and Add Security

  1. Performance Optimization
    - Fix remaining auth.uid() -> (select auth.uid())
    - Remove all remaining duplicate policies

  2. Security Enhancement
    - Add policies for tables with RLS but no policies
    - Consolidate duplicate policies for business tables

  3. Tables Fixed
    - payments, invoices, referrals, affiliate_payouts
    - user_activity_logs, feature_usage_analytics, user_sessions
    - user_experience, trading_challenges_active
    - audit_logs, email_campaigns
*/

-- PAYMENTS
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- INVOICES
DROP POLICY IF EXISTS "Users view own invoices" ON public.invoices;
CREATE POLICY "Users view own invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- REFERRALS
DROP POLICY IF EXISTS "Users view own referrals" ON public.referrals;
CREATE POLICY "Users view own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (referrer_id = (SELECT auth.uid()) OR referred_id = (SELECT auth.uid()));

-- REFERRAL EARNINGS
DROP POLICY IF EXISTS "Users view own earnings" ON public.referral_earnings;
CREATE POLICY "Users view own earnings" ON public.referral_earnings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.referrals 
      WHERE referrals.id = referral_earnings.referral_id 
      AND referrals.referrer_id = (SELECT auth.uid())
    )
  );

-- AFFILIATE PAYOUTS
DROP POLICY IF EXISTS "Users view own payouts" ON public.affiliate_payouts;
CREATE POLICY "Users view own payouts" ON public.affiliate_payouts
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- USER ACTIVITY LOGS
DROP POLICY IF EXISTS "Users view own activity" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.user_activity_logs;

CREATE POLICY "Users view own activity" ON public.user_activity_logs
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true)
  );

-- FEATURE USAGE ANALYTICS
DROP POLICY IF EXISTS "Users view own analytics" ON public.feature_usage_analytics;
CREATE POLICY "Users view own analytics" ON public.feature_usage_analytics
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- USER SESSIONS
DROP POLICY IF EXISTS "Users view own sessions" ON public.user_sessions;
CREATE POLICY "Users view own sessions" ON public.user_sessions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- USER EXPERIENCE
DROP POLICY IF EXISTS "Users view own XP" ON public.user_experience;
CREATE POLICY "Users manage own XP" ON public.user_experience
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADING CHALLENGES ACTIVE
DROP POLICY IF EXISTS "Users view own challenges" ON public.trading_challenges_active;
CREATE POLICY "Users manage own active challenges" ON public.trading_challenges_active
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- REPLAY SESSIONS (Remove duplicates)
DROP POLICY IF EXISTS "Users manage own replay sessions" ON public.replay_sessions;
DROP POLICY IF EXISTS "replay_policy" ON public.replay_sessions;

CREATE POLICY "Users manage own replay sessions" ON public.replay_sessions
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- CHART LAYOUTS
DROP POLICY IF EXISTS "Users manage own chart layouts" ON public.chart_layouts;
CREATE POLICY "Users manage own chart layouts" ON public.chart_layouts
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADE TEMPLATES
DROP POLICY IF EXISTS "Users manage own trade templates" ON public.trade_templates;
CREATE POLICY "Users manage own trade templates" ON public.trade_templates
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- WATCHLISTS
DROP POLICY IF EXISTS "Users manage own watchlists" ON public.watchlists;
CREATE POLICY "Users manage own watchlists" ON public.watchlists
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADE TAGS
DROP POLICY IF EXISTS "Users manage own trade tags" ON public.trade_tags;
CREATE POLICY "Users manage own trade tags" ON public.trade_tags
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- BACKTESTS
DROP POLICY IF EXISTS "Users manage own backtests" ON public.backtests;
CREATE POLICY "Users manage own backtests" ON public.backtests
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- RISK LIMITS
DROP POLICY IF EXISTS "Users manage own risk limits" ON public.risk_limits;
CREATE POLICY "Users manage own risk limits" ON public.risk_limits
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- PERFORMANCE REPORTS
DROP POLICY IF EXISTS "Users manage own performance reports" ON public.performance_reports;
CREATE POLICY "Users manage own performance reports" ON public.performance_reports
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- CHALLENGE PARTICIPANTS
DROP POLICY IF EXISTS "Users manage own challenge participations" ON public.challenge_participants;
CREATE POLICY "Users manage own challenge participations" ON public.challenge_participants
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- STRATEGY MARKETPLACE (Remove duplicates)
DROP POLICY IF EXISTS "Sellers manage own strategies" ON public.strategy_marketplace;
DROP POLICY IF EXISTS "Anyone can view active strategies" ON public.strategy_marketplace;

CREATE POLICY "Sellers manage own strategies" ON public.strategy_marketplace
  FOR ALL TO authenticated
  USING (seller_id = (SELECT auth.uid()))
  WITH CHECK (seller_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view active strategies" ON public.strategy_marketplace
  FOR SELECT TO authenticated
  USING (is_active = true OR seller_id = (SELECT auth.uid()));

-- PNL GOALS
DROP POLICY IF EXISTS "Users manage own pnl goals" ON public.pnl_goals;
CREATE POLICY "Users manage own pnl goals" ON public.pnl_goals
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- LIVE STREAMS (Remove duplicates)
DROP POLICY IF EXISTS "Streamers manage own streams" ON public.live_streams;
DROP POLICY IF EXISTS "Anyone can view live streams" ON public.live_streams;

CREATE POLICY "Streamers manage own streams" ON public.live_streams
  FOR ALL TO authenticated
  USING (streamer_id = (SELECT auth.uid()))
  WITH CHECK (streamer_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view live streams" ON public.live_streams
  FOR SELECT TO authenticated
  USING (true);

-- MENTOR SESSIONS
DROP POLICY IF EXISTS "Participants manage sessions" ON public.mentor_sessions;
CREATE POLICY "Participants manage sessions" ON public.mentor_sessions
  FOR ALL TO authenticated
  USING (mentor_id = (SELECT auth.uid()) OR mentee_id = (SELECT auth.uid()))
  WITH CHECK (mentor_id = (SELECT auth.uid()) OR mentee_id = (SELECT auth.uid()));

-- PERFORMANCE DATA
DROP POLICY IF EXISTS "performance_policy" ON public.performance_data;
CREATE POLICY "Users manage own performance data" ON public.performance_data
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADING STRATEGIES
DROP POLICY IF EXISTS "strategies_policy" ON public.trading_strategies;
CREATE POLICY "Users manage own strategies" ON public.trading_strategies
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- MARKET SCANS
DROP POLICY IF EXISTS "scans_policy" ON public.market_scans;
CREATE POLICY "Users manage own scans" ON public.market_scans
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADE SIMULATIONS
DROP POLICY IF EXISTS "simulations_policy" ON public.trade_simulations;
CREATE POLICY "Users manage own simulations" ON public.trade_simulations
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADING ROOM MESSAGES
DROP POLICY IF EXISTS "room_create" ON public.trading_room_messages;
CREATE POLICY "Users can send room messages" ON public.trading_room_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view room messages" ON public.trading_room_messages
  FOR SELECT TO authenticated
  USING (true);

-- CHECKLIST TEMPLATES
DROP POLICY IF EXISTS "checklist_policy" ON public.checklist_templates;
CREATE POLICY "Users manage own checklist templates" ON public.checklist_templates
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- MENTOR PROFILES
DROP POLICY IF EXISTS "mentor_read" ON public.mentor_profiles;
DROP POLICY IF EXISTS "mentor_write" ON public.mentor_profiles;

CREATE POLICY "Anyone can view mentor profiles" ON public.mentor_profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Mentors manage own profiles" ON public.mentor_profiles
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADING SIGNALS
DROP POLICY IF EXISTS "signals_policy" ON public.trading_signals;
CREATE POLICY "Users manage own signals" ON public.trading_signals
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- MARKET NEWS (Remove duplicates)
DROP POLICY IF EXISTS "Anyone can read market news" ON public.market_news;
DROP POLICY IF EXISTS "Service role can manage market news" ON public.market_news;

CREATE POLICY "Anyone can read market news" ON public.market_news
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Service role can manage market news" ON public.market_news
  FOR ALL TO service_role
  USING (true);

-- ==========================================
-- ADD POLICIES FOR TABLES WITH RLS BUT NO POLICIES
-- ==========================================

-- AUDIT LOGS - Only admins and service role
CREATE POLICY "Service role can manage audit logs" ON public.audit_logs
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

-- EMAIL CAMPAIGNS - Only admins
CREATE POLICY "Admins can manage campaigns" ON public.email_campaigns
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

-- EMAIL CAMPAIGN SENDS - Service role and admins
CREATE POLICY "Service role can manage campaign sends" ON public.email_campaign_sends
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Users can view own campaign sends" ON public.email_campaign_sends
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));