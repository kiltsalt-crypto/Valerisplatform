/*
  # Optimize RLS Policies - Part 3 (Trading & Analytics) - Fixed

  1. Performance Optimization
    - Continue fixing auth.uid() -> (select auth.uid())
    - Remove duplicate policies

  2. Tables Fixed
    - chat_rooms, portfolio_*, following_traders, trade_copies
    - mentorship_requests, trading_sessions, shared_trade_ideas
    - performance_metrics, time_analysis, expectancy_data
*/

-- CHAT ROOMS
DROP POLICY IF EXISTS "Anyone can view public chat rooms" ON public.chat_rooms;
CREATE POLICY "Anyone can view public chat rooms" ON public.chat_rooms
  FOR SELECT TO authenticated
  USING (is_private = false OR created_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create chat rooms" ON public.chat_rooms;
CREATE POLICY "Authenticated users can create chat rooms" ON public.chat_rooms
  FOR INSERT TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

-- PORTFOLIO ALLOCATIONS
DROP POLICY IF EXISTS "Users can manage own portfolio allocations" ON public.portfolio_allocations;
CREATE POLICY "Users can manage own portfolio allocations" ON public.portfolio_allocations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios 
      WHERE portfolios.id = portfolio_allocations.portfolio_id 
      AND portfolios.user_id = (SELECT auth.uid())
    )
  );

-- FOLLOWING TRADERS (Remove duplicates)
DROP POLICY IF EXISTS "Users can follow others" ON public.following_traders;
DROP POLICY IF EXISTS "Users can unfollow" ON public.following_traders;
DROP POLICY IF EXISTS "Users can update their following settings" ON public.following_traders;
DROP POLICY IF EXISTS "Users can view their following relationships" ON public.following_traders;
DROP POLICY IF EXISTS "Users manage own following" ON public.following_traders;
DROP POLICY IF EXISTS "Users can view following relationships" ON public.following_traders;

CREATE POLICY "Users manage own following" ON public.following_traders
  FOR ALL TO authenticated
  USING (follower_id = (SELECT auth.uid()))
  WITH CHECK (follower_id = (SELECT auth.uid()));

CREATE POLICY "Users can view following relationships" ON public.following_traders
  FOR SELECT TO authenticated
  USING (true);

-- TRADE COPIES (Remove duplicates)
DROP POLICY IF EXISTS "Users can create trade copies" ON public.trade_copies;
DROP POLICY IF EXISTS "Users can view their trade copies" ON public.trade_copies;
DROP POLICY IF EXISTS "Users manage own trade copies" ON public.trade_copies;

CREATE POLICY "Users manage own trade copies" ON public.trade_copies
  FOR ALL TO authenticated
  USING (copier_id = (SELECT auth.uid()))
  WITH CHECK (copier_id = (SELECT auth.uid()));

-- CHAT ROOM MEMBERS
DROP POLICY IF EXISTS "Members can view room membership" ON public.chat_room_members;
CREATE POLICY "Members can view room membership" ON public.chat_room_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_members AS crm
      WHERE crm.room_id = chat_room_members.room_id 
      AND crm.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can join public rooms" ON public.chat_room_members;
CREATE POLICY "Users can join public rooms" ON public.chat_room_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE chat_rooms.id = chat_room_members.room_id 
      AND chat_rooms.is_private = false
    )
  );

-- CHAT MESSAGES
DROP POLICY IF EXISTS "Room members can send messages" ON public.chat_messages;
CREATE POLICY "Room members can send messages" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.chat_room_members 
      WHERE chat_room_members.room_id = chat_messages.room_id 
      AND chat_room_members.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Room members can view chat messages" ON public.chat_messages;
CREATE POLICY "Room members can view chat messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_members 
      WHERE chat_room_members.room_id = chat_messages.room_id 
      AND chat_room_members.user_id = (SELECT auth.uid())
    )
  );

