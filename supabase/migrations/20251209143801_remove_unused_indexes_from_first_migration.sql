/*
  # Remove Unused Indexes from First Migration
  
  1. Performance Improvements
    - Remove 65 indexes that have not been used
    - Reduces storage overhead and improves write performance
    - These indexes consume resources during INSERT/UPDATE/DELETE operations
  
  2. Indexes Removed
    - User-related: affiliate_payouts, ai_coach_analysis, ai_coach_conversations
    - Alerts: alert_history, api_keys
    - Admin: audit_logs (admin_id and user_id)
    - Automation: automation_rules
    - Trading: backtests, chart_layouts, checklist_templates
    - Community: community_posts
    - Education: course_lessons
    - Performance: drawdown_periods, evaluation_challenges
    - Data: export_history
    - Social: following_traders
    - Forum: forum_posts, forum_threads
    - Finance: invoices, legal_acceptances
    - Market: market_scans, pattern_alerts
    - Payments: payments, pnl_goals
    - Portfolio: portfolio_positions, portfolios
    - Alerts: price_alerts
    - Quizzes: quiz_questions, quizzes
    - Referrals: referrals
    - Replay: replay_sessions
    - Stats: session_stats
    - Shared: shared_trade_ideas
    - Support: support_ticket_replies
    - Trade: Multiple trade-related tables
    - Trading: Multiple trading-related tables
    - Users: Multiple user-related tables
    - Watchlists: watchlists
    - Webhooks: webhook_endpoints
*/

-- Drop all unused indexes from first migration
DROP INDEX IF EXISTS public.idx_affiliate_payouts_user_id;
DROP INDEX IF EXISTS public.idx_ai_coach_analysis_user_id;
DROP INDEX IF EXISTS public.idx_ai_coach_conversations_user_id;
DROP INDEX IF EXISTS public.idx_alert_history_user_id;
DROP INDEX IF EXISTS public.idx_api_keys_user_id;
DROP INDEX IF EXISTS public.idx_audit_logs_admin_id;
DROP INDEX IF EXISTS public.idx_audit_logs_user_id;
DROP INDEX IF EXISTS public.idx_automation_rules_user_id;
DROP INDEX IF EXISTS public.idx_backtests_user_id;
DROP INDEX IF EXISTS public.idx_chart_layouts_user_id;
DROP INDEX IF EXISTS public.idx_chat_messages_room_id;
DROP INDEX IF EXISTS public.idx_checklist_templates_user_id;
DROP INDEX IF EXISTS public.idx_community_posts_user_id;
DROP INDEX IF EXISTS public.idx_course_lessons_course_id;
DROP INDEX IF EXISTS public.idx_drawdown_periods_user_id;
DROP INDEX IF EXISTS public.idx_evaluation_challenges_user_id;
DROP INDEX IF EXISTS public.idx_export_history_user_id;
DROP INDEX IF EXISTS public.idx_following_traders_following_id;
DROP INDEX IF EXISTS public.idx_forum_posts_thread_id;
DROP INDEX IF EXISTS public.idx_forum_posts_user_id;
DROP INDEX IF EXISTS public.idx_forum_threads_category_id;
DROP INDEX IF EXISTS public.idx_forum_threads_user_id;
DROP INDEX IF EXISTS public.idx_invoices_user_id;
DROP INDEX IF EXISTS public.idx_legal_acceptances_user_id;
DROP INDEX IF EXISTS public.idx_market_scans_user_id;
DROP INDEX IF EXISTS public.idx_pattern_alerts_user_id;
DROP INDEX IF EXISTS public.idx_payments_user_id;
DROP INDEX IF EXISTS public.idx_pnl_goals_user_id;
DROP INDEX IF EXISTS public.idx_portfolio_positions_portfolio_id;
DROP INDEX IF EXISTS public.idx_portfolios_user_id;
DROP INDEX IF EXISTS public.idx_price_alerts_user_id;
DROP INDEX IF EXISTS public.idx_quiz_questions_quiz_id;
DROP INDEX IF EXISTS public.idx_quizzes_course_id;
DROP INDEX IF EXISTS public.idx_referrals_referred_id;
DROP INDEX IF EXISTS public.idx_replay_sessions_user_id;
DROP INDEX IF EXISTS public.idx_session_stats_user_id;
DROP INDEX IF EXISTS public.idx_shared_trade_ideas_user_id;
DROP INDEX IF EXISTS public.idx_support_ticket_replies_ticket_id;
DROP INDEX IF EXISTS public.idx_support_ticket_replies_user_id;
DROP INDEX IF EXISTS public.idx_trade_alerts_user_id;
DROP INDEX IF EXISTS public.idx_trade_copies_copied_trade_id;
DROP INDEX IF EXISTS public.idx_trade_copies_copier_id;
DROP INDEX IF EXISTS public.idx_trade_copies_original_trade_id;
DROP INDEX IF EXISTS public.idx_trade_ideas_user_id;
DROP INDEX IF EXISTS public.idx_trade_imports_user_id;
DROP INDEX IF EXISTS public.idx_trade_journal_entries_trade_id;
DROP INDEX IF EXISTS public.idx_trade_journal_entries_user_id;
DROP INDEX IF EXISTS public.idx_trade_simulations_user_id;
DROP INDEX IF EXISTS public.idx_trade_templates_user_id;
DROP INDEX IF EXISTS public.idx_trading_challenges_active_user_id;
DROP INDEX IF EXISTS public.idx_trading_room_messages_user_id;
DROP INDEX IF EXISTS public.idx_trading_sessions_user_id;
DROP INDEX IF EXISTS public.idx_trading_signals_user_id;
DROP INDEX IF EXISTS public.idx_trading_strategies_user_id;
DROP INDEX IF EXISTS public.idx_user_achievements_achievement_id;
DROP INDEX IF EXISTS public.idx_user_activity_logs_user_id;
DROP INDEX IF EXISTS public.idx_user_follows_following_id;
DROP INDEX IF EXISTS public.idx_user_lesson_progress_lesson_id;
DROP INDEX IF EXISTS public.idx_user_progress_module_id;
DROP INDEX IF EXISTS public.idx_user_quiz_attempts_quiz_id;
DROP INDEX IF EXISTS public.idx_user_quiz_attempts_user_id;
DROP INDEX IF EXISTS public.idx_user_sessions_user_id;
DROP INDEX IF EXISTS public.idx_user_video_progress_video_id;
DROP INDEX IF EXISTS public.idx_watchlists_user_id;
DROP INDEX IF EXISTS public.idx_webhook_endpoints_user_id;
