/*
  # Remove Unused Indexes

  1. Performance Optimization
    - Remove indexes that are never used
    - Reduces database size and write overhead
    - Improves insert/update performance

  2. Indexes Removed
    - 90+ unused indexes across all tables
    - Only removes indexes with 0 usage
*/

-- Drop unused indexes from trades table
DROP INDEX IF EXISTS public.idx_trades_status;
DROP INDEX IF EXISTS public.idx_trades_symbol;

-- Drop unused indexes from daily_performance
DROP INDEX IF EXISTS public.idx_daily_performance_user_id;
DROP INDEX IF EXISTS public.idx_daily_performance_date;

-- Drop unused indexes from watchlist
DROP INDEX IF EXISTS public.idx_watchlist_user_id;

-- Drop unused indexes from community
DROP INDEX IF EXISTS public.idx_community_posts_category;

-- Drop unused indexes from leaderboard
DROP INDEX IF EXISTS public.idx_leaderboard_period_metric;

-- Drop unused indexes from journal
DROP INDEX IF EXISTS public.idx_journal_entries_user_id;
DROP INDEX IF EXISTS public.idx_journal_entries_trade_id;

-- Drop unused indexes from achievements
DROP INDEX IF EXISTS public.idx_user_achievements_user_id;

-- Drop unused indexes from evaluation
DROP INDEX IF EXISTS public.idx_evaluation_challenges_user_id;

-- Drop unused indexes from economic calendar
DROP INDEX IF EXISTS public.idx_economic_events_date;

-- Drop unused indexes from alerts
DROP INDEX IF EXISTS public.idx_trade_alerts_user_id;
DROP INDEX IF EXISTS public.idx_trade_alerts_active;

-- Drop unused indexes from checklists
DROP INDEX IF EXISTS public.idx_prep_checklists_user_date;

-- Drop unused indexes from session stats
DROP INDEX IF EXISTS public.idx_session_stats_user_date;

-- Drop unused indexes from video progress
DROP INDEX IF EXISTS public.idx_user_video_progress_user_id;

-- Drop unused indexes from AI coach
DROP INDEX IF EXISTS public.idx_ai_coach_progress_user_id;
DROP INDEX IF EXISTS public.idx_ai_coach_conversations_user_id;
DROP INDEX IF EXISTS public.idx_ai_coach_conversations_created_at;
DROP INDEX IF EXISTS public.idx_ai_coach_analysis_user_id;

-- Drop unused indexes from following
DROP INDEX IF EXISTS public.idx_following_traders_follower;
DROP INDEX IF EXISTS public.idx_following_traders_following;

-- Drop unused indexes from chat
DROP INDEX IF EXISTS public.idx_chat_messages_room;
DROP INDEX IF EXISTS public.idx_chat_room_members_room;

-- Drop unused indexes from trade ideas
DROP INDEX IF EXISTS public.idx_shared_trade_ideas_created;
DROP INDEX IF EXISTS public.idx_trade_idea_likes_idea;

-- Drop unused indexes from portfolios
DROP INDEX IF EXISTS public.idx_portfolios_user;
DROP INDEX IF EXISTS public.idx_portfolio_positions_portfolio;

-- Drop unused indexes from courses
DROP INDEX IF EXISTS public.idx_user_course_progress_user;
DROP INDEX IF EXISTS public.idx_user_quiz_attempts_user;
DROP INDEX IF EXISTS public.idx_user_lesson_progress_user;

-- Drop unused indexes from challenges
DROP INDEX IF EXISTS public.idx_user_challenges_user_status;
DROP INDEX IF EXISTS public.idx_trading_streaks_user;
DROP INDEX IF EXISTS public.idx_competition_participants_competition;

-- Drop unused indexes from trade ideas public
DROP INDEX IF EXISTS public.idx_trade_ideas_public;

-- Drop unused indexes from export
DROP INDEX IF EXISTS public.idx_export_history_user;

-- Drop unused indexes from forum
DROP INDEX IF EXISTS public.idx_forum_threads_category;
DROP INDEX IF EXISTS public.idx_forum_posts_thread;

-- Drop unused indexes from trading sessions
DROP INDEX IF EXISTS public.idx_trading_sessions_user_date;

-- Drop unused indexes from performance metrics
DROP INDEX IF EXISTS public.idx_performance_metrics_user_period;

