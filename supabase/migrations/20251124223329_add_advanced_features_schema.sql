/*
  # Advanced Trading Features Schema

  ## Overview
  This migration adds comprehensive features for journaling, achievements, challenges,
  economic calendar, alerts, and community features.

  ## New Tables

  ### 1. `trade_journal_entries`
  Enhanced journal entries with emotions and screenshots
  - `id` (uuid) - Entry identifier
  - `user_id` (uuid, FK to profiles) - User who created entry
  - `trade_id` (uuid, FK to trades) - Associated trade
  - `screenshot_url` (text) - Chart screenshot URL
  - `setup_type` (text) - Type of setup used
  - `emotion_before` (text) - Emotional state before trade
  - `emotion_after` (text) - Emotional state after trade
  - `what_went_right` (text) - Positive aspects
  - `what_went_wrong` (text) - Mistakes made
  - `lessons_learned` (text) - Key takeaways
  - `would_take_again` (boolean) - Would repeat this trade
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. `achievements`
  Achievement definitions
  - `id` (uuid) - Achievement identifier
  - `name` (text) - Achievement name
  - `description` (text) - Achievement description
  - `icon` (text) - Icon identifier
  - `criteria` (text) - How to earn it
  - `points` (integer) - Points awarded
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `user_achievements`
  User achievement tracking
  - `id` (uuid) - Record identifier
  - `user_id` (uuid, FK to profiles) - User who earned achievement
  - `achievement_id` (uuid, FK to achievements) - Achievement earned
  - `earned_at` (timestamptz) - When earned
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `evaluation_challenges`
  Mock evaluation challenges
  - `id` (uuid) - Challenge identifier
  - `user_id` (uuid, FK to profiles) - User in challenge
  - `challenge_type` (text) - topstep_50k, topstep_100k, apex_50k, etc
  - `start_date` (date) - Challenge start date
  - `end_date` (date) - Challenge end date
  - `starting_balance` (numeric) - Starting capital
  - `current_balance` (numeric) - Current balance
  - `profit_target` (numeric) - Required profit
  - `max_loss` (numeric) - Maximum loss allowed
  - `daily_loss_limit` (numeric) - Daily loss limit
  - `min_trading_days` (integer) - Minimum days required
  - `days_traded` (integer) - Days traded so far
  - `status` (text) - active, passed, failed
  - `rules_broken` (text[]) - Array of rule violations
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. `economic_events`
  Economic calendar events
  - `id` (uuid) - Event identifier
  - `event_date` (timestamptz) - Event date and time
  - `event_name` (text) - Event name
  - `country` (text) - Country code
  - `impact` (text) - high, medium, low
  - `actual` (text) - Actual result
  - `forecast` (text) - Forecasted result
  - `previous` (text) - Previous result
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. `trade_alerts`
  User-defined trade alerts
  - `id` (uuid) - Alert identifier
  - `user_id` (uuid, FK to profiles) - User who created alert
  - `symbol` (text) - Symbol to watch
  - `alert_type` (text) - price, pattern, indicator
  - `condition` (text) - Alert condition
  - `target_value` (numeric) - Target price/value
  - `is_active` (boolean) - Alert is active
  - `triggered_at` (timestamptz) - When alert triggered
  - `created_at` (timestamptz) - Creation timestamp

  ### 7. `prep_checklists`
  Pre-market preparation checklists
  - `id` (uuid) - Checklist identifier
  - `user_id` (uuid, FK to profiles) - User's checklist
  - `date` (date) - Trading date
  - `market_bias` (text) - Bullish, bearish, neutral
  - `key_levels` (text) - Important price levels
  - `news_events` (text) - Key news to watch
  - `trading_plan` (text) - Plan for the day
  - `mental_state` (integer) - 1-10 rating
  - `ready_to_trade` (boolean) - Ready or not
  - `created_at` (timestamptz) - Creation timestamp

  ### 8. `session_stats`
  Trading session statistics
  - `id` (uuid) - Stats identifier
  - `user_id` (uuid, FK to profiles) - User identifier
  - `date` (date) - Session date
  - `session_type` (text) - morning, afternoon, evening
  - `trades_count` (integer) - Number of trades
  - `profit_loss` (numeric) - Session P/L
  - `win_rate` (numeric) - Session win rate
  - `best_trade` (numeric) - Best trade of session
  - `worst_trade` (numeric) - Worst trade of session
  - `created_at` (timestamptz) - Creation timestamp

  ### 9. `community_posts`
  Community discussion posts
  - `id` (uuid) - Post identifier
  - `user_id` (uuid, FK to profiles) - Author
  - `title` (text) - Post title
  - `content` (text) - Post content
  - `category` (text) - wins, losses, questions, insights
  - `is_anonymous` (boolean) - Anonymous post
  - `likes_count` (integer) - Number of likes
  - `created_at` (timestamptz) - Creation timestamp

  ### 10. `leaderboard_entries`
  Leaderboard tracking
  - `id` (uuid) - Entry identifier
  - `user_id` (uuid, FK to profiles) - User identifier
  - `period` (text) - daily, weekly, monthly, all_time
  - `metric` (text) - consistency, discipline, win_rate
  - `score` (numeric) - Score value
  - `rank` (integer) - Current rank
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_at` (timestamptz) - Creation timestamp

  ### 11. `video_lessons`
  Video lesson library
  - `id` (uuid) - Video identifier
  - `title` (text) - Video title
  - `description` (text) - Video description
  - `video_url` (text) - Video URL
  - `thumbnail_url` (text) - Thumbnail URL
  - `category` (text) - Category
  - `duration_seconds` (integer) - Video duration
  - `order_index` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp

  ### 12. `user_video_progress`
  User video watching progress
  - `id` (uuid) - Progress identifier
  - `user_id` (uuid, FK to profiles) - User identifier
  - `video_id` (uuid, FK to video_lessons) - Video identifier
  - `completed` (boolean) - Watched fully
  - `last_position` (integer) - Last watched second
  - `completed_at` (timestamptz) - Completion timestamp
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Community posts readable by all authenticated users
  - Achievements and video lessons readable by all

  ## Indexes
  - Optimized for common queries
  - Foreign key indexes
  - Date-based indexes for performance
*/

