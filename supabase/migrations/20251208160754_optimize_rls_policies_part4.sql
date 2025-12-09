/*
  # Optimize RLS Policies - Part 4 (Alerts & Portfolios)

  1. Performance Optimization
    - Continue fixing auth.uid() -> (select auth.uid())
    - Remove duplicate policies

  2. Tables Fixed
    - price_alerts, pattern_alerts, alert_history, automation_rules
    - portfolios, broker_connections, trade_imports, portfolio_positions
*/

-- PRICE ALERTS (Remove duplicates)
DROP POLICY IF EXISTS "Users can view own price alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Users can create price alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Users can update own price alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Users can delete own price alerts" ON public.price_alerts;

CREATE POLICY "Users manage own price alerts" ON public.price_alerts
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- PATTERN ALERTS
DROP POLICY IF EXISTS "Users can view own pattern alerts" ON public.pattern_alerts;
CREATE POLICY "Users can view own pattern alerts" ON public.pattern_alerts
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own pattern alerts" ON public.pattern_alerts;
CREATE POLICY "Users can update own pattern alerts" ON public.pattern_alerts
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ALERT HISTORY
DROP POLICY IF EXISTS "Users can view own alert history" ON public.alert_history;
CREATE POLICY "Users can view own alert history" ON public.alert_history
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own alert history" ON public.alert_history;
CREATE POLICY "Users can update own alert history" ON public.alert_history
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- AUTOMATION RULES (Remove duplicates)
DROP POLICY IF EXISTS "Users can view own automation rules" ON public.automation_rules;
DROP POLICY IF EXISTS "Users can create automation rules" ON public.automation_rules;
DROP POLICY IF EXISTS "Users can update own automation rules" ON public.automation_rules;
DROP POLICY IF EXISTS "Users can delete own automation rules" ON public.automation_rules;

CREATE POLICY "Users manage own automation rules" ON public.automation_rules
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- PORTFOLIOS (Remove duplicates)
DROP POLICY IF EXISTS "Users can view own portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Users can create portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Users can update own portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Users can delete own portfolios" ON public.portfolios;

CREATE POLICY "Users manage own portfolios" ON public.portfolios
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- BROKER CONNECTIONS (Remove all duplicates)
DROP POLICY IF EXISTS "Users can view own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users can create broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users can update own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users can delete own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users manage own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users manage own connections" ON public.broker_connections;

CREATE POLICY "Users manage own broker connections" ON public.broker_connections
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TRADE IMPORTS
DROP POLICY IF EXISTS "Users can view own trade imports" ON public.trade_imports;
CREATE POLICY "Users can view own trade imports" ON public.trade_imports
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create trade imports" ON public.trade_imports;
CREATE POLICY "Users can create trade imports" ON public.trade_imports
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- PORTFOLIO POSITIONS (Remove duplicates)
DROP POLICY IF EXISTS "Users can view own portfolio positions" ON public.portfolio_positions;
DROP POLICY IF EXISTS "Users can create portfolio positions" ON public.portfolio_positions;
DROP POLICY IF EXISTS "Users can update own portfolio positions" ON public.portfolio_positions;
DROP POLICY IF EXISTS "Users can delete own portfolio positions" ON public.portfolio_positions;

CREATE POLICY "Users manage own portfolio positions" ON public.portfolio_positions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios 
      WHERE portfolios.id = portfolio_positions.portfolio_id 
      AND portfolios.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolios 
      WHERE portfolios.id = portfolio_positions.portfolio_id 
      AND portfolios.user_id = (SELECT auth.uid())
    )
  );

-- USER COURSE PROGRESS
DROP POLICY IF EXISTS "Users can view own course progress" ON public.user_course_progress;
CREATE POLICY "Users can view own course progress" ON public.user_course_progress
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create course progress" ON public.user_course_progress;
CREATE POLICY "Users can create course progress" ON public.user_course_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own course progress" ON public.user_course_progress;
CREATE POLICY "Users can update own course progress" ON public.user_course_progress
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));