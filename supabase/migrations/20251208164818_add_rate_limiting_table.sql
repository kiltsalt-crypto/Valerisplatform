/*
  # Add Rate Limiting Table

  1. New Tables
    - `rate_limits`
      - `id` (uuid, primary key)
      - `identifier` (text, index) - IP address or user ID
      - `endpoint` (text, index) - API endpoint being rate limited
      - `request_count` (integer) - Number of requests
      - `window_start` (timestamptz) - Start of current time window
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `rate_limits` table
    - Only edge functions can access this table (service role)
    - Add index for fast lookups by identifier and endpoint
    - Add automatic cleanup of old entries

  3. Notes
    - Used by edge functions to implement IP-based rate limiting
    - Prevents abuse and DDoS attacks
    - Configurable rate limits per endpoint
*/

CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(identifier, endpoint)
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only access"
  ON rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
  ON rate_limits(identifier, endpoint);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window 
  ON rate_limits(window_start);

CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < now() - interval '1 hour';
END;
$$;