-- Trade journal entries
CREATE TABLE IF NOT EXISTS trade_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  trade_id uuid REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  screenshot_url text,
  setup_type text,
  emotion_before text,
  emotion_after text,
  what_went_right text,
  what_went_wrong text,
  lessons_learned text,
  would_take_again boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  criteria text NOT NULL,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Evaluation challenges
CREATE TABLE IF NOT EXISTS evaluation_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_type text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  starting_balance numeric NOT NULL,
  current_balance numeric NOT NULL,
  profit_target numeric NOT NULL,
  max_loss numeric NOT NULL,
  daily_loss_limit numeric NOT NULL,
  min_trading_days integer DEFAULT 5,
  days_traded integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'passed', 'failed')),
  rules_broken text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Economic events
CREATE TABLE IF NOT EXISTS economic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date timestamptz NOT NULL,
  event_name text NOT NULL,
  country text NOT NULL,
  impact text NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
  actual text,
  forecast text,
  previous text,
  created_at timestamptz DEFAULT now()
);

-- Trade alerts
CREATE TABLE IF NOT EXISTS trade_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  alert_type text NOT NULL,
  condition text NOT NULL,
  target_value numeric,
  is_active boolean DEFAULT true,
  triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Prep checklists
CREATE TABLE IF NOT EXISTS prep_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  market_bias text,
  key_levels text,
  news_events text,
  trading_plan text,
  mental_state integer CHECK (mental_state BETWEEN 1 AND 10),
  ready_to_trade boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Session stats
CREATE TABLE IF NOT EXISTS session_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  session_type text NOT NULL,
  trades_count integer DEFAULT 0,
  profit_loss numeric DEFAULT 0,
  win_rate numeric DEFAULT 0,
  best_trade numeric DEFAULT 0,
  worst_trade numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  is_anonymous boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Leaderboard entries
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  period text NOT NULL,
  metric text NOT NULL,
  score numeric DEFAULT 0,
  rank integer,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period, metric)
);

-- Video lessons
CREATE TABLE IF NOT EXISTS video_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  category text NOT NULL,
  duration_seconds integer DEFAULT 0,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User video progress