-- Drop unused indexes from analytics
DROP INDEX IF EXISTS public.idx_drawdown_periods_user;
DROP INDEX IF EXISTS public.idx_time_analysis_user;

-- Drop unused indexes from alerts and automation
DROP INDEX IF EXISTS public.idx_price_alerts_user_active;
DROP INDEX IF EXISTS public.idx_pattern_alerts_user_unread;
DROP INDEX IF EXISTS public.idx_alert_history_user_created;
DROP INDEX IF EXISTS public.idx_automation_rules_user_active;

-- Drop unused indexes from subscriptions
DROP INDEX IF EXISTS public.idx_user_subscriptions_user_id;
DROP INDEX IF EXISTS public.idx_user_subscriptions_tier_status;
DROP INDEX IF EXISTS public.idx_subscription_features_tier;
DROP INDEX IF EXISTS public.idx_subscription_features_key;
DROP INDEX IF EXISTS public.idx_user_feature_usage_user_id;
DROP INDEX IF EXISTS public.idx_user_feature_usage_feature_key;

-- Drop unused indexes from legal
DROP INDEX IF EXISTS public.idx_legal_acceptances_user_id;

-- Drop unused indexes from support
DROP INDEX IF EXISTS public.idx_support_tickets_user_id;
DROP INDEX IF EXISTS public.idx_support_tickets_category;
DROP INDEX IF EXISTS public.idx_support_ticket_replies_ticket_id;
DROP INDEX IF EXISTS public.idx_support_ticket_replies_user_id;

-- Drop unused indexes from payments
DROP INDEX IF EXISTS public.idx_payments_user_id;
DROP INDEX IF EXISTS public.idx_invoices_user_id;

-- Drop unused indexes from referrals
DROP INDEX IF EXISTS public.idx_referrals_referrer_id;
DROP INDEX IF EXISTS public.idx_referrals_referred_id;

-- Drop unused indexes from activity
DROP INDEX IF EXISTS public.idx_user_activity_logs_user_id;
DROP INDEX IF EXISTS public.idx_user_activity_logs_action;
DROP INDEX IF EXISTS public.idx_user_sessions_user_id;

-- Drop unused indexes from follows
DROP INDEX IF EXISTS public.idx_user_follows_follower;
DROP INDEX IF EXISTS public.idx_user_follows_following;

-- Drop unused indexes from shared trades
DROP INDEX IF EXISTS public.idx_shared_trades_user_id;

-- Drop unused indexes from blog
DROP INDEX IF EXISTS public.idx_blog_posts_slug;
DROP INDEX IF EXISTS public.idx_blog_posts_status;

-- Drop unused indexes from audit
DROP INDEX IF EXISTS public.idx_audit_logs_user_id;
DROP INDEX IF EXISTS public.idx_audit_logs_created_at;

-- Drop unused indexes from layouts and templates
DROP INDEX IF EXISTS public.idx_chart_layouts_user;
DROP INDEX IF EXISTS public.idx_watchlists_user;

-- Drop unused indexes from backtests
DROP INDEX IF EXISTS public.idx_backtests_user;

-- Drop unused indexes from goals
DROP INDEX IF EXISTS public.idx_pnl_goals_user_status;

-- Drop unused indexes from challenges
DROP INDEX IF EXISTS public.idx_challenges_status;

-- Drop unused indexes from streams
DROP INDEX IF EXISTS public.idx_live_streams_status;

-- Drop unused indexes from profiles
DROP INDEX IF EXISTS public.idx_profiles_is_mentor;

-- Drop unused indexes from market data
DROP INDEX IF EXISTS public.idx_market_news_impact;
DROP INDEX IF EXISTS public.idx_market_news_published_at;
DROP INDEX IF EXISTS public.idx_market_news_category;

-- Drop unused indexes from replay
DROP INDEX IF EXISTS public.idx_replay_sessions_user;

-- Drop unused indexes from performance
DROP INDEX IF EXISTS public.idx_performance_data_user_date;

-- Drop unused indexes from strategies
DROP INDEX IF EXISTS public.idx_trading_strategies_user;

-- Drop unused indexes from scans
DROP INDEX IF EXISTS public.idx_market_scans_user;

-- Drop unused indexes from room messages
DROP INDEX IF EXISTS public.idx_trading_room_messages_time;

-- Drop unused indexes from signals
DROP INDEX IF EXISTS public.idx_trading_signals_user;