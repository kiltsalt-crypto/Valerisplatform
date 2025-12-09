/*
  # Add New Enhanced Features

  1. New Tables
    - `dashboard_stats` - Daily performance metrics
    - `notifications` - User notifications system
    - `trade_ideas` - Trade setups and strategies
    - `onboarding_status` - Track user onboarding
    - `subscription_tiers` - Pricing and feature access
    - `export_history` - Track PDF exports

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Dashboard Stats Table
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE NOT NULL,
  total_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  losing_trades integer DEFAULT 0,
  total_pnl decimal(10,2) DEFAULT 0,
  win_rate decimal(5,2) DEFAULT 0,
  best_trade decimal(10,2) DEFAULT 0,
  worst_trade decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dashboard stats"
  ON dashboard_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dashboard stats"
  ON dashboard_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard stats"
  ON dashboard_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trade Ideas Table
CREATE TABLE IF NOT EXISTS trade_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  instrument text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price decimal(10,2),
  target_price decimal(10,2),
  stop_loss decimal(10,2),
  timeframe text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  is_public boolean DEFAULT false,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trade_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade ideas"
  ON trade_ideas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own trade ideas"
  ON trade_ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trade ideas"
  ON trade_ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trade ideas"
  ON trade_ideas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Onboarding Status Table
CREATE TABLE IF NOT EXISTS onboarding_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  welcome_completed boolean DEFAULT false,
  profile_setup_completed boolean DEFAULT false,
  first_module_completed boolean DEFAULT false,
  first_trade_completed boolean DEFAULT false,
  tour_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding status"
  ON onboarding_status FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding status"
  ON onboarding_status FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding status"
  ON onboarding_status FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscription Tiers Table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'pro', 'elite')),
  features jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  auto_renew boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscription_tiers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscription_tiers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscription_tiers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Export History Table
CREATE TABLE IF NOT EXISTS export_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  export_type text NOT NULL CHECK (export_type IN ('journal', 'analytics', 'trades', 'full-report')),
  file_name text NOT NULL,
  date_range_start date,
  date_range_end date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own export history"
  ON export_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own export history"
  ON export_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_user_date ON dashboard_stats(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_ideas_public ON trade_ideas(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_export_history_user ON export_history(user_id, created_at DESC);