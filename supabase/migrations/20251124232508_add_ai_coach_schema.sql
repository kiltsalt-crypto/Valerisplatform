/*
  # AI Coach Feature Schema

  1. New Tables
    - `ai_coach_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `message` (text) - User or AI message
      - `role` (text) - 'user' or 'assistant'
      - `context_data` (jsonb) - Trading data context
      - `created_at` (timestamptz)
    
    - `ai_coach_analysis`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `analysis_type` (text) - 'pattern', 'risk', 'performance', 'education'
      - `analysis_data` (jsonb) - Analysis results
      - `recommendations` (jsonb) - AI recommendations
      - `created_at` (timestamptz)
    
    - `ai_coach_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `skill_area` (text) - Area being coached
      - `progress_score` (numeric) - 0-100
      - `milestones` (jsonb) - Achieved milestones
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

-- AI Coach Conversations
CREATE TABLE IF NOT EXISTS ai_coach_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  context_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_coach_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI coach conversations"
  ON ai_coach_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI coach conversations"
  ON ai_coach_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- AI Coach Analysis
CREATE TABLE IF NOT EXISTS ai_coach_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  analysis_type text NOT NULL CHECK (analysis_type IN ('pattern', 'risk', 'performance', 'education', 'strategy')),
  analysis_data jsonb DEFAULT '{}'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_coach_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI coach analysis"
  ON ai_coach_analysis FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI coach analysis"
  ON ai_coach_analysis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- AI Coach Progress Tracking
CREATE TABLE IF NOT EXISTS ai_coach_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_area text NOT NULL,
  progress_score numeric DEFAULT 0 CHECK (progress_score >= 0 AND progress_score <= 100),
  milestones jsonb DEFAULT '[]'::jsonb,
  strengths jsonb DEFAULT '[]'::jsonb,
  areas_to_improve jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_area)
);

ALTER TABLE ai_coach_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI coach progress"
  ON ai_coach_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI coach progress"
  ON ai_coach_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI coach progress"
  ON ai_coach_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_user_id ON ai_coach_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_created_at ON ai_coach_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_coach_analysis_user_id ON ai_coach_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_progress_user_id ON ai_coach_progress(user_id);
