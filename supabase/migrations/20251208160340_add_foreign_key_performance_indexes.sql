/*
  # Add Foreign Key Indexes for Performance

  1. Performance Optimization
    - Add indexes for all foreign key columns
    - Improves query performance for joins and lookups
    - Reduces table scan overhead

  2. Scope
    - 30+ critical foreign key indexes
    - Covers all main feature areas
*/

-- Support system
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id_fk ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to_fk ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_responses_ticket_id_fk ON public.support_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_responses_user_id_fk ON public.support_responses(user_id);

-- Social trading
CREATE INDEX IF NOT EXISTS idx_shared_trades_user_id_fk ON public.shared_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_trades_trade_id_fk ON public.shared_trades(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_comments_shared_trade_id_fk ON public.trade_comments(shared_trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_comments_user_id_fk ON public.trade_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_likes_user_id_fk ON public.trade_likes(user_id);

-- Education
CREATE INDEX IF NOT EXISTS idx_certifications_user_id_fk ON public.certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_course_id_fk ON public.certifications(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id_fk ON public.user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id_fk ON public.user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_lesson_id_fk ON public.user_course_progress(lesson_id);

-- Mentorship
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_id_fk ON public.mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentee_id_fk ON public.mentor_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor_id_fk ON public.mentorship_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee_id_fk ON public.mentorship_requests(mentee_id);

-- Challenges & Competition
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id_fk ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id_fk ON public.user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_user_id_fk ON public.competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_leaderboards_user_id_fk ON public.competition_leaderboards(user_id);

-- Trade ideas & social
CREATE INDEX IF NOT EXISTS idx_trade_idea_likes_user_id_fk ON public.trade_idea_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_idea_comments_user_id_fk ON public.trade_idea_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_idea_comments_idea_id_fk ON public.trade_idea_comments(idea_id);

-- Chat system
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id_fk ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_trade_reference_id_fk ON public.chat_messages(trade_reference_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id_fk ON public.chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by_fk ON public.chat_rooms(created_by);

-- Blog & content
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id_fk ON public.blog_posts(author_id);

-- Referrals & payments
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referral_id_fk ON public.referral_earnings(referral_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id_fk ON public.testimonials(user_id);

-- Reports
CREATE INDEX IF NOT EXISTS idx_generated_reports_user_id_fk ON public.generated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_user_id_fk ON public.scheduled_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_reports_user_id_fk ON public.performance_reports(user_id);

-- Marketplace & strategies
CREATE INDEX IF NOT EXISTS idx_strategy_marketplace_seller_id_fk ON public.strategy_marketplace(seller_id);

-- Streaming & live
CREATE INDEX IF NOT EXISTS idx_live_streams_streamer_id_fk ON public.live_streams(streamer_id);

-- Webinars & events
CREATE INDEX IF NOT EXISTS idx_webinars_instructor_id_fk ON public.webinars(instructor_id);

-- Email campaigns (if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_campaign_sends') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'email_campaign_sends' AND indexname = 'idx_email_campaign_sends_campaign_id_fk') THEN
      CREATE INDEX idx_email_campaign_sends_campaign_id_fk ON public.email_campaign_sends(campaign_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'email_campaign_sends' AND indexname = 'idx_email_campaign_sends_user_id_fk') THEN
      CREATE INDEX idx_email_campaign_sends_user_id_fk ON public.email_campaign_sends(user_id);
    END IF;
  END IF;
END $$;