/*
  # Advanced Analytics Schema

  1. New Tables
    - `trading_sessions` - Track trading sessions for pattern analysis
    - `performance_metrics` - Daily/weekly/monthly aggregated metrics
    - `correlation_analysis` - Track correlation between instruments
    - `drawdown_periods` - Record significant drawdown periods
    - `time_analysis` - Best/worst trading times analysis
    - `expectancy_data` - Trade expectancy calculations

  2. Security
    - Enable RLS on all tables
    - Users can only access their own analytics data
*/

-- Trading Sessions
CREATE TABLE IF NOT EXISTS trading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_date date NOT NULL,
  start_time time,
  end_time time,
  total_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  losing_trades integer DEFAULT 0,
  total_pnl numeric DEFAULT 0,
  largest_win numeric DEFAULT 0,
  largest_loss numeric DEFAULT 0,
  emotional_state text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trading sessions"
  ON trading_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create trading sessions"
  ON trading_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trading sessions"
  ON trading_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Performance Metrics (aggregated data)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  period_type text CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  losing_trades integer DEFAULT 0,
  win_rate numeric DEFAULT 0,
  total_pnl numeric DEFAULT 0,
  avg_win numeric DEFAULT 0,
  avg_loss numeric DEFAULT 0,
  profit_factor numeric DEFAULT 0,
  sharpe_ratio numeric DEFAULT 0,
  max_drawdown numeric DEFAULT 0,
  max_consecutive_wins integer DEFAULT 0,
  max_consecutive_losses integer DEFAULT 0,
  best_instrument text,
  worst_instrument text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_type, period_start)
);

ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance metrics"
  ON performance_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create performance metrics"
  ON performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance metrics"
  ON performance_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Correlation Analysis
CREATE TABLE IF NOT EXISTS correlation_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  instrument_a text NOT NULL,
  instrument_b text NOT NULL,
  correlation_coefficient numeric,
  sample_size integer DEFAULT 0,
  analysis_period_days integer DEFAULT 30,
  last_calculated timestamptz DEFAULT now(),
  UNIQUE(user_id, instrument_a, instrument_b)
);

ALTER TABLE correlation_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own correlation analysis"
  ON correlation_analysis FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create correlation analysis"
  ON correlation_analysis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own correlation analysis"
  ON correlation_analysis FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drawdown Periods
CREATE TABLE IF NOT EXISTS drawdown_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date,
  peak_balance numeric NOT NULL,
  trough_balance numeric NOT NULL,
  drawdown_amount numeric NOT NULL,
  drawdown_percentage numeric NOT NULL,
  recovery_date date,
  trades_during_drawdown integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE drawdown_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drawdown periods"
  ON drawdown_periods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create drawdown periods"
  ON drawdown_periods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drawdown periods"
  ON drawdown_periods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Time Analysis (best/worst hours, days of week)
CREATE TABLE IF NOT EXISTS time_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  analysis_type text CHECK (analysis_type IN ('hour_of_day', 'day_of_week', 'week_of_month')),
  time_value text NOT NULL,
  total_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  total_pnl numeric DEFAULT 0,
  avg_pnl numeric DEFAULT 0,
  win_rate numeric DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id, analysis_type, time_value)
);

ALTER TABLE time_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time analysis"
  ON time_analysis FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create time analysis"
  ON time_analysis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time analysis"
  ON time_analysis FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Expectancy Data
CREATE TABLE IF NOT EXISTS expectancy_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  instrument text,
  strategy text,
  total_trades integer DEFAULT 0,
  win_rate numeric DEFAULT 0,
  avg_win numeric DEFAULT 0,
  avg_loss numeric DEFAULT 0,
  expectancy numeric DEFAULT 0,
  expectancy_per_dollar numeric DEFAULT 0,
  profit_factor numeric DEFAULT 0,
  last_calculated timestamptz DEFAULT now(),
  UNIQUE(user_id, instrument, strategy)
);

ALTER TABLE expectancy_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expectancy data"
  ON expectancy_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create expectancy data"
  ON expectancy_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expectancy data"
  ON expectancy_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trading_sessions_user_date ON trading_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_period ON performance_metrics(user_id, period_type, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_drawdown_periods_user ON drawdown_periods(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_time_analysis_user ON time_analysis(user_id, analysis_type);
