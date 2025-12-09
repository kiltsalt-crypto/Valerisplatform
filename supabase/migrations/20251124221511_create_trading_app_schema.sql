/*
  # Stock Trading Learning & Practice App Schema

  ## Overview
  This migration creates the complete database schema for a stock trading education and paper trading application.
  
  ## New Tables
  
  ### 1. `profiles`
  User profile information and trading account settings
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `starting_capital` (numeric) - Initial paper trading balance
  - `current_capital` (numeric) - Current paper trading balance
  - `total_trades` (integer) - Total number of trades executed
  - `winning_trades` (integer) - Number of profitable trades
  - `losing_trades` (integer) - Number of losing trades
  - `best_trade` (numeric) - Largest profit from a single trade
  - `worst_trade` (numeric) - Largest loss from a single trade
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `trades`
  Paper trading transaction records
  - `id` (uuid) - Trade identifier
  - `user_id` (uuid, FK to profiles) - User who executed the trade
  - `symbol` (text) - Stock ticker symbol
  - `type` (text) - Trade type: 'buy' or 'sell'
  - `quantity` (integer) - Number of shares
  - `entry_price` (numeric) - Price per share at entry
  - `exit_price` (numeric, nullable) - Price per share at exit
  - `entry_date` (timestamptz) - Trade entry timestamp
  - `exit_date` (timestamptz, nullable) - Trade exit timestamp
  - `status` (text) - Trade status: 'open' or 'closed'
  - `profit_loss` (numeric) - Profit or loss amount
  - `profit_loss_percentage` (numeric) - P/L as percentage
  - `notes` (text) - User's trade notes and journal entry
  - `strategy` (text) - Trading strategy used
  - `stop_loss` (numeric, nullable) - Stop loss price
  - `take_profit` (numeric, nullable) - Take profit target
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `learning_modules`
  Educational content for trading concepts
  - `id` (uuid) - Module identifier
  - `title` (text) - Module title
  - `description` (text) - Module description
  - `content` (text) - Educational content (markdown supported)
  - `category` (text) - Category: 'basics', 'technical', 'fundamental', 'risk', 'psychology', 'strategies'
  - `order_index` (integer) - Display order
  - `duration_minutes` (integer) - Estimated completion time
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `user_progress`
  Tracks user completion of learning modules
  - `id` (uuid) - Progress record identifier
  - `user_id` (uuid, FK to profiles) - User identifier
  - `module_id` (uuid, FK to learning_modules) - Module identifier
  - `completed` (boolean) - Completion status
  - `completed_at` (timestamptz, nullable) - Completion timestamp
  - `notes` (text) - User's notes on the module
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `daily_performance`
  Daily trading performance metrics
  - `id` (uuid) - Record identifier
  - `user_id` (uuid, FK to profiles) - User identifier
  - `date` (date) - Trading date
  - `starting_balance` (numeric) - Balance at start of day
  - `ending_balance` (numeric) - Balance at end of day
  - `profit_loss` (numeric) - Daily P/L
  - `trades_count` (integer) - Number of trades executed
  - `win_rate` (numeric) - Win rate percentage for the day
  - `created_at` (timestamptz) - Record creation timestamp

  ### 6. `watchlist`
  User's stock watchlist
  - `id` (uuid) - Watchlist item identifier
  - `user_id` (uuid, FK to profiles) - User identifier
  - `symbol` (text) - Stock ticker symbol
  - `notes` (text) - Notes about the stock
  - `target_entry` (numeric, nullable) - Target entry price
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Learning modules are readable by all authenticated users
  - Restrictive policies for insert, update, and delete operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  starting_capital numeric DEFAULT 100000,
  current_capital numeric DEFAULT 100000,
  total_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  losing_trades integer DEFAULT 0,
  best_trade numeric DEFAULT 0,
  worst_trade numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  type text NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity integer NOT NULL CHECK (quantity > 0),
  entry_price numeric NOT NULL CHECK (entry_price > 0),
  exit_price numeric CHECK (exit_price > 0),
  entry_date timestamptz DEFAULT now(),
  exit_date timestamptz,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  profit_loss numeric DEFAULT 0,
  profit_loss_percentage numeric DEFAULT 0,
  notes text,
  strategy text,
  stop_loss numeric,
  take_profit numeric,
  created_at timestamptz DEFAULT now()
);

-- Create learning_modules table
CREATE TABLE IF NOT EXISTS learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('basics', 'technical', 'fundamental', 'risk', 'psychology', 'strategies')),
  order_index integer NOT NULL,
  duration_minutes integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES learning_modules(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Create daily_performance table
CREATE TABLE IF NOT EXISTS daily_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  starting_balance numeric NOT NULL,
  ending_balance numeric NOT NULL,
  profit_loss numeric DEFAULT 0,
  trades_count integer DEFAULT 0,
  win_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  notes text,
  target_entry numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trades policies
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Learning modules policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view learning modules"
  ON learning_modules FOR SELECT
  TO authenticated
  USING (true);

-- User progress policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Daily performance policies
CREATE POLICY "Users can view own performance"
  ON daily_performance FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own performance"
  ON daily_performance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance"
  ON daily_performance FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own watchlist"
  ON watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist"
  ON watchlist FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist"
  ON watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_performance_user_id ON daily_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_performance_date ON daily_performance(date);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);

-- Insert sample learning modules
INSERT INTO learning_modules (title, description, content, category, order_index, duration_minutes) VALUES
  ('Introduction to Stock Trading', 'Learn the basics of stock trading and financial markets', '# Introduction to Stock Trading\n\nStock trading involves buying and selling shares of publicly traded companies. Understanding the fundamentals is crucial for success.\n\n## Key Concepts:\n- **Stock Exchange**: A marketplace where stocks are bought and sold\n- **Ticker Symbol**: A unique identifier for each stock (e.g., AAPL for Apple)\n- **Bid/Ask Spread**: The difference between buying and selling prices\n- **Market Orders vs Limit Orders**: Different ways to execute trades\n\n## Why Trade Stocks?\n- Potential for profit from price movements\n- Build wealth over time\n- Participate in company growth\n\n## Getting Started:\n1. Learn market terminology\n2. Understand different order types\n3. Practice with paper trading\n4. Develop a trading plan', 'basics', 1, 15),
  
  ('Understanding Market Orders', 'Master different order types and when to use them', '# Understanding Market Orders\n\n## Order Types:\n\n### Market Order\n- Executes immediately at current market price\n- Guaranteed execution, price not guaranteed\n- Best for liquid stocks\n\n### Limit Order\n- Executes only at specified price or better\n- Price guaranteed, execution not guaranteed\n- Better control over entry/exit prices\n\n### Stop Loss Order\n- Triggers when price reaches specified level\n- Helps limit losses\n- Essential risk management tool\n\n### Stop Limit Order\n- Combines stop and limit orders\n- More control but may not execute\n\n## Best Practices:\n- Use market orders for quick entries in liquid stocks\n- Use limit orders when price precision matters\n- Always set stop losses to protect capital', 'basics', 2, 12),
  
  ('Technical Analysis Fundamentals', 'Learn to read charts and identify trading opportunities', '# Technical Analysis Fundamentals\n\nTechnical analysis studies price movements and patterns to predict future direction.\n\n## Key Concepts:\n\n### Support and Resistance\n- **Support**: Price level where buying pressure prevents further decline\n- **Resistance**: Price level where selling pressure prevents further rise\n- Breaking these levels often signals strong moves\n\n### Trend Analysis\n- **Uptrend**: Higher highs and higher lows\n- **Downtrend**: Lower highs and lower lows\n- **Sideways**: Consolidation, no clear direction\n\n### Common Indicators:\n- **Moving Averages**: Smooth out price action, identify trends\n- **RSI (Relative Strength Index)**: Measures overbought/oversold conditions\n- **MACD**: Trend-following momentum indicator\n- **Volume**: Confirms price movements\n\n## Chart Patterns:\n- Head and Shoulders (reversal)\n- Double Top/Bottom (reversal)\n- Triangles (continuation)\n- Flags and Pennants (continuation)', 'technical', 3, 20),
  
  ('Risk Management Essentials', 'Protect your capital with proper risk management', '# Risk Management Essentials\n\nRisk management is the most important aspect of trading. It protects your capital and ensures longevity.\n\n## The 1% Rule\nNever risk more than 1-2% of your capital on a single trade.\n\n**Example**:\n- Account size: $100,000\n- Max risk per trade: $1,000 (1%)\n- If stop loss is $2 away, buy 500 shares maximum\n\n## Position Sizing Formula\n```\nPosition Size = (Account Size × Risk %) / (Entry Price - Stop Loss Price)\n```\n\n## Risk/Reward Ratio\nAlways aim for at least 2:1 reward-to-risk ratio.\n- Risk $100 to make $200 or more\n- This allows profitability even with 50% win rate\n\n## Key Rules:\n1. Always use stop losses\n2. Never move stop loss further away\n3. Size positions appropriately\n4. Don''t overtrade\n5. Respect your daily loss limit\n6. Keep emotions in check\n\n## Funded Account Requirements:\nMost prop firms require:\n- Maximum daily loss: 5% of account\n- Maximum total drawdown: 10% of account\n- Minimum win rate: typically 50%+\n- Consistency over quick gains', 'risk', 4, 18),
  
  ('Trading Psychology', 'Master the mental game of trading', '# Trading Psychology\n\nYour mindset determines your success more than any strategy.\n\n## Common Psychological Pitfalls:\n\n### Fear and Greed\n- **Fear**: Causes premature exits or missed opportunities\n- **Greed**: Leads to oversized positions and holding too long\n- **Solution**: Follow your trading plan mechanically\n\n### Revenge Trading\n- Trying to quickly recover losses\n- Results in emotional, irrational decisions\n- **Solution**: Take a break after losses, stick to plan\n\n### Overconfidence\n- Following winning streaks\n- Increasing risk inappropriately\n- **Solution**: Stay humble, maintain consistent risk\n\n### FOMO (Fear of Missing Out)\n- Chasing trades that already moved\n- Entering without proper setup\n- **Solution**: Wait for your setup, there''s always another trade\n\n## Building Discipline:\n1. Create a detailed trading plan\n2. Journal every trade\n3. Review performance weekly\n4. Accept losses as part of the process\n5. Celebrate following the plan, not just profits\n6. Practice meditation or mindfulness\n\n## The Trader''s Mindset:\n- Think in probabilities, not certainties\n- Focus on process, not outcomes\n- Be patient and selective\n- Accept that losses are inevitable\n- Continuous learning and adaptation', 'psychology', 5, 16),
  
  ('Popular Trading Strategies', 'Explore proven trading strategies for different market conditions', '# Popular Trading Strategies\n\n## 1. Trend Following\n**Concept**: Trade in the direction of the prevailing trend\n- Use moving averages to identify trend\n- Enter on pullbacks to support/resistance\n- Ride the trend until reversal signals\n- **Best for**: Trending markets\n\n## 2. Breakout Trading\n**Concept**: Enter when price breaks through key levels\n- Identify consolidation patterns\n- Wait for volume confirmation\n- Enter on breakout with stop below pattern\n- **Best for**: Volatile markets\n\n## 3. Reversal Trading\n**Concept**: Trade trend changes at extremes\n- Identify overbought/oversold conditions\n- Look for reversal patterns\n- Requires precise timing\n- **Best for**: Range-bound markets\n\n## 4. Scalping\n**Concept**: Quick trades for small profits\n- Hold positions seconds to minutes\n- High frequency, many trades daily\n- Requires focus and fast execution\n- **Best for**: Experienced traders, liquid markets\n\n## 5. Swing Trading\n**Concept**: Hold positions days to weeks\n- Capture larger price swings\n- Less screen time required\n- Overnight and weekend risk\n- **Best for**: Part-time traders\n\n## Choosing Your Strategy:\n1. Match your personality and lifestyle\n2. Consider your available time\n3. Account for your risk tolerance\n4. Start with one strategy and master it\n5. Backtest before live trading', 'strategies', 6, 22)
ON CONFLICT DO NOTHING;