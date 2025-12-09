/*
  # Fix Security Issues - Part 4: Consolidate Duplicate Policies (Batch 2)
  
  1. Security Improvements
    - Continue consolidating multiple permissive policies
  
  2. Tables Fixed (10 more tables)
    - following_traders, forum_categories, forum_posts, forum_threads
    - leaderboard_entries, learning_modules, live_streams, mentor_profiles
    - quiz_questions, quizzes
*/

-- Following traders: Keep one policy
DROP POLICY IF EXISTS "Users manage own following" ON public.following_traders;

-- Forum categories: Keep one policy
DROP POLICY IF EXISTS "Public can view categories" ON public.forum_categories;

-- Forum posts: Keep one policy
DROP POLICY IF EXISTS "Public can view posts" ON public.forum_posts;

-- Forum threads: Keep one policy
DROP POLICY IF EXISTS "Public can view threads" ON public.forum_threads;

-- Leaderboard entries: Keep one policy
DROP POLICY IF EXISTS "Public can view leaderboard" ON public.leaderboard_entries;

-- Learning modules: Keep one policy
DROP POLICY IF EXISTS "Authenticated users can view learning modules" ON public.learning_modules;

-- Live streams: Keep one policy
DROP POLICY IF EXISTS "Streamers manage own streams" ON public.live_streams;

-- Mentor profiles: Keep one policy
DROP POLICY IF EXISTS "Mentors manage own profiles" ON public.mentor_profiles;

-- Quiz questions: Keep one policy
DROP POLICY IF EXISTS "Users can view quiz questions" ON public.quiz_questions;

-- Quizzes: Keep one policy
DROP POLICY IF EXISTS "Users can view quizzes" ON public.quizzes;
