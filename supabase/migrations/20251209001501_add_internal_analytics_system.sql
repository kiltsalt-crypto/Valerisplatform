/*
  # Internal Analytics System

  1. New Tables
    - `analytics_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `event_name` (text) - e.g., 'page_view', 'trade_created', 'course_started'
      - `event_properties` (jsonb) - flexible properties for each event
      - `session_id` (text) - group events by session
      - `user_agent` (text) - browser info
      - `ip_address` (inet) - anonymized IP
      - `created_at` (timestamptz)
    
    - `analytics_daily_stats`
      - `id` (uuid, primary key)
      - `date` (date) - unique per day
      - `total_users` (int)
      - `new_users` (int)
      - `active_users` (int)
      - `total_events` (int)
      - `trades_logged` (int)
      - `paper_trades` (int)
      - `revenue` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Only authenticated users can insert their own events
    - Only admins can view analytics data
    
  3. Indexes
    - Index on user_id for fast user queries
    - Index on event_name for event aggregation
    - Index on created_at for time-based queries
    - Index on date for daily stats queries
*/

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_properties jsonb DEFAULT '{}'::jsonb,
  session_id text,
  user_agent text,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Create daily stats table
CREATE TABLE IF NOT EXISTS analytics_daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_users int DEFAULT 0,
  new_users int DEFAULT 0,
  active_users int DEFAULT 0,
  total_events int DEFAULT 0,
  trades_logged int DEFAULT 0,
  paper_trades int DEFAULT 0,
  revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_stats_date ON analytics_daily_stats(date);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_stats ENABLE ROW LEVEL SECURITY;

-- Policies for analytics_events
CREATE POLICY "Users can insert own analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Policies for analytics_daily_stats
CREATE POLICY "Admins can view daily stats"
  ON analytics_daily_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert daily stats"
  ON analytics_daily_stats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update daily stats"
  ON analytics_daily_stats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Function to calculate daily stats (run via cron or manually)
CREATE OR REPLACE FUNCTION calculate_daily_analytics(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO analytics_daily_stats (
    date,
    total_users,
    new_users,
    active_users,
    total_events,
    trades_logged,
    paper_trades,
    revenue
  )
  VALUES (
    target_date,
    (SELECT COUNT(*) FROM profiles WHERE created_at::date <= target_date),
    (SELECT COUNT(*) FROM profiles WHERE created_at::date = target_date),
    (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE created_at::date = target_date),
    (SELECT COUNT(*) FROM analytics_events WHERE created_at::date = target_date),
    (SELECT COUNT(*) FROM journal_entries WHERE created_at::date = target_date),
    (SELECT COUNT(*) FROM paper_trades WHERE created_at::date = target_date),
    (SELECT COALESCE(SUM(amount), 0) FROM payment_history WHERE created_at::date = target_date AND status = 'succeeded')
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    total_users = EXCLUDED.total_users,
    new_users = EXCLUDED.new_users,
    active_users = EXCLUDED.active_users,
    total_events = EXCLUDED.total_events,
    trades_logged = EXCLUDED.trades_logged,
    paper_trades = EXCLUDED.paper_trades,
    revenue = EXCLUDED.revenue;
END;
$$;

-- Function to get popular events
CREATE OR REPLACE FUNCTION get_popular_events(days_back int DEFAULT 7)
RETURNS TABLE (
  event_name text,
  event_count bigint,
  unique_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.event_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT ae.user_id) as unique_users
  FROM analytics_events ae
  WHERE ae.created_at >= CURRENT_DATE - (days_back || ' days')::interval
  GROUP BY ae.event_name
  ORDER BY event_count DESC
  LIMIT 20;
END;
$$;

-- Function to get user retention
CREATE OR REPLACE FUNCTION get_user_retention(days_back int DEFAULT 30)
RETURNS TABLE (
  cohort_date date,
  total_users bigint,
  day_1 numeric,
  day_7 numeric,
  day_30 numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH cohorts AS (
    SELECT 
      created_at::date as cohort_date,
      COUNT(*) as total_users
    FROM profiles
    WHERE created_at >= CURRENT_DATE - (days_back || ' days')::interval
    GROUP BY created_at::date
  )
  SELECT 
    c.cohort_date,
    c.total_users,
    ROUND((COUNT(DISTINCT CASE WHEN ae.created_at::date = c.cohort_date + 1 THEN ae.user_id END)::numeric / c.total_users) * 100, 2) as day_1,
    ROUND((COUNT(DISTINCT CASE WHEN ae.created_at::date = c.cohort_date + 7 THEN ae.user_id END)::numeric / c.total_users) * 100, 2) as day_7,
    ROUND((COUNT(DISTINCT CASE WHEN ae.created_at::date = c.cohort_date + 30 THEN ae.user_id END)::numeric / c.total_users) * 100, 2) as day_30
  FROM cohorts c
  LEFT JOIN analytics_events ae ON ae.user_id IN (
    SELECT id FROM profiles WHERE created_at::date = c.cohort_date
  )
  GROUP BY c.cohort_date, c.total_users
  ORDER BY c.cohort_date DESC;
END;
$$;