-- MENTORSHIP REQUESTS (Remove duplicates)
DROP POLICY IF EXISTS "Users can create mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Users can update mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Users can view their mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Users manage own mentorship requests" ON public.mentorship_requests;

CREATE POLICY "Users manage own mentorship requests" ON public.mentorship_requests
  FOR ALL TO authenticated
  USING (mentee_id = (SELECT auth.uid()) OR mentor_id = (SELECT auth.uid()))
  WITH CHECK (mentee_id = (SELECT auth.uid()));

-- TRADING SESSIONS
DROP POLICY IF EXISTS "Users can view own trading sessions" ON public.trading_sessions;
CREATE POLICY "Users can view own trading sessions" ON public.trading_sessions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create trading sessions" ON public.trading_sessions;
CREATE POLICY "Users can create trading sessions" ON public.trading_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own trading sessions" ON public.trading_sessions;
CREATE POLICY "Users can update own trading sessions" ON public.trading_sessions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- SHARED TRADE IDEAS (Remove duplicates)
DROP POLICY IF EXISTS "Users can create trade ideas" ON public.shared_trade_ideas;
DROP POLICY IF EXISTS "Users can update own trade ideas" ON public.shared_trade_ideas;
DROP POLICY IF EXISTS "Users manage own trade ideas" ON public.shared_trade_ideas;
DROP POLICY IF EXISTS "Anyone can view trade ideas" ON public.shared_trade_ideas;

CREATE POLICY "Users manage own trade ideas" ON public.shared_trade_ideas
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view trade ideas" ON public.shared_trade_ideas
  FOR SELECT TO authenticated
  USING (true);

-- TRADE IDEA LIKES (Remove duplicates)
DROP POLICY IF EXISTS "Users can like trade ideas" ON public.trade_idea_likes;
DROP POLICY IF EXISTS "Users can unlike trade ideas" ON public.trade_idea_likes;
DROP POLICY IF EXISTS "Users manage trade idea likes" ON public.trade_idea_likes;

CREATE POLICY "Users manage trade idea likes" ON public.trade_idea_likes
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADE IDEA COMMENTS (Remove duplicates)
DROP POLICY IF EXISTS "Users can comment on trade ideas" ON public.trade_idea_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.trade_idea_comments;
DROP POLICY IF EXISTS "Users manage own comments" ON public.trade_idea_comments;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.trade_idea_comments;

CREATE POLICY "Users manage own comments" ON public.trade_idea_comments
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view all comments" ON public.trade_idea_comments
  FOR SELECT TO authenticated
  USING (true);

-- PERFORMANCE METRICS
DROP POLICY IF EXISTS "Users can view own performance metrics" ON public.performance_metrics;
CREATE POLICY "Users can view own performance metrics" ON public.performance_metrics
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create performance metrics" ON public.performance_metrics;
CREATE POLICY "Users can create performance metrics" ON public.performance_metrics
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own performance metrics" ON public.performance_metrics;
CREATE POLICY "Users can update own performance metrics" ON public.performance_metrics
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TIME ANALYSIS
DROP POLICY IF EXISTS "Users can view own time analysis" ON public.time_analysis;
CREATE POLICY "Users can view own time analysis" ON public.time_analysis
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create time analysis" ON public.time_analysis;
CREATE POLICY "Users can create time analysis" ON public.time_analysis
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own time analysis" ON public.time_analysis;
CREATE POLICY "Users can update own time analysis" ON public.time_analysis
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- EXPECTANCY DATA
DROP POLICY IF EXISTS "Users can view own expectancy data" ON public.expectancy_data;
CREATE POLICY "Users can view own expectancy data" ON public.expectancy_data
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create expectancy data" ON public.expectancy_data;
CREATE POLICY "Users can create expectancy data" ON public.expectancy_data
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own expectancy data" ON public.expectancy_data;
CREATE POLICY "Users can update own expectancy data" ON public.expectancy_data
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));