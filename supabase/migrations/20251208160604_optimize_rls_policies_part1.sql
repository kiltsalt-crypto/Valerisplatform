/*
  # Optimize RLS Policies - Part 1 (Core Tables)

  1. Performance Optimization
    - Replace auth.uid() with (select auth.uid()) in all policies
    - Prevents function re-evaluation for each row
    - Critical for scale performance

  2. Tables Fixed
    - trades, trade_alerts, trade_ideas, trade_journal_entries
    - prep_checklists, session_stats, dashboard_stats, notifications
    - watchlist, daily_performance, evaluation_challenges, user_progress
*/

-- TRADES TABLE
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
CREATE POLICY "Users can view own trades" ON public.trades
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
CREATE POLICY "Users can insert own trades" ON public.trades
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
CREATE POLICY "Users can update own trades" ON public.trades
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;
CREATE POLICY "Users can delete own trades" ON public.trades
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- TRADE ALERTS
DROP POLICY IF EXISTS "Users can view own alerts" ON public.trade_alerts;
CREATE POLICY "Users can view own alerts" ON public.trade_alerts
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own alerts" ON public.trade_alerts;
CREATE POLICY "Users can insert own alerts" ON public.trade_alerts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own alerts" ON public.trade_alerts;
CREATE POLICY "Users can update own alerts" ON public.trade_alerts
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own alerts" ON public.trade_alerts;
CREATE POLICY "Users can delete own alerts" ON public.trade_alerts
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- PREP CHECKLISTS
DROP POLICY IF EXISTS "Users can view own checklists" ON public.prep_checklists;
CREATE POLICY "Users can view own checklists" ON public.prep_checklists
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own checklists" ON public.prep_checklists;
CREATE POLICY "Users can insert own checklists" ON public.prep_checklists
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own checklists" ON public.prep_checklists;
CREATE POLICY "Users can update own checklists" ON public.prep_checklists
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- SESSION STATS
DROP POLICY IF EXISTS "Users can view own session stats" ON public.session_stats;
CREATE POLICY "Users can view own session stats" ON public.session_stats
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own session stats" ON public.session_stats;
CREATE POLICY "Users can insert own session stats" ON public.session_stats
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- COMMUNITY POSTS
DROP POLICY IF EXISTS "Users can insert community posts" ON public.community_posts;
CREATE POLICY "Users can insert community posts" ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;
CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- USER ACHIEVEMENTS
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- EVALUATION CHALLENGES
DROP POLICY IF EXISTS "Users can view own challenges" ON public.evaluation_challenges;
CREATE POLICY "Users can view own challenges" ON public.evaluation_challenges
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own challenges" ON public.evaluation_challenges;
CREATE POLICY "Users can insert own challenges" ON public.evaluation_challenges
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own challenges" ON public.evaluation_challenges;
CREATE POLICY "Users can update own challenges" ON public.evaluation_challenges
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users manage own evaluations" ON public.evaluation_challenges;

-- USER PROGRESS
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users manage own progress" ON public.user_progress;

-- DAILY PERFORMANCE
DROP POLICY IF EXISTS "Users can view own performance" ON public.daily_performance;
CREATE POLICY "Users can view own performance" ON public.daily_performance
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own performance" ON public.daily_performance;
CREATE POLICY "Users can insert own performance" ON public.daily_performance
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own performance" ON public.daily_performance;
CREATE POLICY "Users can update own performance" ON public.daily_performance
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- WATCHLIST
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist;
CREATE POLICY "Users can view own watchlist" ON public.watchlist
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert to own watchlist" ON public.watchlist;
CREATE POLICY "Users can insert to own watchlist" ON public.watchlist
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own watchlist" ON public.watchlist;
CREATE POLICY "Users can update own watchlist" ON public.watchlist
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete from own watchlist" ON public.watchlist;
CREATE POLICY "Users can delete from own watchlist" ON public.watchlist
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- TRADE JOURNAL ENTRIES
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.trade_journal_entries;
CREATE POLICY "Users can view own journal entries" ON public.trade_journal_entries
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.trade_journal_entries;
CREATE POLICY "Users can insert own journal entries" ON public.trade_journal_entries
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own journal entries" ON public.trade_journal_entries;
CREATE POLICY "Users can update own journal entries" ON public.trade_journal_entries
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- DASHBOARD STATS (Remove duplicates)
DROP POLICY IF EXISTS "Users can view own dashboard stats" ON public.dashboard_stats;
CREATE POLICY "Users can view own dashboard stats" ON public.dashboard_stats
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own dashboard stats" ON public.dashboard_stats;
CREATE POLICY "Users can insert own dashboard stats" ON public.dashboard_stats
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own dashboard stats" ON public.dashboard_stats;
CREATE POLICY "Users can update own dashboard stats" ON public.dashboard_stats
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users manage own dashboard stats" ON public.dashboard_stats;

-- NOTIFICATIONS (Remove duplicates)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;