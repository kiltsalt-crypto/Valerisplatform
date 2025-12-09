/*
  # Add E*TRADE and Schwab Integration Tables

  ## Overview
  This migration adds tables needed for E*TRADE and Schwab broker integration.
  
  ## 1. Modifications to Existing Tables
  
  ### Update `broker_connections` table
  - Add new columns for OAuth integration
  - Add support for E*TRADE and Schwab specific fields
  
  ## 2. New Tables
  
  ### `broker_credentials`
  Securely stores encrypted OAuth tokens
  - `id` (uuid, primary key)
  - `connection_id` (uuid, references broker_connections)
  - `access_token_encrypted` (text) - Encrypted OAuth access token
  - `refresh_token_encrypted` (text) - Encrypted refresh token
  - `token_type` (text) - Bearer, OAuth, etc.
  - `scope` (text) - OAuth scopes
  - `expires_at` (timestamptz) - Token expiration
  
  ### `broker_sync_log`
  Tracks sync history
  - `id` (uuid, primary key)
  - `connection_id` (uuid, references broker_connections)
  - `sync_type` (text) - positions, orders, etc.
  - `status` (text) - success, failed, partial
  - `records_synced` (integer)
  - `error_message` (text)
  
  ### `broker_positions`
  Stores synced positions
  - `id` (uuid, primary key)
  - `connection_id` (uuid, references broker_connections)
  - `symbol`, `quantity`, `prices`, etc.
  
  ### `broker_orders`
  Stores synced orders
  - `id` (uuid, primary key)
  - `connection_id` (uuid, references broker_connections)
  - Order details and status
  
  ## 3. Security
  - All tables have RLS enabled
  - Credentials table is service-role only
  - Users can only access their own data
*/

-- Add columns to broker_connections if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_connections' AND column_name = 'account_id') THEN
    ALTER TABLE broker_connections ADD COLUMN account_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_connections' AND column_name = 'account_type') THEN
    ALTER TABLE broker_connections ADD COLUMN account_type text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_connections' AND column_name = 'expires_at') THEN
    ALTER TABLE broker_connections ADD COLUMN expires_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_connections' AND column_name = 'metadata') THEN
    ALTER TABLE broker_connections ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_connections' AND column_name = 'status') THEN
    ALTER TABLE broker_connections 
      ADD COLUMN status text DEFAULT 'disconnected',
      DROP COLUMN IF EXISTS connection_status;
  END IF;
END $$;

-- Create broker_credentials table
CREATE TABLE IF NOT EXISTS broker_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL UNIQUE REFERENCES broker_connections(id) ON DELETE CASCADE,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text,
  token_type text DEFAULT 'Bearer',
  scope text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create broker_sync_log table
CREATE TABLE IF NOT EXISTS broker_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,
  sync_type text NOT NULL,
  status text NOT NULL,
  records_synced integer DEFAULT 0,
  error_message text,
  synced_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_sync_type CHECK (sync_type IN ('positions', 'orders', 'transactions', 'balances', 'all')),
  CONSTRAINT valid_sync_status CHECK (status IN ('success', 'failed', 'partial'))
);

-- Create broker_positions table
CREATE TABLE IF NOT EXISTS broker_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  quantity numeric NOT NULL,
  average_price numeric NOT NULL,
  current_price numeric,
  market_value numeric,
  unrealized_pnl numeric,
  position_type text,
  synced_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_position_type CHECK (position_type IN ('long', 'short')),
  UNIQUE(connection_id, symbol)
);

-- Create broker_orders table
CREATE TABLE IF NOT EXISTS broker_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,
  broker_order_id text NOT NULL,
  symbol text NOT NULL,
  order_type text NOT NULL,
  side text NOT NULL,
  quantity numeric NOT NULL,
  price numeric,
  status text NOT NULL,
  filled_quantity numeric DEFAULT 0,
  average_fill_price numeric,
  placed_at timestamptz NOT NULL,
  filled_at timestamptz,
  synced_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_order_side CHECK (side IN ('buy', 'sell')),
  UNIQUE(connection_id, broker_order_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_broker_credentials_connection_id ON broker_credentials(connection_id);
CREATE INDEX IF NOT EXISTS idx_broker_sync_log_connection_id ON broker_sync_log(connection_id);
CREATE INDEX IF NOT EXISTS idx_broker_sync_log_synced_at ON broker_sync_log(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_broker_positions_connection_id ON broker_positions(connection_id);
CREATE INDEX IF NOT EXISTS idx_broker_positions_symbol ON broker_positions(symbol);
CREATE INDEX IF NOT EXISTS idx_broker_orders_connection_id ON broker_orders(connection_id);
CREATE INDEX IF NOT EXISTS idx_broker_orders_status ON broker_orders(status);
CREATE INDEX IF NOT EXISTS idx_broker_orders_placed_at ON broker_orders(placed_at DESC);

-- Enable RLS
ALTER TABLE broker_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for broker_credentials (service role only)
DROP POLICY IF EXISTS "Service role only access to credentials" ON broker_credentials;
CREATE POLICY "Service role only access to credentials"
  ON broker_credentials FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for broker_sync_log
DROP POLICY IF EXISTS "Users can view own sync logs" ON broker_sync_log;
CREATE POLICY "Users can view own sync logs"
  ON broker_sync_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM broker_connections
      WHERE broker_connections.id = broker_sync_log.connection_id
      AND broker_connections.user_id = auth.uid()
    )
  );

-- RLS Policies for broker_positions
DROP POLICY IF EXISTS "Users can view own broker positions" ON broker_positions;
CREATE POLICY "Users can view own broker positions"
  ON broker_positions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM broker_connections
      WHERE broker_connections.id = broker_positions.connection_id
      AND broker_connections.user_id = auth.uid()
    )
  );

-- RLS Policies for broker_orders
DROP POLICY IF EXISTS "Users can view own broker orders" ON broker_orders;
CREATE POLICY "Users can view own broker orders"
  ON broker_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM broker_connections
      WHERE broker_connections.id = broker_orders.connection_id
      AND broker_connections.user_id = auth.uid()
    )
  );

-- Update trigger for credentials
CREATE OR REPLACE FUNCTION update_broker_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_broker_credentials_updated_at ON broker_credentials;
CREATE TRIGGER update_broker_credentials_updated_at
  BEFORE UPDATE ON broker_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_broker_credentials_updated_at();