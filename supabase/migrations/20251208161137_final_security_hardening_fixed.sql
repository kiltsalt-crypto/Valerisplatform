/*
  # Final Security Hardening - Fixed

  1. Additional Security Measures
    - Add missing policies for read-only tables
    - Ensure all public tables have proper access controls
    - Add restrictive policies for sensitive tables

  2. Security Enhancements
    - Achievements, learning modules, competitions public read
    - Economic events public read
    - Challenges public read
*/

-- ACHIEVEMENTS - Public read access
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Public can view achievements" ON public.achievements;
CREATE POLICY "Public can view achievements" ON public.achievements
  FOR SELECT TO authenticated, anon
  USING (true);

-- LEARNING MODULES - Public read access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learning_modules') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view learning modules" ON public.learning_modules';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view learning modules" ON public.learning_modules';
    EXECUTE 'CREATE POLICY "Authenticated users can view learning modules" ON public.learning_modules FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- COURSES - Public read access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public can view published courses" ON public.courses';
    EXECUTE 'CREATE POLICY "Public can view courses" ON public.courses FOR SELECT TO authenticated, anon USING (true)';
  END IF;
END $$;

-- COURSE LESSONS - Public read access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view course lessons" ON public.course_lessons';
    EXECUTE 'CREATE POLICY "Users can view course lessons" ON public.course_lessons FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- QUIZZES - Public read access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quizzes') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view quizzes" ON public.quizzes';
    EXECUTE 'CREATE POLICY "Users can view quizzes" ON public.quizzes FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- QUIZ QUESTIONS - Public read access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_questions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view quiz questions" ON public.quiz_questions';
    EXECUTE 'CREATE POLICY "Users can view quiz questions" ON public.quiz_questions FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- ECONOMIC EVENTS - Public read access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'economic_events') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view economic events" ON public.economic_events';
    EXECUTE 'DROP POLICY IF EXISTS "events_read" ON public.economic_events';
    EXECUTE 'CREATE POLICY "Anyone can view economic events" ON public.economic_events FOR SELECT TO authenticated, anon USING (true)';
  END IF;
END $$;

-- TRADING CHALLENGES - Public read access
DROP POLICY IF EXISTS "Public can view challenges" ON public.trading_challenges;
CREATE POLICY "Public can view challenges" ON public.trading_challenges
  FOR SELECT TO authenticated, anon
  USING (true);

-- DAILY CHALLENGES - Public read access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_challenges') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view daily challenges" ON public.daily_challenges';
    EXECUTE 'CREATE POLICY "Users can view daily challenges" ON public.daily_challenges FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- COMPETITIONS - Public read access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'competitions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public can view competitions" ON public.competitions';
    EXECUTE 'CREATE POLICY "Public can view competitions" ON public.competitions FOR SELECT TO authenticated, anon USING (true)';
  END IF;
END $$;

-- COMPETITION LEADERBOARDS - Public read access
DROP POLICY IF EXISTS "Public can view leaderboard" ON public.competition_leaderboards;
CREATE POLICY "Public can view leaderboard" ON public.competition_leaderboards
  FOR SELECT TO authenticated
  USING (true);

-- SUBSCRIPTION FEATURES - Public read access
DROP POLICY IF EXISTS "Public can view subscription features" ON public.subscription_features;
CREATE POLICY "Public can view subscription features" ON public.subscription_features
  FOR SELECT TO authenticated, anon
  USING (true);

-- LEADERBOARD ENTRIES - Public read access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leaderboard_entries') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public can view leaderboard" ON public.leaderboard_entries';
    EXECUTE 'CREATE POLICY "Public can view leaderboard" ON public.leaderboard_entries FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- FORUM CATEGORIES - Public read access
DROP POLICY IF EXISTS "Public can view categories" ON public.forum_categories;
CREATE POLICY "Public can view categories" ON public.forum_categories
  FOR SELECT TO authenticated
  USING (true);

-- FORUM THREADS - Public read access
DROP POLICY IF EXISTS "Public can view threads" ON public.forum_threads;
CREATE POLICY "Public can view threads" ON public.forum_threads
  FOR SELECT TO authenticated
  USING (true);

-- FORUM POSTS - Public read access
DROP POLICY IF EXISTS "Public can view posts" ON public.forum_posts;
CREATE POLICY "Public can view posts" ON public.forum_posts
  FOR SELECT TO authenticated
  USING (true);

-- BLOG POSTS - Public read for published posts
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
CREATE POLICY "Public can view published posts" ON public.blog_posts
  FOR SELECT TO authenticated, anon
  USING (status = 'published');

-- TESTIMONIALS - Public read for approved testimonials
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;
CREATE POLICY "Public can view approved testimonials" ON public.testimonials
  FOR SELECT TO authenticated, anon
  USING (approved = true);

-- WEBINARS - Public read access
DROP POLICY IF EXISTS "Public can view webinars" ON public.webinars;
CREATE POLICY "Public can view webinars" ON public.webinars
  FOR SELECT TO authenticated
  USING (true);

-- Add admin-only policies for reference data tables
CREATE POLICY "Admins can manage achievements" ON public.achievements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can manage challenges" ON public.trading_challenges
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (
    author_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true)
  )
  WITH CHECK (
    author_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true)
  );

-- Ensure CERTIFICATIONS can be verified by anyone
DROP POLICY IF EXISTS "Anyone can verify certifications by code" ON public.certifications;
CREATE POLICY "Anyone can verify certifications by code" ON public.certifications
  FOR SELECT TO authenticated, anon
  USING (verification_code IS NOT NULL);