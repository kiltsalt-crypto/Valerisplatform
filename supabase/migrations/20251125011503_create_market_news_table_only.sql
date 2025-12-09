/*
  # Create Market News Table

  1. New Tables
    - `market_news`
      - `id` (uuid, primary key)
      - `title` (text) - News headline
      - `summary` (text) - Brief summary of the news
      - `content` (text) - Full article content
      - `source` (text) - News source (Reuters, Bloomberg, etc.)
      - `source_url` (text) - Link to original article
      - `category` (text) - News category (stocks, futures, economy, etc.)
      - `sentiment` (text) - Sentiment analysis (bullish, bearish, neutral)
      - `impact_level` (text) - Impact level (critical, high, medium, low)
      - `published_at` (timestamptz) - Publication timestamp
      - `related_instruments` (text array) - Related trading instruments
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS
    - Add policies for public read access (financial news is public data)

  3. Indexes
    - Index on published_at for fast sorting
    - Index on category for filtering
*/

-- Create market_news table
CREATE TABLE IF NOT EXISTS market_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  content text DEFAULT '',
  source text NOT NULL,
  source_url text DEFAULT '',
  category text DEFAULT 'general',
  sentiment text DEFAULT 'neutral',
  impact_level text DEFAULT 'medium',
  published_at timestamptz DEFAULT now(),
  related_instruments text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_news_published_at ON market_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_news_category ON market_news(category);
CREATE INDEX IF NOT EXISTS idx_market_news_impact ON market_news(impact_level);

-- Enable RLS
ALTER TABLE market_news ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (financial news is public)
CREATE POLICY "Anyone can read market news"
  ON market_news
  FOR SELECT
  USING (true);

-- Service role can insert/update/delete (for edge functions)
CREATE POLICY "Service role can manage market news"
  ON market_news
  FOR ALL
  USING (auth.role() = 'service_role');