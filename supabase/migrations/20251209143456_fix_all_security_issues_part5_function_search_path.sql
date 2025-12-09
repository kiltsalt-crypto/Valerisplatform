/*
  # Fix Security Issues - Part 5: Fix Function Search Path Security
  
  1. Security Improvements
    - Set explicit search_path on all functions to prevent schema injection attacks
    - Functions with mutable search_path can be exploited by attackers
    - Setting search_path to empty or specific schemas prevents malicious code execution
  
  2. Functions Fixed (16 function signatures)
    - create_default_subscription
    - calculate_session_fees (2 versions)
    - check_feature_access (2 versions)
    - check_and_increment_usage (2 versions)
    - generate_referral_code
    - cleanup_old_rate_limits
    - update_updated_at_column
    - check_admin_2fa_requirement
    - enforce_admin_2fa
    - update_broker_credentials_updated_at
    - calculate_daily_analytics
    - get_popular_events
    - get_user_retention
  
  3. Security Note
    - All functions now have SET search_path = public, pg_temp
    - This prevents schema injection attacks while allowing temp tables
*/

-- Fix create_default_subscription
ALTER FUNCTION public.create_default_subscription() SET search_path = public, pg_temp;

-- Fix calculate_session_fees (both versions)
ALTER FUNCTION public.calculate_session_fees() SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_session_fees(numeric, integer) SET search_path = public, pg_temp;

-- Fix check_feature_access (both versions)
ALTER FUNCTION public.check_feature_access(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_feature_access(uuid, text) SET search_path = public, pg_temp;

-- Fix check_and_increment_usage (both versions)
ALTER FUNCTION public.check_and_increment_usage(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_and_increment_usage(uuid, text) SET search_path = public, pg_temp;

-- Fix generate_referral_code
ALTER FUNCTION public.generate_referral_code() SET search_path = public, pg_temp;

-- Fix cleanup_old_rate_limits
ALTER FUNCTION public.cleanup_old_rate_limits() SET search_path = public, pg_temp;

-- Fix update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- Fix check_admin_2fa_requirement
ALTER FUNCTION public.check_admin_2fa_requirement(uuid) SET search_path = public, pg_temp;

-- Fix enforce_admin_2fa
ALTER FUNCTION public.enforce_admin_2fa() SET search_path = public, pg_temp;

-- Fix update_broker_credentials_updated_at
ALTER FUNCTION public.update_broker_credentials_updated_at() SET search_path = public, pg_temp;

-- Fix calculate_daily_analytics
ALTER FUNCTION public.calculate_daily_analytics(date) SET search_path = public, pg_temp;

-- Fix get_popular_events
ALTER FUNCTION public.get_popular_events(integer) SET search_path = public, pg_temp;

-- Fix get_user_retention
ALTER FUNCTION public.get_user_retention(integer) SET search_path = public, pg_temp;
