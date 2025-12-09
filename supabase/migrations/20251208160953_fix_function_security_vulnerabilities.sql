/*
  # Fix Function Security Vulnerabilities

  1. Security Enhancement
    - Fix all functions with mutable search_path
    - Set secure search_path for all functions
    - Prevents SQL injection attacks

  2. Functions Fixed
    - calculate_session_fees
    - check_feature_access
    - update_mentor_rating_stats
    - check_and_increment_usage
    - update_support_ticket_timestamp
    - update_streak
*/

-- Fix calculate_session_fees function
DROP FUNCTION IF EXISTS public.calculate_session_fees(numeric, integer) CASCADE;
CREATE OR REPLACE FUNCTION public.calculate_session_fees(
  hourly_rate numeric,
  duration_mins integer
)
RETURNS TABLE(base_fee numeric, service_fee numeric, total_cost numeric)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (hourly_rate / 60 * duration_mins) AS base_fee,
    (hourly_rate / 60 * duration_mins * 0.15) AS service_fee,
    (hourly_rate / 60 * duration_mins * 1.15) AS total_cost;
END;
$$;

-- Fix check_feature_access function
DROP FUNCTION IF EXISTS public.check_feature_access(text) CASCADE;
CREATE OR REPLACE FUNCTION public.check_feature_access(feature_key text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  user_tier text;
  feature_allowed boolean := false;
BEGIN
  SELECT tier INTO user_tier
  FROM public.user_subscriptions
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF user_tier IS NULL THEN
    user_tier := 'free';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.subscription_features
    WHERE tier = user_tier AND subscription_features.feature_key = check_feature_access.feature_key
  ) INTO feature_allowed;

  RETURN feature_allowed;
END;
$$;

-- Fix update_mentor_rating_stats function
DROP FUNCTION IF EXISTS public.update_mentor_rating_stats() CASCADE;
CREATE OR REPLACE FUNCTION public.update_mentor_rating_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating numeric;
  total_sessions integer;
BEGIN
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, total_sessions
  FROM public.mentor_sessions
  WHERE mentor_id = NEW.mentor_id
  AND rating IS NOT NULL;

  UPDATE public.mentor_profiles
  SET 
    average_rating = COALESCE(avg_rating, 0),
    total_sessions = COALESCE(total_sessions, 0),
    updated_at = now()
  WHERE user_id = NEW.mentor_id;

  RETURN NEW;
END;
$$;

-- Fix check_and_increment_usage function
DROP FUNCTION IF EXISTS public.check_and_increment_usage(text) CASCADE;
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(feature_key text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  current_usage integer;
  usage_limit integer;
  has_access boolean;
BEGIN
  SELECT public.check_feature_access(feature_key) INTO has_access;
  
  IF NOT has_access THEN
    RETURN false;
  END IF;

  SELECT usage_count INTO current_usage
  FROM public.user_feature_usage
  WHERE user_id = auth.uid()
  AND user_feature_usage.feature_key = check_and_increment_usage.feature_key;

  SELECT limit_value INTO usage_limit
  FROM public.subscription_features sf
  JOIN public.user_subscriptions us ON us.tier = sf.tier
  WHERE us.user_id = auth.uid()
  AND sf.feature_key = check_and_increment_usage.feature_key;

  IF usage_limit IS NULL OR current_usage < usage_limit THEN
    INSERT INTO public.user_feature_usage (user_id, feature_key, usage_count)
    VALUES (auth.uid(), feature_key, 1)
    ON CONFLICT (user_id, feature_key)
    DO UPDATE SET usage_count = user_feature_usage.usage_count + 1, updated_at = now();
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Fix update_support_ticket_timestamp function
DROP FUNCTION IF EXISTS public.update_support_ticket_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION public.update_support_ticket_timestamp()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.support_tickets
  SET updated_at = now()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_ticket_timestamp ON public.support_responses;
CREATE TRIGGER update_ticket_timestamp
  AFTER INSERT ON public.support_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_ticket_timestamp();

-- Fix update_streak function
DROP FUNCTION IF EXISTS public.update_streak() CASCADE;
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  last_trade_date date;
  current_streak integer;
  longest_streak integer;
BEGIN
  SELECT MAX(entry_time::date) INTO last_trade_date
  FROM public.trades
  WHERE user_id = NEW.user_id
  AND entry_time::date < CURRENT_DATE;

  SELECT 
    ux.current_streak,
    ux.longest_streak
  INTO current_streak, longest_streak
  FROM public.user_experience ux
  WHERE ux.user_id = NEW.user_id;

  IF last_trade_date = CURRENT_DATE - INTERVAL '1 day' THEN
    current_streak := COALESCE(current_streak, 0) + 1;
  ELSIF last_trade_date < CURRENT_DATE - INTERVAL '1 day' OR last_trade_date IS NULL THEN
    current_streak := 1;
  END IF;

  IF current_streak > COALESCE(longest_streak, 0) THEN
    longest_streak := current_streak;
  END IF;

  INSERT INTO public.user_experience (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (NEW.user_id, current_streak, longest_streak, CURRENT_DATE)
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    last_activity_date = EXCLUDED.last_activity_date,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Recreate trigger for update_streak
DROP TRIGGER IF EXISTS update_streak_on_trade ON public.trades;
CREATE TRIGGER update_streak_on_trade
  AFTER INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_streak();