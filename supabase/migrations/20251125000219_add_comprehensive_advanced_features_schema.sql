/*
  # Comprehensive Advanced Features Schema

  1. New Tables
    - chart_layouts - Save TradingView chart configurations
    - trade_templates - Reusable trade setups
    - watchlists - User instrument watchlists
    - trade_tags - Tags for organizing trades
    - backtests - Historical strategy testing results
    - replay_sessions - Trade replay practice sessions
    - broker_connections - API connections to brokers
    - risk_limits - User-defined risk parameters
    - performance_reports - Generated analytics reports
    - trading_challenges - Community competitions
    - strategy_marketplace - Buy/sell trading strategies
    - subscriptions - User subscription tiers
    - pnl_goals - Daily/weekly/monthly goals
    - audio_notes - Voice memos for trades
    - live_streams - Social streaming sessions
    - mentor_sessions - Private coaching bookings

  2. Updates to Existing Tables
    - profiles - Add theme preference, subscription tier
    - trades - Add tags, audio_note_url, quality_score

  3. Security - RLS enabled on all tables
*/

-- Update profiles for theme and subscription
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'theme') THEN
    ALTER TABLE profiles ADD COLUMN theme text DEFAULT 'dark';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_tier') THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier text DEFAULT 'basic';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_expires_at') THEN
    ALTER TABLE profiles ADD COLUMN subscription_expires_at timestamptz;
  END IF;
END $$;

-- Update trades table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'tags') THEN
    ALTER TABLE trades ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'audio_note_url') THEN
    ALTER TABLE trades ADD COLUMN audio_note_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'quality_score') THEN
    ALTER TABLE trades ADD COLUMN quality_score text;
  END IF;
END $$;

-- Chart Layouts
CREATE TABLE IF NOT EXISTS chart_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  instrument text NOT NULL,
  layout_data jsonb NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chart_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own chart layouts"
  ON chart_layouts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trade Templates
CREATE TABLE IF NOT EXISTS trade_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  instrument text NOT NULL,
  direction text NOT NULL,
  entry_rules text,
  exit_rules text,
  risk_amount numeric,
  position_size integer,
  stop_loss_points numeric,
  take_profit_points numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trade_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own trade templates"
  ON trade_templates FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Watchlists
CREATE TABLE IF NOT EXISTS watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'My Watchlist',
  instruments jsonb DEFAULT '[]'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own watchlists"
  ON watchlists FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trade Tags
CREATE TABLE IF NOT EXISTS trade_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#8b5cf6',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own trade tags"
  ON trade_tags FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Backtests
CREATE TABLE IF NOT EXISTS backtests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  strategy_description text,
  instrument text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  initial_capital numeric NOT NULL,
  final_capital numeric,
  total_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  losing_trades integer DEFAULT 0,
  win_rate numeric,
  profit_factor numeric,
  max_drawdown numeric,
  sharpe_ratio numeric,
  results_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE backtests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own backtests"
  ON backtests FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Replay Sessions
CREATE TABLE IF NOT EXISTS replay_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  instrument text NOT NULL,
  replay_date date NOT NULL,
  start_time time,
  end_time time,
  trades_taken integer DEFAULT 0,
  pnl numeric DEFAULT 0,
  notes text,
  session_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE replay_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own replay sessions"
  ON replay_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Broker Connections
CREATE TABLE IF NOT EXISTS broker_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  broker_name text NOT NULL,
  api_key_encrypted text,
  account_id text,
  connection_status text DEFAULT 'disconnected',
  last_sync_at timestamptz,
  auto_sync_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own broker connections"
  ON broker_connections FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Risk Limits
CREATE TABLE IF NOT EXISTS risk_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_daily_loss numeric,
  max_position_size numeric,
  max_open_positions integer,
  max_drawdown_percent numeric,
  daily_loss_alert_at numeric,
  auto_reduce_positions boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE risk_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own risk limits"
  ON risk_limits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Performance Reports
CREATE TABLE IF NOT EXISTS performance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  report_type text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  report_data jsonb NOT NULL,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own performance reports"
  ON performance_reports FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trading Challenges
CREATE TABLE IF NOT EXISTS trading_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  prize_pool numeric,
  entry_fee numeric DEFAULT 0,
  rules jsonb,
  status text DEFAULT 'upcoming',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trading_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
  ON trading_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Challenge Participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES trading_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  current_pnl numeric DEFAULT 0,
  rank integer,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own challenge participations"
  ON challenge_participants FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view challenge participants"
  ON challenge_participants FOR SELECT
  TO authenticated
  USING (true);

-- Strategy Marketplace
CREATE TABLE IF NOT EXISTS strategy_marketplace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text,
  strategy_data jsonb,
  performance_stats jsonb,
  total_sales integer DEFAULT 0,
  rating numeric,
  reviews_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE strategy_marketplace ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active strategies"
  ON strategy_marketplace FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Sellers manage own strategies"
  ON strategy_marketplace FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- P&L Goals
CREATE TABLE IF NOT EXISTS pnl_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  goal_type text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pnl_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pnl goals"
  ON pnl_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Live Streams
CREATE TABLE IF NOT EXISTS live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  stream_url text,
  status text DEFAULT 'scheduled',
  viewer_count integer DEFAULT 0,
  scheduled_start timestamptz,
  actual_start timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live streams"
  ON live_streams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Streamers manage own streams"
  ON live_streams FOR ALL
  TO authenticated
  USING (auth.uid() = streamer_id)
  WITH CHECK (auth.uid() = streamer_id);

-- Mentor Sessions
CREATE TABLE IF NOT EXISTS mentor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_date timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  price numeric,
  status text DEFAULT 'scheduled',
  meeting_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mentor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants manage sessions"
  ON mentor_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id)
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE INDEX IF NOT EXISTS idx_chart_layouts_user ON chart_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_backtests_user ON backtests(user_id);
CREATE INDEX IF NOT EXISTS idx_pnl_goals_user_status ON pnl_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON trading_challenges(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
