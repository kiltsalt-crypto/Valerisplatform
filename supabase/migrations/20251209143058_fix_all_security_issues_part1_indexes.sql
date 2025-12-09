/*
  # Fix Security Issues - Part 1: Add Missing Foreign Key Indexes
  
  1. Performance Improvements
    - Add indexes for all unindexed foreign keys to improve query performance
    - These indexes are critical for JOIN operations and foreign key constraint checks
  
  2. Tables Affected (65 indexes added)
    - affiliate_payouts, ai_coach_analysis, ai_coach_conversations
    - alert_history, api_keys, audit_logs, automation_rules
    - backtests, chart_layouts, chat_messages, checklist_templates
    - community_posts, course_lessons, drawdown_periods
    - evaluation_challenges, export_history, following_traders
    - forum_posts, forum_threads, invoices, legal_acceptances
    - market_scans, pattern_alerts, payments, pnl_goals
    - portfolio_positions, portfolios, price_alerts, quiz_questions
    - quizzes, referrals, replay_sessions, session_stats
    - shared_trade_ideas, support_ticket_replies, trade_alerts
    - trade_copies, trade_ideas, trade_imports, trade_journal_entries
    - trade_simulations, trade_templates, trading_challenges_active
    - trading_room_messages, trading_sessions, trading_signals
    - trading_strategies, user_achievements, user_activity_logs
    - user_follows, user_lesson_progress, user_progress
    - user_quiz_attempts, user_sessions, user_video_progress
    - watchlists, webhook_endpoints
*/

-- Affiliate payouts
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_user_id ON public.affiliate_payouts(user_id);

-- AI Coach
CREATE INDEX IF NOT EXISTS idx_ai_coach_analysis_user_id ON public.ai_coach_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_user_id ON public.ai_coach_conversations(user_id);

-- Alerts
CREATE INDEX IF NOT EXISTS idx_alert_history_user_id ON public.alert_history(user_id);

-- API Keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Automation
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON public.automation_rules(user_id);

-- Backtests
CREATE INDEX IF NOT EXISTS idx_backtests_user_id ON public.backtests(user_id);

-- Charts
CREATE INDEX IF NOT EXISTS idx_chart_layouts_user_id ON public.chart_layouts(user_id);

-- Chat
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);

-- Checklists
CREATE INDEX IF NOT EXISTS idx_checklist_templates_user_id ON public.checklist_templates(user_id);

-- Community
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);

-- Courses
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);

-- Drawdown
CREATE INDEX IF NOT EXISTS idx_drawdown_periods_user_id ON public.drawdown_periods(user_id);

-- Evaluation
CREATE INDEX IF NOT EXISTS idx_evaluation_challenges_user_id ON public.evaluation_challenges(user_id);

-- Export
CREATE INDEX IF NOT EXISTS idx_export_history_user_id ON public.export_history(user_id);

-- Following
CREATE INDEX IF NOT EXISTS idx_following_traders_following_id ON public.following_traders(following_id);

-- Forum
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON public.forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON public.forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON public.forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user_id ON public.forum_threads(user_id);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);

-- Legal
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user_id ON public.legal_acceptances(user_id);

-- Market scans
CREATE INDEX IF NOT EXISTS idx_market_scans_user_id ON public.market_scans(user_id);

-- Pattern alerts
CREATE INDEX IF NOT EXISTS idx_pattern_alerts_user_id ON public.pattern_alerts(user_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- Goals
CREATE INDEX IF NOT EXISTS idx_pnl_goals_user_id ON public.pnl_goals(user_id);

-- Portfolio
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_portfolio_id ON public.portfolio_positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);

-- Price alerts
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON public.price_alerts(user_id);

-- Quizzes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes(course_id);

-- Referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);

-- Replay
CREATE INDEX IF NOT EXISTS idx_replay_sessions_user_id ON public.replay_sessions(user_id);

-- Sessions
CREATE INDEX IF NOT EXISTS idx_session_stats_user_id ON public.session_stats(user_id);

-- Shared trade ideas
CREATE INDEX IF NOT EXISTS idx_shared_trade_ideas_user_id ON public.shared_trade_ideas(user_id);

-- Support
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket_id ON public.support_ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_user_id ON public.support_ticket_replies(user_id);

-- Trade alerts
CREATE INDEX IF NOT EXISTS idx_trade_alerts_user_id ON public.trade_alerts(user_id);

-- Trade copies
CREATE INDEX IF NOT EXISTS idx_trade_copies_copied_trade_id ON public.trade_copies(copied_trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_copies_copier_id ON public.trade_copies(copier_id);
CREATE INDEX IF NOT EXISTS idx_trade_copies_original_trade_id ON public.trade_copies(original_trade_id);

-- Trade ideas
CREATE INDEX IF NOT EXISTS idx_trade_ideas_user_id ON public.trade_ideas(user_id);

-- Trade imports
CREATE INDEX IF NOT EXISTS idx_trade_imports_user_id ON public.trade_imports(user_id);

-- Trade journal
CREATE INDEX IF NOT EXISTS idx_trade_journal_entries_trade_id ON public.trade_journal_entries(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_journal_entries_user_id ON public.trade_journal_entries(user_id);

-- Trade simulations
CREATE INDEX IF NOT EXISTS idx_trade_simulations_user_id ON public.trade_simulations(user_id);

-- Trade templates
CREATE INDEX IF NOT EXISTS idx_trade_templates_user_id ON public.trade_templates(user_id);

-- Trading challenges
CREATE INDEX IF NOT EXISTS idx_trading_challenges_active_user_id ON public.trading_challenges_active(user_id);

-- Trading room
CREATE INDEX IF NOT EXISTS idx_trading_room_messages_user_id ON public.trading_room_messages(user_id);

-- Trading sessions
CREATE INDEX IF NOT EXISTS idx_trading_sessions_user_id ON public.trading_sessions(user_id);

-- Trading signals
CREATE INDEX IF NOT EXISTS idx_trading_signals_user_id ON public.trading_signals(user_id);

-- Trading strategies
CREATE INDEX IF NOT EXISTS idx_trading_strategies_user_id ON public.trading_strategies(user_id);

-- User achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- User activity
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);

-- User follows
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);

-- User progress
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON public.user_progress(module_id);

-- User quiz attempts
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_quiz_id ON public.user_quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_user_id ON public.user_quiz_attempts(user_id);

-- User sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- User video progress
CREATE INDEX IF NOT EXISTS idx_user_video_progress_video_id ON public.user_video_progress(video_id);

-- Watchlists
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);

-- Webhooks
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_user_id ON public.webhook_endpoints(user_id);
