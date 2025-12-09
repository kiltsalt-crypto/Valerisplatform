/*
  # Seed Achievements Data

  1. Achievements
    - Adds initial set of trading achievements
    - Covers various milestones and accomplishments
    - Different difficulty levels and point values
  
  2. Security
    - Uses IF NOT EXISTS to avoid duplicates
    - Safe to run multiple times
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM achievements LIMIT 1) THEN
    INSERT INTO achievements (name, description, icon, criteria, points) VALUES
    ('First Trade', 'Execute your first paper trade', 'trophy', 'Complete 1 trade', 10),
    ('Getting Started', 'Complete 10 trades', 'target', 'Complete 10 trades', 25),
    ('Active Trader', 'Complete 50 trades', 'trending-up', 'Complete 50 trades', 50),
    ('Veteran Trader', 'Complete 100 trades', 'award', 'Complete 100 trades', 100),
    ('Master Trader', 'Complete 500 trades', 'star', 'Complete 500 trades', 250),
    
    ('First Winner', 'Close your first profitable trade', 'dollar-sign', 'Close 1 profitable trade', 15),
    ('Consistent Profits', 'Achieve 5 profitable trades in a row', 'trending-up', '5 consecutive wins', 50),
    ('Win Streak Champion', 'Achieve 10 profitable trades in a row', 'flame', '10 consecutive wins', 100),
    
    ('Journal Keeper', 'Create 10 journal entries', 'book-open', 'Create 10 journal entries', 30),
    ('Reflection Master', 'Create 50 journal entries', 'edit', 'Create 50 journal entries', 75),
    
    ('Risk Manager', 'Complete 20 trades with proper stop loss', 'shield', '20 trades with stop loss', 40),
    ('Disciplined Trader', 'Follow your trading plan for 30 consecutive trades', 'check-circle', '30 disciplined trades', 60),
    
    ('Week Warrior', 'Trade profitably for 1 week straight', 'calendar', '1 week profitable', 45),
    ('Month Master', 'Trade profitably for 1 month straight', 'calendar-check', '1 month profitable', 150),
    
    ('Small Gains', 'Reach $5,000 in total profits', 'trending-up', 'Earn $5,000 profit', 35),
    ('Building Wealth', 'Reach $10,000 in total profits', 'dollar-sign', 'Earn $10,000 profit', 70),
    ('Profit Pro', 'Reach $25,000 in total profits', 'bar-chart', 'Earn $25,000 profit', 125),
    ('High Roller', 'Reach $50,000 in total profits', 'trending-up', 'Earn $50,000 profit', 200),
    
    ('Student', 'Complete 5 education modules', 'book', 'Complete 5 modules', 25),
    ('Scholar', 'Complete 15 education modules', 'graduation-cap', 'Complete 15 modules', 60),
    ('Trading Expert', 'Complete all education modules', 'award', 'Complete all modules', 150),
    
    ('Community Member', 'Share your first trade idea', 'users', 'Share 1 trade idea', 20),
    ('Mentor', 'Help 5 traders in the community', 'heart', 'Help 5 traders', 50),
    
    ('Watchlist Pro', 'Create 3 custom watchlists', 'eye', 'Create 3 watchlists', 15),
    ('Alert Master', 'Set up 10 price alerts', 'bell', 'Create 10 alerts', 20),
    
    ('Comeback Kid', 'Recover from a 10% drawdown', 'refresh-cw', 'Recover from 10% drawdown', 75),
    ('Phoenix Rising', 'Recover from a 20% drawdown', 'trending-up', 'Recover from 20% drawdown', 125);
  END IF;
END $$;
