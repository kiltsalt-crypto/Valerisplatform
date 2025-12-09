/*
  # Alerts & Automation Schema

  1. New Tables
    - `price_alerts` - Custom price alerts for instruments
    - `pattern_alerts` - Alerts based on AI-detected patterns
    - `alert_history` - History of triggered alerts
    - `automation_rules` - User-defined automation rules
    - `trade_imports` - Imported trades from brokers
    - `broker_connections` - Store broker API connection details

  2. Security
    - Enable RLS on all tables
    - Users can only access their own alerts and automation
*/

-- Price Alerts
CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  instrument text NOT NULL,
  alert_type text CHECK (alert_type IN ('above', 'below', 'crosses')),
  target_price numeric NOT NULL,
  is_active boolean DEFAULT true,
  notification_method text DEFAULT 'in_app' CHECK (notification_method IN ('in_app', 'email', 'both')),
  triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own price alerts"
  ON price_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create price alerts"
  ON price_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own price alerts"
  ON price_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own price alerts"
  ON price_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Pattern Alerts (AI-detected patterns)
CREATE TABLE IF NOT EXISTS pattern_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pattern_type text NOT NULL,
  description text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  related_trades jsonb DEFAULT '[]'::jsonb,
  recommendation text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pattern_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pattern alerts"
  ON pattern_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pattern alerts"
  ON pattern_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Alert History
CREATE TABLE IF NOT EXISTS alert_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  alert_id uuid,
  alert_type text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  acknowledged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alert history"
  ON alert_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alert history"
  ON alert_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Automation Rules
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rule_name text NOT NULL,
  trigger_type text CHECK (trigger_type IN ('trade_entry', 'trade_exit', 'pattern_detected', 'time_based', 'pnl_threshold')),
  conditions jsonb NOT NULL,
  actions jsonb NOT NULL,
  is_active boolean DEFAULT true,
  last_triggered timestamptz,
  trigger_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automation rules"
  ON automation_rules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create automation rules"
  ON automation_rules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automation rules"
  ON automation_rules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own automation rules"
  ON automation_rules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trade Imports
CREATE TABLE IF NOT EXISTS trade_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  import_source text NOT NULL,
  file_name text,
  total_records integer DEFAULT 0,
  successful_imports integer DEFAULT 0,
  failed_imports integer DEFAULT 0,
  error_log jsonb DEFAULT '[]'::jsonb,
  import_status text DEFAULT 'processing' CHECK (import_status IN ('processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trade_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade imports"
  ON trade_imports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create trade imports"
  ON trade_imports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Broker Connections
CREATE TABLE IF NOT EXISTS broker_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  broker_name text NOT NULL,
  connection_status text DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
  api_key_encrypted text,
  last_sync timestamptz,
  sync_frequency text DEFAULT 'manual' CHECK (sync_frequency IN ('manual', 'hourly', 'daily')),
  auto_import_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, broker_name)
);

ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own broker connections"
  ON broker_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create broker connections"
  ON broker_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own broker connections"
  ON broker_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own broker connections"
  ON broker_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_active ON price_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pattern_alerts_user_unread ON pattern_alerts(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_user_created ON alert_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_active ON automation_rules(user_id, is_active);
