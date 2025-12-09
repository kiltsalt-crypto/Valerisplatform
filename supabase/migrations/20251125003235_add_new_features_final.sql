/*
  # Add New Advanced Trading Features
  
  Tables: replay sessions, performance data, strategies, scans,
  simulations, trading room, checklists, economic events, mentors, signals
*/

-- Replay Sessions
CREATE TABLE IF NOT EXISTS replay_sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instrument text NOT NULL,
  replay_date date NOT NULL,
  starting_balance decimal NOT NULL DEFAULT 100000,
  ending_balance decimal NOT NULL,
  total_trades integer NOT NULL DEFAULT 0,
  pnl decimal NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE replay_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "replay_policy" ON replay_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Performance Data
CREATE TABLE IF NOT EXISTS performance_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trade_date date NOT NULL,
  pnl decimal NOT NULL DEFAULT 0,
  trades_count integer NOT NULL DEFAULT 0,
  winning_trades integer NOT NULL DEFAULT 0,
  losing_trades integer NOT NULL DEFAULT 0,
  win_rate decimal,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, trade_date)
);

ALTER TABLE performance_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "performance_policy" ON performance_data FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trading Strategies
CREATE TABLE IF NOT EXISTS trading_strategies (
  strategy_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  entry_conditions jsonb NOT NULL DEFAULT '[]',
  exit_conditions jsonb NOT NULL DEFAULT '[]',
  risk_per_trade decimal NOT NULL DEFAULT 1,
  max_daily_loss decimal NOT NULL DEFAULT 500,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trading_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "strategies_policy" ON trading_strategies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Market Scans
CREATE TABLE IF NOT EXISTS market_scans (
  scan_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scan_type text NOT NULL,
  timeframe text NOT NULL,
  filters jsonb DEFAULT '{}',
  results jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scans_policy" ON market_scans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trade Simulations
CREATE TABLE IF NOT EXISTS trade_simulations (
  simulation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_size decimal NOT NULL,
  entry_price decimal NOT NULL,
  stop_loss decimal NOT NULL,
  take_profit decimal NOT NULL,
  risk_percent decimal NOT NULL,
  direction text NOT NULL CHECK (direction IN ('long', 'short')),
  results jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trade_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "simulations_policy" ON trade_simulations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trading Room Messages
CREATE TABLE IF NOT EXISTS trading_room_messages (
  message_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text NOT NULL,
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'message' CHECK (message_type IN ('message', 'trade', 'alert')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trading_room_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "room_read" ON trading_room_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "room_create" ON trading_room_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Checklist Templates
CREATE TABLE IF NOT EXISTS checklist_templates (
  template_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_public boolean DEFAULT false,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_policy" ON checklist_templates FOR ALL TO authenticated USING (auth.uid() = user_id OR is_public = true) WITH CHECK (auth.uid() = user_id);

-- Economic Events
CREATE TABLE IF NOT EXISTS economic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date date NOT NULL,
  event_time time NOT NULL,
  event_name text NOT NULL,
  impact_level text NOT NULL CHECK (impact_level IN ('high', 'medium', 'low')),
  actual_value text,
  forecast_value text,
  previous_value text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE economic_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_read" ON economic_events FOR SELECT TO authenticated USING (true);

-- Mentor Profiles
CREATE TABLE IF NOT EXISTS mentor_profiles (
  mentor_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  title text NOT NULL,
  bio text,
  years_experience integer NOT NULL DEFAULT 0,
  specialties text[] DEFAULT '{}',
  hourly_rate decimal NOT NULL,
  is_available boolean DEFAULT true,
  rating decimal DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_sessions integer DEFAULT 0,
  win_rate decimal,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentor_read" ON mentor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "mentor_write" ON mentor_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trading Signals
CREATE TABLE IF NOT EXISTS trading_signals (
  signal_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  signal_type text NOT NULL,
  instrument text NOT NULL,
  condition_text text NOT NULL,
  trigger_price decimal NOT NULL,
  is_enabled boolean DEFAULT true,
  notification_channels text[] DEFAULT '{"push"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signals_policy" ON trading_signals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_replay_sessions_user ON replay_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_data_user_date ON performance_data(user_id, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_user ON trading_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_market_scans_user ON market_scans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_room_messages_time ON trading_room_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_economic_events_date ON economic_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_trading_signals_user ON trading_signals(user_id, is_enabled);
