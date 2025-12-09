/*
  # Add Subscription Management and User Tier System

  ## Overview
  This migration creates a comprehensive subscription management system including user tiers,
  feature access control, and legal document tracking.

  ## New Tables
  
  ### `user_subscriptions`
  - `id` (uuid, primary key) - Unique subscription identifier
  - `user_id` (uuid, foreign key to auth.users) - User who owns the subscription
  - `tier` (text) - Subscription tier: 'free', 'pro', 'elite', 'mentorship'
  - `status` (text) - Subscription status: 'active', 'cancelled', 'expired', 'trial'
  - `trial_ends_at` (timestamptz) - When trial period ends
  - `current_period_start` (timestamptz) - Start of current billing period
  - `current_period_end` (timestamptz) - End of current billing period
  - `cancelled_at` (timestamptz) - When subscription was cancelled
  - `created_at` (timestamptz) - When subscription was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `subscription_features`
  - `id` (uuid, primary key) - Unique feature identifier
  - `tier` (text) - Which tier has access: 'free', 'pro', 'elite', 'mentorship'
  - `feature_key` (text) - Feature identifier (e.g., 'unlimited_journal', 'ai_coach')
  - `feature_name` (text) - Human-readable feature name
  - `limit_value` (integer) - Numeric limit if applicable (e.g., 100 for journal entries)
  - `created_at` (timestamptz) - When feature was added

  ### `user_feature_usage`
  - `id` (uuid, primary key) - Unique usage record identifier
  - `user_id` (uuid, foreign key to auth.users) - User who used the feature
  - `feature_key` (text) - Which feature was used
  - `usage_count` (integer) - How many times used
  - `reset_at` (timestamptz) - When usage counter resets (for monthly limits)
  - `created_at` (timestamptz) - When tracking started
  - `updated_at` (timestamptz) - Last update timestamp

  ### `legal_acceptances`
  - `id` (uuid, primary key) - Unique acceptance record
  - `user_id` (uuid, foreign key to auth.users) - User who accepted
  - `document_type` (text) - Type: 'terms', 'privacy', 'disclaimer'
  - `document_version` (text) - Version of document accepted (e.g., 'v1.0')
  - `ip_address` (text) - IP address of user when accepted
  - `accepted_at` (timestamptz) - When user accepted
  - `created_at` (timestamptz) - Record creation time

  ## Security
  - Enable RLS on all tables
  - Users can read their own subscription and usage data
  - Only authenticated users can access features
  - Legal acceptances are write-once, read-only for users
  - Admins need separate policies (to be added later)

  ## Indexes
  - Index on user_id for fast subscription lookups
  - Index on tier and status for analytics
  - Index on feature_key for access checks
*/

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite', 'mentorship')),
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '30 days'),
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create subscription_features table
CREATE TABLE IF NOT EXISTS subscription_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL CHECK (tier IN ('free', 'pro', 'elite', 'mentorship')),
  feature_key text NOT NULL,
  feature_name text NOT NULL,
  limit_value integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tier, feature_key)
);

-- Create user_feature_usage table
CREATE TABLE IF NOT EXISTS user_feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_key text NOT NULL,
  usage_count integer DEFAULT 0,
  reset_at timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_key)
);

-- Create legal_acceptances table
CREATE TABLE IF NOT EXISTS legal_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('terms', 'privacy', 'disclaimer')),
  document_version text NOT NULL DEFAULT 'v1.0',
  ip_address text,
  accepted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier_status ON user_subscriptions(tier, status);
