/*
  # Fix Security Issues - Part 2: Optimize RLS Policies
  
  1. Performance Improvements
    - Replace auth.uid() with (select auth.uid()) in RLS policies
    - This caches the auth function result instead of re-evaluating for each row
    - Significantly improves query performance at scale
  
  2. Policies Updated
    - broker_sync_log: Users can view own sync logs (via broker_connections join)
    - broker_positions: Users can view own broker positions (via broker_connections join)
    - broker_orders: Users can view own broker orders (via broker_connections join)
    - analytics_events: Admins can view all analytics events, Users can insert own analytics events
    - analytics_daily_stats: Admins can insert/update/view daily stats
*/

-- Drop and recreate broker_sync_log policy
DROP POLICY IF EXISTS "Users can view own sync logs" ON public.broker_sync_log;
CREATE POLICY "Users can view own sync logs"
  ON public.broker_sync_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.broker_connections
      WHERE broker_connections.id = broker_sync_log.connection_id
      AND broker_connections.user_id = (select auth.uid())
    )
  );

-- Drop and recreate broker_positions policy
DROP POLICY IF EXISTS "Users can view own broker positions" ON public.broker_positions;
CREATE POLICY "Users can view own broker positions"
  ON public.broker_positions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.broker_connections
      WHERE broker_connections.id = broker_positions.connection_id
      AND broker_connections.user_id = (select auth.uid())
    )
  );

-- Drop and recreate broker_orders policy
DROP POLICY IF EXISTS "Users can view own broker orders" ON public.broker_orders;
CREATE POLICY "Users can view own broker orders"
  ON public.broker_orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.broker_connections
      WHERE broker_connections.id = broker_orders.connection_id
      AND broker_connections.user_id = (select auth.uid())
    )
  );

-- Drop and recreate analytics_events policies
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;
CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own analytics events" ON public.analytics_events;
CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate analytics_daily_stats policies
DROP POLICY IF EXISTS "Admins can insert daily stats" ON public.analytics_daily_stats;
CREATE POLICY "Admins can insert daily stats"
  ON public.analytics_daily_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update daily stats" ON public.analytics_daily_stats;
CREATE POLICY "Admins can update daily stats"
  ON public.analytics_daily_stats
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view daily stats" ON public.analytics_daily_stats;
CREATE POLICY "Admins can view daily stats"
  ON public.analytics_daily_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );
