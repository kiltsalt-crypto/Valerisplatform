/*
  # Portfolio, Education & Gamification Schemas

  1. Portfolio Tables
    - `portfolios` - Multiple portfolio tracking
    - `portfolio_positions` - Current positions per portfolio
    - `portfolio_allocations` - Asset allocation tracking

  2. Education Tables
    - `courses` - Trading courses
    - `course_lessons` - Individual lessons
    - `user_course_progress` - Track user progress
    - `quizzes` - Knowledge tests
    - `quiz_questions` - Quiz questions
    - `user_quiz_attempts` - Quiz results
    - `certifications` - Earned certifications

  3. Gamification Tables
    - `daily_challenges` - Daily trading challenges
    - `user_challenges` - User challenge progress
    - `trading_streaks` - Consistency tracking
    - `competitions` - Trading competitions
    - `competition_participants` - Competition entries
    - `competition_leaderboards` - Competition rankings

  4. Security
    - Enable RLS on all tables
*/

-- ============ PORTFOLIO TABLES ============

CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  portfolio_name text NOT NULL,
  portfolio_type text DEFAULT 'paper' CHECK (portfolio_type IN ('paper', 'live', 'demo')),
  starting_balance numeric DEFAULT 10000,
  current_balance numeric DEFAULT 10000,
  total_pnl numeric DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create portfolios"
  ON portfolios FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Portfolio Positions
CREATE TABLE IF NOT EXISTS portfolio_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  instrument text NOT NULL,
  position_type text CHECK (position_type IN ('long', 'short')),
  quantity numeric NOT NULL,
  entry_price numeric NOT NULL,
  current_price numeric,
  unrealized_pnl numeric DEFAULT 0,
  opened_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio positions"
  ON portfolio_positions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.user_id = auth.uid()));

CREATE POLICY "Users can create portfolio positions"
  ON portfolio_positions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.user_id = auth.uid()));

CREATE POLICY "Users can update own portfolio positions"
  ON portfolio_positions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.user_id = auth.uid()));

CREATE POLICY "Users can delete own portfolio positions"
  ON portfolio_positions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.user_id = auth.uid()));

-- Portfolio Allocations
CREATE TABLE IF NOT EXISTS portfolio_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  asset_class text NOT NULL,
  target_percentage numeric DEFAULT 0,
  current_percentage numeric DEFAULT 0,
  current_value numeric DEFAULT 0,
  last_rebalanced timestamptz,
  UNIQUE(portfolio_id, asset_class)
);

ALTER TABLE portfolio_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own portfolio allocations"
  ON portfolio_allocations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.user_id = auth.uid()));

-- ============ EDUCATION TABLES ============

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer DEFAULT 0,
  instructor text,
  thumbnail_url text,
  is_published boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT TO authenticated
  USING (is_published = true);

-- Course Lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  lesson_type text DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'interactive', 'quiz')),
  video_url text,
  duration_minutes integer DEFAULT 0,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published course lessons"
  ON course_lessons FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_id AND courses.is_published = true));

-- User Course Progress
CREATE TABLE IF NOT EXISTS user_course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  progress_percentage numeric DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own course progress"
  ON user_course_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create course progress"
  ON user_course_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course progress"
  ON user_course_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  passing_score numeric DEFAULT 70,
  time_limit_minutes integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes"
  ON quizzes FOR SELECT TO authenticated
  USING (true);

-- Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  question_type text DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options jsonb DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL,
  explanation text,
  points integer DEFAULT 1,
  order_index integer DEFAULT 0
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT TO authenticated
  USING (true);

-- User Quiz Attempts
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  score numeric DEFAULT 0,
  total_points numeric DEFAULT 0,
  passed boolean DEFAULT false,
  answers jsonb DEFAULT '{}'::jsonb,
  time_taken_minutes integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
  ON user_quiz_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quiz attempts"
  ON user_quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  certification_name text NOT NULL,
  certification_type text DEFAULT 'course_completion',
  issued_at timestamptz DEFAULT now(),
  certificate_url text,
  verification_code text UNIQUE
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certifications"
  ON certifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can verify certifications by code"
  ON certifications FOR SELECT TO authenticated
  USING (verification_code IS NOT NULL);

-- ============ GAMIFICATION TABLES ============

CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL UNIQUE,
  challenge_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  requirements jsonb NOT NULL,
  reward_points integer DEFAULT 0,
  reward_badge text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT TO authenticated
  USING (true);

-- User Challenges
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id uuid REFERENCES daily_challenges(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  progress_data jsonb DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
  ON user_challenges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create challenges"
  ON user_challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON user_challenges FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trading Streaks
CREATE TABLE IF NOT EXISTS trading_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  streak_type text CHECK (streak_type IN ('daily_login', 'daily_trade', 'winning_trades', 'journal_entries')),
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

ALTER TABLE trading_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON trading_streaks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streaks"
  ON trading_streaks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Competitions
CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  competition_type text CHECK (competition_type IN ('profit_percent', 'most_trades', 'win_rate', 'consistency')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  entry_fee numeric DEFAULT 0,
  prize_pool numeric DEFAULT 0,
  max_participants integer,
  rules jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competitions"
  ON competitions FOR SELECT TO authenticated
  USING (true);

-- Competition Participants
CREATE TABLE IF NOT EXISTS competition_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  starting_balance numeric DEFAULT 10000,
  current_balance numeric DEFAULT 10000,
  total_trades integer DEFAULT 0,
  current_rank integer,
  final_rank integer,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competition participants"
  ON competition_participants FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can join competitions"
  ON competition_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Competition Leaderboards
CREATE TABLE IF NOT EXISTS competition_leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rank integer NOT NULL,
  score numeric NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  snapshot_date date DEFAULT CURRENT_DATE,
  UNIQUE(competition_id, user_id, snapshot_date)
);

ALTER TABLE competition_leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboards"
  ON competition_leaderboards FOR SELECT TO authenticated
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_portfolio ON portfolio_positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user ON user_course_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_user ON user_quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_status ON user_challenges(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trading_streaks_user ON trading_streaks(user_id, streak_type);
CREATE INDEX IF NOT EXISTS idx_competition_participants_competition ON competition_participants(competition_id, current_rank);
