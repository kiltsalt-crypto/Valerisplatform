/*
  # Fix Security Issues - Part 4: Consolidate Duplicate Policies (Batch 1)
  
  1. Security Improvements
    - Consolidate multiple permissive policies into single comprehensive policies
    - Reduces confusion and potential security gaps
    - Improves RLS evaluation performance
  
  2. Tables Fixed (10 tables)
    - achievements, blog_posts, certifications, challenge_participants
    - competition_leaderboards, competition_participants, competitions
    - course_lessons, courses, daily_challenges
*/

-- Achievements: Keep public view policy
DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;

-- Blog posts: Consolidate to single view policy
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
CREATE POLICY "View blog posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (
    published_at IS NOT NULL
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (select auth.uid()))
  );

-- Certifications: Keep user-centric policy
DROP POLICY IF EXISTS "Anyone can verify certifications by code" ON public.certifications;

-- Challenge participants: Keep public view
DROP POLICY IF EXISTS "Users manage own challenge participations" ON public.challenge_participants;

-- Competition leaderboards: Keep one public view
DROP POLICY IF EXISTS "Public can view leaderboard" ON public.competition_leaderboards;

-- Competition participants: Keep public view
DROP POLICY IF EXISTS "Users can view own participation" ON public.competition_participants;

-- Competitions: Keep one public view
DROP POLICY IF EXISTS "Public can view competitions" ON public.competitions;

-- Course lessons: Keep one policy
DROP POLICY IF EXISTS "Users can view course lessons" ON public.course_lessons;

-- Courses: Consolidate to single view policy
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
CREATE POLICY "View courses"
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (
    is_published = true
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (select auth.uid()))
  );

-- Daily challenges: Keep one view policy
DROP POLICY IF EXISTS "Users can view daily challenges" ON public.daily_challenges;
