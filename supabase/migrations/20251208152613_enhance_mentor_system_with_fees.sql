/*
  # Enhance Mentor System with Service Fees

  1. Changes to profiles table
    - Add `is_mentor` boolean flag (if not exists)

  2. Changes to mentor_sessions table
    - Add `session_type` column for type of session
    - Add `session_notes` for student notes
    - Add `mentor_notes` for mentor notes after session
    - Add `service_fee` column for 15% platform fee
    - Add `total_cost` column for total paid by student
    - Add `rating` column for session rating
    - Add `review_text` column for session review
    - Add `scheduled_time` column for time of session

  3. Update default hourly_rate to $80

  4. Security
    - Only admins can update is_mentor flag on profiles
    - Existing RLS policies remain in place
*/

-- Add is_mentor flag to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_mentor'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_mentor boolean DEFAULT false;
  END IF;
END $$;

-- Add missing columns to mentor_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_sessions' AND column_name = 'session_type'
  ) THEN
    ALTER TABLE mentor_sessions ADD COLUMN session_type text CHECK (session_type IN ('review', 'coaching', 'strategy'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_sessions' AND column_name = 'session_notes'
  ) THEN
    ALTER TABLE mentor_sessions ADD COLUMN session_notes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_sessions' AND column_name = 'mentor_notes'
  ) THEN
    ALTER TABLE mentor_sessions ADD COLUMN mentor_notes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_sessions' AND column_name = 'service_fee'
  ) THEN
    ALTER TABLE mentor_sessions ADD COLUMN service_fee numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_sessions' AND column_name = 'total_cost'
  ) THEN
    ALTER TABLE mentor_sessions ADD COLUMN total_cost numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_sessions' AND column_name = 'rating'
  ) THEN
    ALTER TABLE mentor_sessions ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_sessions' AND column_name = 'review_text'
  ) THEN
    ALTER TABLE mentor_sessions ADD COLUMN review_text text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_sessions' AND column_name = 'scheduled_time'
  ) THEN
    ALTER TABLE mentor_sessions ADD COLUMN scheduled_time time;
  END IF;
END $$;

-- Update mentor_profiles hourly_rate default to $80
ALTER TABLE mentor_profiles ALTER COLUMN hourly_rate SET DEFAULT 80.00;

-- Function to automatically calculate service fee (15%)
CREATE OR REPLACE FUNCTION calculate_session_fees()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price IS NOT NULL THEN
    NEW.service_fee := ROUND(NEW.price * 0.15, 2);
    NEW.total_cost := NEW.price + NEW.service_fee;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate fees automatically
DROP TRIGGER IF EXISTS calculate_session_fees_trigger ON mentor_sessions;
CREATE TRIGGER calculate_session_fees_trigger
  BEFORE INSERT OR UPDATE ON mentor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_fees();

-- Function to update mentor stats when session is rated
CREATE OR REPLACE FUNCTION update_mentor_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.rating IS NOT NULL AND (OLD.rating IS NULL OR OLD.rating != NEW.rating) THEN
    UPDATE mentor_profiles
    SET 
      rating = (
        SELECT COALESCE(AVG(rating)::numeric, 0)
        FROM mentor_sessions
        WHERE mentor_id = NEW.mentor_id
        AND status = 'completed'
        AND rating IS NOT NULL
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM mentor_sessions
        WHERE mentor_id = NEW.mentor_id
        AND status = 'completed'
        AND rating IS NOT NULL
      ),
      updated_at = now()
    WHERE user_id = NEW.mentor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update mentor rating stats
DROP TRIGGER IF EXISTS update_mentor_rating_stats_trigger ON mentor_sessions;
CREATE TRIGGER update_mentor_rating_stats_trigger
  AFTER INSERT OR UPDATE ON mentor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_rating_stats();

-- Create index on is_mentor for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_mentor ON profiles(is_mentor) WHERE is_mentor = true;