CREATE TABLE IF NOT EXISTS user_video_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES video_lessons(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  last_position integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE trade_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_video_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Trade journal entries
CREATE POLICY "Users can view own journal entries"
  ON trade_journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON trade_journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON trade_journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievements (read-only for all)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- User achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Evaluation challenges
CREATE POLICY "Users can view own challenges"
  ON evaluation_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON evaluation_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON evaluation_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Economic events (read-only for all)
CREATE POLICY "Anyone can view economic events"
  ON economic_events FOR SELECT
  TO authenticated
  USING (true);

-- Trade alerts
CREATE POLICY "Users can view own alerts"
  ON trade_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON trade_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON trade_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON trade_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Prep checklists
CREATE POLICY "Users can view own checklists"
  ON prep_checklists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklists"
  ON prep_checklists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists"
  ON prep_checklists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Session stats
CREATE POLICY "Users can view own session stats"
  ON session_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session stats"
  ON session_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Community posts (all can read, only author can update/delete)
CREATE POLICY "Anyone can view community posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert community posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Leaderboard entries (all can read)
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (true);

-- Video lessons (read-only for all)
CREATE POLICY "Anyone can view video lessons"
  ON video_lessons FOR SELECT
  TO authenticated
  USING (true);

-- User video progress
CREATE POLICY "Users can view own video progress"
  ON user_video_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video progress"
  ON user_video_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video progress"
  ON user_video_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON trade_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_trade_id ON trade_journal_entries(trade_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_challenges_user_id ON evaluation_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_challenges_status ON evaluation_challenges(status);
CREATE INDEX IF NOT EXISTS idx_economic_events_date ON economic_events(event_date);
CREATE INDEX IF NOT EXISTS idx_trade_alerts_user_id ON trade_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_alerts_active ON trade_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_prep_checklists_user_date ON prep_checklists(user_id, date);
CREATE INDEX IF NOT EXISTS idx_session_stats_user_date ON session_stats(user_id, date);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period_metric ON leaderboard_entries(period, metric);
CREATE INDEX IF NOT EXISTS idx_user_video_progress_user_id ON user_video_progress(user_id);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, criteria, points) VALUES
  ('First Trade', 'Execute your first paper trade', 'rocket', 'Complete 1 trade', 10),
  ('Consistent Trader', 'Trade for 10 consecutive days', 'calendar', 'Trade 10 days in a row', 50),
  ('Disciplined Mind', 'Honor your stop loss 10 times', 'shield', 'Hit 10 stop losses without moving them', 100),
  ('Profitable Week', 'End the week in profit', 'trending-up', 'Positive P/L for one week', 75),
  ('Risk Manager', 'Complete 20 trades with proper risk management', 'check-circle', '20 trades with 1% risk or less', 150),
  ('Pattern Master', 'Identify and trade 5 different setups', 'target', 'Trade 5 unique patterns', 100),
  ('Journal Keeper', 'Journal 30 trades with detailed notes', 'book-open', 'Complete 30 journal entries', 200),
  ('Century Club', 'Complete 100 trades', 'award', 'Execute 100 trades', 500),
  ('Profit Target', 'Achieve 10% account growth', 'dollar-sign', 'Grow account by 10%', 300),
  ('Challenge Champion', 'Pass a mock evaluation', 'trophy', 'Complete mock TopStep challenge', 1000)
ON CONFLICT DO NOTHING;

-- Insert sample economic events (next 30 days of common events)
INSERT INTO economic_events (event_date, event_name, country, impact, forecast, previous) VALUES
  (NOW() + INTERVAL '2 days', 'Non-Farm Payrolls', 'US', 'high', '180K', '175K'),
  (NOW() + INTERVAL '5 days', 'Federal Reserve Interest Rate Decision', 'US', 'high', '5.50%', '5.50%'),
  (NOW() + INTERVAL '7 days', 'Consumer Price Index (CPI)', 'US', 'high', '3.2%', '3.1%'),
  (NOW() + INTERVAL '10 days', 'Retail Sales', 'US', 'medium', '0.3%', '0.2%'),
  (NOW() + INTERVAL '14 days', 'Producer Price Index (PPI)', 'US', 'medium', '2.1%', '2.0%'),
  (NOW() + INTERVAL '17 days', 'Jobless Claims', 'US', 'medium', '220K', '215K'),
  (NOW() + INTERVAL '21 days', 'FOMC Meeting Minutes', 'US', 'high', '', ''),
  (NOW() + INTERVAL '24 days', 'GDP Growth Rate', 'US', 'high', '2.5%', '2.4%'),
  (NOW() + INTERVAL '28 days', 'PMI Manufacturing', 'US', 'medium', '48.5', '48.2%')
ON CONFLICT DO NOTHING;