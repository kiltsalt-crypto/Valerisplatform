/*
  # Comprehensive Business Features Schema

  ## Overview
  This migration adds all business-critical features including payments, affiliates,
  analytics, gamification, social features, and admin capabilities.

  ## New Tables

  ### Payment & Invoice System
  - `payments` - Track manual payment records
  - `invoices` - Generate invoices for subscriptions
  
  ### Affiliate Program
  - `referrals` - Track referral relationships
  - `referral_earnings` - Track commission earnings
  - `affiliate_payouts` - Track payout history

  ### Analytics & Engagement
  - `user_activity_logs` - Track user actions and engagement
  - `feature_usage_analytics` - Track feature usage patterns
  - `user_sessions` - Track user sessions
  
  ### Gamification
  - `user_achievements` - User achievement records
  - `achievement_definitions` - Available achievements
  - `user_experience` - XP and level system
  - `trading_challenges_active` - Active challenge participations
  
  ### Social Features
  - `user_follows` - User following relationships
  - `shared_trades` - Publicly shared trades
  - `trade_comments` - Comments on shared trades
  - `trade_likes` - Likes on shared trades
  
  ### Export & Reporting
  - `generated_reports` - Store generated PDF reports
  - `scheduled_reports` - Scheduled report configurations
  
  ### Admin & Security
  - `admin_users` - Admin user roles
  - `two_factor_auth` - 2FA settings
  - `api_keys` - User API keys for integrations
  - `audit_logs` - Security and action audit trail
  
  ### Content & Marketing
  - `blog_posts` - Blog content for SEO
  - `testimonials` - User testimonials
  - `webinars` - Webinar schedule and recordings
  - `email_campaigns` - Email drip campaigns
  - `email_campaign_sends` - Track email sends
  
  ### Integrations
  - `broker_connections` - Connected broker accounts
  - `webhook_endpoints` - User webhook configurations
  - `notification_preferences` - Push notification settings
*/

-- Payment & Invoice System
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text,
  transaction_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  due_date timestamptz,
  paid_at timestamptz,
  invoice_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Referral/Affiliate System
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  commission_rate decimal(5,2) DEFAULT 20.00,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

CREATE TABLE IF NOT EXISTS referral_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES referrals(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method text,
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

-- Analytics System
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_usage_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_name text NOT NULL,
  usage_count integer DEFAULT 1,
  last_used_at timestamptz DEFAULT now(),
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_name, date)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  duration_seconds integer,
  ip_address text,
  user_agent text,
  device_type text,
  created_at timestamptz DEFAULT now()
);

-- Gamification System
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  category text,
  points integer DEFAULT 0,
  criteria jsonb,
  tier text CHECK (tier IN ('free', 'pro', 'elite', 'mentorship')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievement_definitions(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS user_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trading_challenges_active (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id uuid NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  progress jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  reward_claimed boolean DEFAULT false
);

-- Social Features
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS shared_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trade_id uuid REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  caption text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trade_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_trade_id uuid REFERENCES shared_trades(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trade_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_trade_id uuid REFERENCES shared_trades(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(shared_trade_id, user_id)
);

-- Export & Reporting
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type text NOT NULL,
  file_url text,
  file_size integer,
  parameters jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type text NOT NULL,
  frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  parameters jsonb,
  enabled boolean DEFAULT true,
  next_run_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Admin & Security
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role text DEFAULT 'support' CHECK (role IN ('super_admin', 'admin', 'support', 'analyst')),
  permissions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS two_factor_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  enabled boolean DEFAULT false,
  secret text,
  backup_codes text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key_name text NOT NULL,
  key_hash text NOT NULL,
  key_preview text NOT NULL,
  permissions jsonb DEFAULT '[]',
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Content & Marketing
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  featured_image text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  tags text[],
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  role text,
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  avatar_url text,
  featured boolean DEFAULT false,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webinars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  max_attendees integer,
  registration_url text,
  recording_url text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  campaign_type text CHECK (campaign_type IN ('welcome', 'educational', 'reengagement', 'promotional')),
  subject text NOT NULL,
  content text NOT NULL,
  trigger_event text,
  delay_hours integer DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_campaign_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'))
);

-- Integrations
CREATE TABLE IF NOT EXISTS broker_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  broker_name text NOT NULL,
  account_id text,
  credentials_encrypted text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'error')),
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL,
  secret text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT false,
  push_subscription jsonb,
  notification_types jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_shared_trades_user_id ON shared_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS on all tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_challenges_active ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can view own data)
CREATE POLICY "Users view own payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own invoices" ON invoices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own referrals" ON referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users view own earnings" ON referral_earnings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM referrals WHERE referrals.id = referral_earnings.referral_id AND referrals.referrer_id = auth.uid()));
CREATE POLICY "Users view own payouts" ON affiliate_payouts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own activity" ON user_activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own analytics" ON feature_usage_analytics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own sessions" ON user_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "All users view achievements" ON achievement_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users view own achievements" ON user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own XP" ON user_experience FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own challenges" ON trading_challenges_active FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage follows" ON user_follows FOR ALL TO authenticated USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Public shared trades" ON shared_trades FOR SELECT TO authenticated USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users create shared trades" ON shared_trades FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "View public comments" ON trade_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create comments" ON trade_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage likes" ON trade_likes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own reports" ON generated_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage scheduled reports" ON scheduled_reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own 2FA" ON two_factor_auth FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own 2FA" ON two_factor_auth FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage API keys" ON api_keys FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public blog posts" ON blog_posts FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "Approved testimonials" ON testimonials FOR SELECT TO authenticated USING (approved = true);
CREATE POLICY "Public webinars" ON webinars FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users view own notifications" ON notification_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own connections" ON broker_connections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage webhooks" ON webhook_endpoints FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_activity_date = CURRENT_DATE THEN
    RETURN NEW;
  END IF;
  
  IF NEW.last_activity_date = CURRENT_DATE - 1 THEN
    NEW.current_streak := NEW.current_streak + 1;
    IF NEW.current_streak > NEW.longest_streak THEN
      NEW.longest_streak := NEW.current_streak;
    END IF;
  ELSE
    NEW.current_streak := 1;
  END IF;
  
  NEW.last_activity_date := CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_streak
  BEFORE UPDATE ON user_experience
  FOR EACH ROW
  EXECUTE FUNCTION update_streak();