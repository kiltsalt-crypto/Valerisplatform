/*
  # Remove Latest Unused Indexes
  
  1. Performance Improvements
    - Remove 38 indexes flagged as unused from the most recent migration
    - Reduces storage overhead and improves write performance
  
  2. Note
    - This is part of index optimization cycle
    - Foreign key indexes will be maintained separately
  
  3. Indexes Removed
    - analytics_events, blog_posts, broker_sync_log, certifications
    - challenge_participants, chat_messages, chat_room_members, chat_rooms
    - competition_leaderboards, competition_participants, email_campaign_sends
    - generated_reports, live_streams, mentor_sessions, mentorship_requests
    - performance_reports, referral_earnings, scheduled_reports, shared_trades
    - strategy_marketplace, support_responses, support_tickets, testimonials
    - trade_comments, trade_idea_comments, trade_idea_likes, trade_likes
    - user_challenges, user_course_progress, webinars
*/

-- Remove unused indexes from latest migration
DROP INDEX IF EXISTS public.idx_analytics_events_user_id_fk;
DROP INDEX IF EXISTS public.idx_blog_posts_author_id_fk;
DROP INDEX IF EXISTS public.idx_broker_sync_log_connection_id_fk;
DROP INDEX IF EXISTS public.idx_certifications_course_id_fk;
DROP INDEX IF EXISTS public.idx_challenge_participants_user_id_fk;
DROP INDEX IF EXISTS public.idx_chat_messages_trade_reference_id_fk;
DROP INDEX IF EXISTS public.idx_chat_messages_user_id_fk;
DROP INDEX IF EXISTS public.idx_chat_room_members_user_id_fk;
DROP INDEX IF EXISTS public.idx_chat_rooms_created_by_fk;
DROP INDEX IF EXISTS public.idx_competition_leaderboards_user_id_fk;
DROP INDEX IF EXISTS public.idx_competition_participants_user_id_fk;
DROP INDEX IF EXISTS public.idx_email_campaign_sends_campaign_id_fk;
DROP INDEX IF EXISTS public.idx_email_campaign_sends_user_id_fk;
DROP INDEX IF EXISTS public.idx_generated_reports_user_id_fk;
DROP INDEX IF EXISTS public.idx_live_streams_streamer_id_fk;
DROP INDEX IF EXISTS public.idx_mentor_sessions_mentor_id_fk;
DROP INDEX IF EXISTS public.idx_mentorship_requests_mentee_id_fk;
DROP INDEX IF EXISTS public.idx_mentorship_requests_mentor_id_fk;
DROP INDEX IF EXISTS public.idx_performance_reports_user_id_fk;
DROP INDEX IF EXISTS public.idx_referral_earnings_referral_id_fk;
DROP INDEX IF EXISTS public.idx_scheduled_reports_user_id_fk;
DROP INDEX IF EXISTS public.idx_shared_trades_trade_id_fk;
DROP INDEX IF EXISTS public.idx_shared_trades_user_id_fk;
DROP INDEX IF EXISTS public.idx_strategy_marketplace_seller_id_fk;
DROP INDEX IF EXISTS public.idx_support_responses_ticket_id_fk;
DROP INDEX IF EXISTS public.idx_support_responses_user_id_fk;
DROP INDEX IF EXISTS public.idx_support_tickets_assigned_to_fk;
DROP INDEX IF EXISTS public.idx_testimonials_user_id_fk;
DROP INDEX IF EXISTS public.idx_trade_comments_shared_trade_id_fk;
DROP INDEX IF EXISTS public.idx_trade_comments_user_id_fk;
DROP INDEX IF EXISTS public.idx_trade_idea_comments_idea_id_fk;
DROP INDEX IF EXISTS public.idx_trade_idea_comments_user_id_fk;
DROP INDEX IF EXISTS public.idx_trade_idea_likes_user_id_fk;
DROP INDEX IF EXISTS public.idx_trade_likes_user_id_fk;
DROP INDEX IF EXISTS public.idx_user_challenges_challenge_id_fk;
DROP INDEX IF EXISTS public.idx_user_course_progress_course_id_fk;
DROP INDEX IF EXISTS public.idx_user_course_progress_lesson_id_fk;
DROP INDEX IF EXISTS public.idx_webinars_instructor_id_fk;
