/*
  # Seed Trading Challenges

  1. Trading Challenges
    - Adds sample challenges for users to participate in
    - Different difficulty levels and time periods
  
  2. Security
    - Uses IF NOT EXISTS pattern
    - Safe to run multiple times
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM trading_challenges WHERE title = 'Weekly Profit Challenge') THEN
    INSERT INTO trading_challenges (title, description, start_date, end_date, prize_pool, entry_fee, rules, status)
    VALUES
    (
      'Weekly Profit Challenge',
      'Compete with other traders to achieve the highest profit percentage this week',
      NOW(),
      NOW() + INTERVAL '7 days',
      1000.00,
      0,
      '{"max_trades_per_day": 10, "starting_balance": 10000, "min_trades": 5}'::jsonb,
      'active'
    ),
    (
      'Monthly Trading Competition',
      'Prove your skills in this month-long trading competition',
      NOW(),
      NOW() + INTERVAL '30 days',
      5000.00,
      25.00,
      '{"max_trades_per_day": 15, "starting_balance": 25000, "min_trades": 20}'::jsonb,
      'active'
    ),
    (
      'Consistency Challenge',
      'Win by maintaining the most consistent daily returns',
      NOW() + INTERVAL '2 days',
      NOW() + INTERVAL '16 days',
      2000.00,
      10.00,
      '{"max_trades_per_day": 8, "starting_balance": 15000, "min_trades": 30, "scoring": "consistency"}'::jsonb,
      'upcoming'
    );
  END IF;
END $$;
