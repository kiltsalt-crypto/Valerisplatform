/*
  # Optimize RLS Policies - Part 2 (Education & Social)

  1. Performance Optimization
    - Continue fixing auth.uid() -> (select auth.uid())
    - Remove duplicate policies

  2. Tables Fixed
    - user_video_progress, certifications, user_lesson_progress
    - trade_ideas, onboarding_status, subscription_tiers
    - export_history, ai_coach_*, forum_*, correlation_analysis
*/

-- USER VIDEO PROGRESS
DROP POLICY IF EXISTS "Users can view own video progress" ON public.user_video_progress;
CREATE POLICY "Users can view own video progress" ON public.user_video_progress
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own video progress" ON public.user_video_progress;
CREATE POLICY "Users can insert own video progress" ON public.user_video_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own video progress" ON public.user_video_progress;
CREATE POLICY "Users can update own video progress" ON public.user_video_progress
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- CERTIFICATIONS
DROP POLICY IF EXISTS "Users can view own certifications" ON public.certifications;
CREATE POLICY "Users can view own certifications" ON public.certifications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- USER LESSON PROGRESS
DROP POLICY IF EXISTS "Users view own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users view own lesson progress" ON public.user_lesson_progress
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users insert own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users insert own lesson progress" ON public.user_lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users update own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users update own lesson progress" ON public.user_lesson_progress
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADE IDEAS (Remove duplicates)
DROP POLICY IF EXISTS "Users can view own trade ideas" ON public.trade_ideas;
DROP POLICY IF EXISTS "Users can insert own trade ideas" ON public.trade_ideas;
DROP POLICY IF EXISTS "Users can update own trade ideas" ON public.trade_ideas;
DROP POLICY IF EXISTS "Users can delete own trade ideas" ON public.trade_ideas;
DROP POLICY IF EXISTS "Users can manage own trade ideas" ON public.trade_ideas;

CREATE POLICY "Users manage own trade ideas" ON public.trade_ideas
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Anyone can view published trade ideas" ON public.trade_ideas;
CREATE POLICY "Anyone can view published trade ideas" ON public.trade_ideas
  FOR SELECT TO authenticated
  USING (status = 'published' OR user_id = (SELECT auth.uid()));

-- ONBOARDING STATUS
DROP POLICY IF EXISTS "Users can view own onboarding status" ON public.onboarding_status;
CREATE POLICY "Users can view own onboarding status" ON public.onboarding_status
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own onboarding status" ON public.onboarding_status;
CREATE POLICY "Users can insert own onboarding status" ON public.onboarding_status
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own onboarding status" ON public.onboarding_status;
CREATE POLICY "Users can update own onboarding status" ON public.onboarding_status
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- SUBSCRIPTION TIERS
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscription_tiers;
CREATE POLICY "Users can view own subscription" ON public.subscription_tiers
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscription_tiers;
CREATE POLICY "Users can insert own subscription" ON public.subscription_tiers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscription_tiers;
CREATE POLICY "Users can update own subscription" ON public.subscription_tiers
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- EXPORT HISTORY
DROP POLICY IF EXISTS "Users can view own export history" ON public.export_history;
CREATE POLICY "Users can view own export history" ON public.export_history
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own export history" ON public.export_history;
CREATE POLICY "Users can insert own export history" ON public.export_history
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- AI COACH CONVERSATIONS
DROP POLICY IF EXISTS "Users can view own AI coach conversations" ON public.ai_coach_conversations;
CREATE POLICY "Users can view own AI coach conversations" ON public.ai_coach_conversations
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own AI coach conversations" ON public.ai_coach_conversations;
CREATE POLICY "Users can insert own AI coach conversations" ON public.ai_coach_conversations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- AI COACH ANALYSIS
DROP POLICY IF EXISTS "Users can view own AI coach analysis" ON public.ai_coach_analysis;
CREATE POLICY "Users can view own AI coach analysis" ON public.ai_coach_analysis
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own AI coach analysis" ON public.ai_coach_analysis;
CREATE POLICY "Users can insert own AI coach analysis" ON public.ai_coach_analysis
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- AI COACH PROGRESS
DROP POLICY IF EXISTS "Users can view own AI coach progress" ON public.ai_coach_progress;
CREATE POLICY "Users can view own AI coach progress" ON public.ai_coach_progress
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own AI coach progress" ON public.ai_coach_progress;
CREATE POLICY "Users can insert own AI coach progress" ON public.ai_coach_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own AI coach progress" ON public.ai_coach_progress;
CREATE POLICY "Users can update own AI coach progress" ON public.ai_coach_progress
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- FORUM THREADS
DROP POLICY IF EXISTS "Users create threads" ON public.forum_threads;
CREATE POLICY "Users create threads" ON public.forum_threads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users update own threads" ON public.forum_threads;
CREATE POLICY "Users update own threads" ON public.forum_threads
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- FORUM POSTS
DROP POLICY IF EXISTS "Users create posts" ON public.forum_posts;
CREATE POLICY "Users create posts" ON public.forum_posts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users update own posts" ON public.forum_posts;
CREATE POLICY "Users update own posts" ON public.forum_posts
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- CORRELATION ANALYSIS
DROP POLICY IF EXISTS "Users can view own correlation analysis" ON public.correlation_analysis;
CREATE POLICY "Users can view own correlation analysis" ON public.correlation_analysis
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create correlation analysis" ON public.correlation_analysis;
CREATE POLICY "Users can create correlation analysis" ON public.correlation_analysis
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own correlation analysis" ON public.correlation_analysis;
CREATE POLICY "Users can update own correlation analysis" ON public.correlation_analysis
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- DRAWDOWN PERIODS
DROP POLICY IF EXISTS "Users can view own drawdown periods" ON public.drawdown_periods;
CREATE POLICY "Users can view own drawdown periods" ON public.drawdown_periods
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create drawdown periods" ON public.drawdown_periods;
CREATE POLICY "Users can create drawdown periods" ON public.drawdown_periods
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own drawdown periods" ON public.drawdown_periods;
CREATE POLICY "Users can update own drawdown periods" ON public.drawdown_periods
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));