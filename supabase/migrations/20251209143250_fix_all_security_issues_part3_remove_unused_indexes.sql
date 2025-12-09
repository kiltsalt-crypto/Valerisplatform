/*
  # Fix Security Issues - Part 3: Remove Unused Indexes
  
  1. Performance Improvements
    - Drop indexes that have not been used
    - Reduces storage overhead and improves write performance
    - Indexes consume resources during INSERT/UPDATE/DELETE operations
  
  2. Indexes Removed (52 unused indexes)
    - Broker-related: broker_credentials, broker_sync_log, broker_positions, broker_orders
    - Analytics: analytics_events, analytics_daily_stats
    - Support: support_tickets, support_responses
    - Social: shared_trades, trade_comments, trade_likes
    - Education: certifications, user_course_progress, mentor_sessions, mentorship_requests
    - Challenges: challenge_participants, user_challenges, competition_participants, competition_leaderboards
    - Community: trade_idea_likes, trade_idea_comments, chat_messages, chat_room_members, chat_rooms
    - Business: blog_posts, referral_earnings, testimonials, generated_reports, scheduled_reports, performance_reports
    - Marketplace: strategy_marketplace, live_streams, webinars
    - Marketing: email_campaign_sends
    - Security: rate_limits
*/

-- Broker indexes
DROP INDEX IF EXISTS public.idx_broker_credentials_connection_id;
DROP INDEX IF EXISTS public.idx_broker_sync_log_connection_id;
DROP INDEX IF EXISTS public.idx_broker_sync_log_synced_at;
DROP INDEX IF EXISTS public.idx_broker_positions_connection_id;
DROP INDEX IF EXISTS public.idx_broker_positions_symbol;
DROP INDEX IF EXISTS public.idx_broker_orders_connection_id;
DROP INDEX IF EXISTS public.idx_broker_orders_status;
DROP INDEX IF EXISTS public.idx_broker_orders_placed_at;

-- Analytics indexes
DROP INDEX IF EXISTS public.idx_analytics_events_user_id;
DROP INDEX IF EXISTS public.idx_analytics_events_name;
DROP INDEX IF EXISTS public.idx_analytics_events_created_at;
DROP INDEX IF EXISTS public.idx_analytics_daily_stats_date;

-- Support indexes
DROP INDEX IF EXISTS public.idx_support_tickets_assigned_to_fk;
DROP INDEX IF EXISTS public.idx_support_responses_ticket_id_fk;
DROP INDEX IF EXISTS public.idx_support_responses_user_id_fk;

-- Social trading indexes
DROP INDEX IF EXISTS public.idx_shared_trades_user_id_fk;
DROP INDEX IF EXISTS public.idx_shared_trades_trade_id_fk;
DROP INDEX IF EXISTS public.idx_trade_comments_shared_trade_id_fk;
DROP INDEX IF EXISTS public.idx_trade_comments_user_id_fk;
DROP INDEX IF EXISTS public.idx_trade_likes_user_id_fk;

-- Education indexes
DROP INDEX IF EXISTS public.idx_certifications_course_id_fk;
DROP INDEX IF EXISTS public.idx_user_course_progress_user_id_fk;
DROP INDEX IF EXISTS public.idx_user_course_progress_course_id_fk;
DROP INDEX IF EXISTS public.idx_user_course_progress_lesson_id_fk;
DROP INDEX IF EXISTS public.idx_mentor_sessions_mentor_id_fk;
DROP INDEX IF EXISTS public.idx_mentorship_requests_mentor_id_fk;
DROP INDEX IF EXISTS public.idx_mentorship_requests_mentee_id_fk;

-- Challenge indexes
DROP INDEX IF EXISTS public.idx_challenge_participants_user_id_fk;
DROP INDEX IF EXISTS public.idx_user_challenges_challenge_id_fk;
DROP INDEX IF EXISTS public.idx_competition_participants_user_id_fk;
DROP INDEX IF EXISTS public.idx_competition_leaderboards_user_id_fk;

-- Community indexes
DROP INDEX IF EXISTS public.idx_trade_idea_likes_user_id_fk;
DROP INDEX IF EXISTS public.idx_trade_idea_comments_user_id_fk;
DROP INDEX IF EXISTS public.idx_trade_idea_comments_idea_id_fk;
DROP INDEX IF EXISTS public.idx_chat_messages_user_id_fk;
DROP INDEX IF EXISTS public.idx_chat_messages_trade_reference_id_fk;
DROP INDEX IF EXISTS public.idx_chat_room_members_user_id_fk;
DROP INDEX IF EXISTS public.idx_chat_rooms_created_by_fk;

-- Business indexes
DROP INDEX IF EXISTS public.idx_blog_posts_author_id_fk;
DROP INDEX IF EXISTS public.idx_referral_earnings_referral_id_fk;
DROP INDEX IF EXISTS public.idx_testimonials_user_id_fk;
DROP INDEX IF EXISTS public.idx_generated_reports_user_id_fk;
DROP INDEX IF EXISTS public.idx_scheduled_reports_user_id_fk;
DROP INDEX IF EXISTS public.idx_performance_reports_user_id_fk;

-- Marketplace indexes
DROP INDEX IF EXISTS public.idx_strategy_marketplace_seller_id_fk;
DROP INDEX IF EXISTS public.idx_live_streams_streamer_id_fk;
DROP INDEX IF EXISTS public.idx_webinars_instructor_id_fk;

-- Marketing indexes
DROP INDEX IF EXISTS public.idx_email_campaign_sends_campaign_id_fk;
DROP INDEX IF EXISTS public.idx_email_campaign_sends_user_id_fk;

-- Rate limiting indexes
DROP INDEX IF EXISTS public.idx_rate_limits_lookup;
DROP INDEX IF EXISTS public.idx_rate_limits_window;