CREATE INDEX IF NOT EXISTS idx_subscription_features_tier ON subscription_features(tier);
CREATE INDEX IF NOT EXISTS idx_subscription_features_key ON subscription_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_user_id ON user_feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_feature_key ON user_feature_usage(feature_key);
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user_id ON legal_acceptances(user_id);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_acceptances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscription_features (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view all features"
  ON subscription_features FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_feature_usage
CREATE POLICY "Users can view own feature usage"
  ON user_feature_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feature usage"
  ON user_feature_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feature usage"
  ON user_feature_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for legal_acceptances
CREATE POLICY "Users can view own legal acceptances"
  ON legal_acceptances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own legal acceptances"
  ON legal_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default feature configurations
INSERT INTO subscription_features (tier, feature_key, feature_name, limit_value) VALUES
  -- Free tier
  ('free', 'journal_entries', 'Trading Journal Entries', 10),
  ('free', 'paper_trading', 'Paper Trading', NULL),
  ('free', 'basic_analytics', 'Basic Analytics', NULL),
  ('free', 'community_forum', 'Community Forum', NULL),
  
  -- Pro tier
  ('pro', 'journal_entries', 'Trading Journal Entries', 100),
  ('pro', 'paper_trading', 'Paper Trading', NULL),
  ('pro', 'basic_analytics', 'Basic Analytics', NULL),
  ('pro', 'topstep_tracker', 'TopStep Tracker', NULL),
  ('pro', 'video_courses', 'Video Courses', 10),
  ('pro', 'community_forum', 'Community Forum', NULL),
  ('pro', 'risk_calculator', 'Risk Calculator', NULL),
  ('pro', 'economic_calendar', 'Economic Calendar', NULL),
  ('pro', 'daily_checklist', 'Daily Checklist', NULL),
  ('pro', 'single_chart', 'Single Chart View', NULL),
  
  -- Elite tier
  ('elite', 'journal_entries', 'Trading Journal Entries', NULL),
  ('elite', 'paper_trading', 'Paper Trading', NULL),
  ('elite', 'advanced_analytics', 'Advanced Analytics', NULL),
  ('elite', 'topstep_tracker', 'TopStep Tracker', NULL),
  ('elite', 'video_courses', 'Video Courses', NULL),
  ('elite', 'ai_coach', 'AI Trading Coach', NULL),
  ('elite', 'community_forum', 'Community Forum', NULL),
  ('elite', 'live_trading_room', 'Live Trading Room', NULL),
  ('elite', 'strategy_builder', 'Strategy Builder', NULL),
  ('elite', 'market_scanner', 'Market Scanner', NULL),
  ('elite', 'backtesting', 'Backtesting Engine', NULL),
  ('elite', 'trade_replay', 'Trade Replay', NULL),
  ('elite', 'multi_chart', 'Multi-Chart Layouts', NULL),
  ('elite', 'level2_data', 'Level 2 Data', NULL),
  ('elite', 'stock_comparison', 'Stock Comparison', NULL),
  ('elite', 'heat_maps', 'Heat Maps', NULL),
  ('elite', 'trade_templates', 'Trade Templates', NULL),
  ('elite', 'broker_integration', 'Broker Integration', NULL),
  ('elite', 'custom_alerts', 'Custom Alerts', NULL),
  ('elite', 'trading_challenges', 'Trading Challenges', NULL),
  ('elite', 'export_reports', 'Export Reports', NULL),
  ('elite', 'risk_calculator', 'Risk Calculator', NULL),
  ('elite', 'economic_calendar', 'Economic Calendar', NULL),
  ('elite', 'daily_checklist', 'Daily Checklist', NULL),
  
  -- Mentorship tier (all elite features plus)
  ('mentorship', 'journal_entries', 'Trading Journal Entries', NULL),
  ('mentorship', 'one_on_one_coaching', 'One-on-One Coaching', NULL),
  ('mentorship', 'weekly_review', 'Weekly Trade Review', NULL),
  ('mentorship', 'priority_support', 'Priority Support', NULL),
  ('mentorship', 'custom_strategies', 'Custom Strategy Development', NULL)
ON CONFLICT (tier, feature_key) DO NOTHING;

-- Function to automatically create subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, tier, status, trial_ends_at)
  VALUES (NEW.id, 'free', 'trial', now() + interval '7 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create subscription on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id uuid,
  p_feature_key text
)
RETURNS boolean AS $$
DECLARE
  v_user_tier text;
  v_feature_exists boolean;
BEGIN
  -- Get user's current tier
  SELECT tier INTO v_user_tier
  FROM user_subscriptions
  WHERE user_id = p_user_id
  AND status IN ('active', 'trial');
  
  -- Check if feature exists for user's tier
  SELECT EXISTS(
    SELECT 1 FROM subscription_features
    WHERE tier = v_user_tier
    AND feature_key = p_feature_key
  ) INTO v_feature_exists;
  
  RETURN v_feature_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and increment feature usage
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id uuid,
  p_feature_key text
)
RETURNS boolean AS $$
DECLARE
  v_user_tier text;
  v_limit integer;
  v_current_usage integer;
BEGIN
  -- Get user's tier
  SELECT tier INTO v_user_tier
  FROM user_subscriptions
  WHERE user_id = p_user_id
  AND status IN ('active', 'trial');
  
  -- Get feature limit for user's tier
  SELECT limit_value INTO v_limit
  FROM subscription_features
  WHERE tier = v_user_tier
  AND feature_key = p_feature_key;
  
  -- If no limit (NULL), feature is unlimited
  IF v_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Get current usage
  SELECT usage_count INTO v_current_usage
  FROM user_feature_usage
  WHERE user_id = p_user_id
  AND feature_key = p_feature_key
  AND reset_at > now();
  
  -- If no usage record, create one
  IF v_current_usage IS NULL THEN
    INSERT INTO user_feature_usage (user_id, feature_key, usage_count)
    VALUES (p_user_id, p_feature_key, 1);
    RETURN true;
  END IF;
  
  -- Check if under limit
  IF v_current_usage < v_limit THEN
    UPDATE user_feature_usage
    SET usage_count = usage_count + 1,
        updated_at = now()
    WHERE user_id = p_user_id
    AND feature_key = p_feature_key;
    RETURN true;
  END IF;
  
  -- Over limit
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;