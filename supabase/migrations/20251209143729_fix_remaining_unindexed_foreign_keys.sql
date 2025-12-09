/*
  # Fix Remaining Unindexed Foreign Keys
  
  1. Performance Improvements
    - Add indexes for 38 remaining unindexed foreign keys
    - These indexes improve JOIN performance and foreign key constraint checks
  
  2. Tables Affected
    - analytics_events, blog_posts, broker_sync_log, certifications
    - challenge_participants, chat_messages, chat_room_members, chat_rooms
    - competition_leaderboards, competition_participants, email_campaign_sends
    - generated_reports, live_streams, mentor_sessions, mentorship_requests
    - performance_reports, referral_earnings, scheduled_reports, shared_trades
    - strategy_marketplace, support_responses, support_tickets, testimonials
    - trade_comments, trade_idea_comments, trade_idea_likes, trade_likes
    - user_challenges, user_course_progress, webinars
*/

-- Analytics events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id_fk ON public.analytics_events(user_id);

-- Blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id_fk ON public.blog_posts(author_id);

-- Broker sync log
CREATE INDEX IF NOT EXISTS idx_broker_sync_log_connection_id_fk ON public.broker_sync_log(connection_id);

-- Certifications
CREATE INDEX IF NOT EXISTS idx_certifications_course_id_fk ON public.certifications(course_id);

-- Challenge participants
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id_fk ON public.challenge_participants(user_id);

-- Chat messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_trade_reference_id_fk ON public.chat_messages(trade_reference_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id_fk ON public.chat_messages(user_id);

-- Chat room members
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id_fk ON public.chat_room_members(user_id);

-- Chat rooms
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by_fk ON public.chat_rooms(created_by);

-- Competition leaderboards
CREATE INDEX IF NOT EXISTS idx_competition_leaderboards_user_id_fk ON public.competition_leaderboards(user_id);

-- Competition participants
CREATE INDEX IF NOT EXISTS idx_competition_participants_user_id_fk ON public.competition_participants(user_id);

-- Email campaign sends
CREATE INDEX IF NOT EXISTS idx_email_campaign_sends_campaign_id_fk ON public.email_campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_sends_user_id_fk ON public.email_campaign_sends(user_id);

-- Generated reports
CREATE INDEX IF NOT EXISTS idx_generated_reports_user_id_fk ON public.generated_reports(user_id);

-- Live streams
CREATE INDEX IF NOT EXISTS idx_live_streams_streamer_id_fk ON public.live_streams(streamer_id);

-- Mentor sessions
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_id_fk ON public.mentor_sessions(mentor_id);

-- Mentorship requests
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee_id_fk ON public.mentorship_requests(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor_id_fk ON public.mentorship_requests(mentor_id);

-- Performance reports
CREATE INDEX IF NOT EXISTS idx_performance_reports_user_id_fk ON public.performance_reports(user_id);

-- Referral earnings
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referral_id_fk ON public.referral_earnings(referral_id);

-- Scheduled reports
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_user_id_fk ON public.scheduled_reports(user_id);

-- Shared trades
CREATE INDEX IF NOT EXISTS idx_shared_trades_trade_id_fk ON public.shared_trades(trade_id);
CREATE INDEX IF NOT EXISTS idx_shared_trades_user_id_fk ON public.shared_trades(user_id);

-- Strategy marketplace
CREATE INDEX IF NOT EXISTS idx_strategy_marketplace_seller_id_fk ON public.strategy_marketplace(seller_id);

-- Support responses
CREATE INDEX IF NOT EXISTS idx_support_responses_ticket_id_fk ON public.support_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_responses_user_id_fk ON public.support_responses(user_id);

-- Support tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to_fk ON public.support_tickets(assigned_to);

-- Testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id_fk ON public.testimonials(user_id);

-- Trade comments
CREATE INDEX IF NOT EXISTS idx_trade_comments_shared_trade_id_fk ON public.trade_comments(shared_trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_comments_user_id_fk ON public.trade_comments(user_id);

-- Trade idea comments
CREATE INDEX IF NOT EXISTS idx_trade_idea_comments_idea_id_fk ON public.trade_idea_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_trade_idea_comments_user_id_fk ON public.trade_idea_comments(user_id);

-- Trade idea likes
CREATE INDEX IF NOT EXISTS idx_trade_idea_likes_user_id_fk ON public.trade_idea_likes(user_id);

-- Trade likes
CREATE INDEX IF NOT EXISTS idx_trade_likes_user_id_fk ON public.trade_likes(user_id);

-- User challenges
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id_fk ON public.user_challenges(challenge_id);

-- User course progress
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id_fk ON public.user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_lesson_id_fk ON public.user_course_progress(lesson_id);

-- Webinars
CREATE INDEX IF NOT EXISTS idx_webinars_instructor_id_fk ON public.webinars(instructor_id);
