/*
  # Fix Security Issues - Part 4: Consolidate Duplicate Policies (Batch 3)
  
  1. Security Improvements
    - Final batch of duplicate policy consolidation
  
  2. Tables Fixed (remaining tables)
    - shared_trade_ideas, shared_trades, strategy_marketplace
    - subscription_features, support_tickets, testimonials
    - trade_comments, trade_idea_comments, trade_idea_likes
    - trade_ideas, trading_challenges, trading_room_messages
    - user_activity_logs, user_follows, user_subscriptions, webinars
*/

-- Shared trade ideas: Consolidate three policies
DROP POLICY IF EXISTS "Anyone can view trade ideas" ON public.shared_trade_ideas;
DROP POLICY IF EXISTS "Users manage own trade ideas" ON public.shared_trade_ideas;

-- Shared trades: Keep public view
DROP POLICY IF EXISTS "Users manage own shared trades" ON public.shared_trades;

-- Strategy marketplace: Keep public view
DROP POLICY IF EXISTS "Sellers manage own strategies" ON public.strategy_marketplace;

-- Subscription features: Keep one policy
DROP POLICY IF EXISTS "Public can view subscription features" ON public.subscription_features;

-- Support tickets: Consolidate admin and user policies
DROP POLICY IF EXISTS "Users manage own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
CREATE POLICY "View support tickets"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (select auth.uid()))
  );

-- Testimonials: Keep one public policy
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;

-- Trade comments: Consolidate three policies
DROP POLICY IF EXISTS "Users manage own comments" ON public.trade_comments;
DROP POLICY IF EXISTS "View public comments" ON public.trade_comments;

-- Trade idea comments: Keep one policy
DROP POLICY IF EXISTS "Users manage own comments" ON public.trade_idea_comments;

-- Trade idea likes: Keep one policy
DROP POLICY IF EXISTS "Users manage trade idea likes" ON public.trade_idea_likes;

-- Trade ideas: Keep one policy
DROP POLICY IF EXISTS "Users manage own trade ideas" ON public.trade_ideas;

-- Trading challenges: Consolidate three policies
DROP POLICY IF EXISTS "Admins can manage challenges" ON public.trading_challenges;
DROP POLICY IF EXISTS "Public can view challenges" ON public.trading_challenges;

-- Trading room messages: Keep one policy
DROP POLICY IF EXISTS room_read ON public.trading_room_messages;

-- User activity logs: Consolidate admin and user policies
DROP POLICY IF EXISTS "Users view own activity" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Admins view all activity" ON public.user_activity_logs;
CREATE POLICY "View activity logs"
  ON public.user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (select auth.uid()))
  );

-- User follows: Keep one policy
DROP POLICY IF EXISTS "Users manage follows" ON public.user_follows;

-- User subscriptions: Consolidate admin and user policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
CREATE POLICY "View subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (select auth.uid()))
  );

-- Webinars: Keep one policy
DROP POLICY IF EXISTS "Public webinars" ON public.webinars;
