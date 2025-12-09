/*
  # Seed Forum Categories

  1. Forum Categories
    - Creates discussion categories
    - Organizes community content
  
  2. Security
    - Uses IF NOT EXISTS to avoid duplicates
    - Safe to run multiple times
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM forum_categories LIMIT 1) THEN
    INSERT INTO forum_categories (name, description, icon, order_index) VALUES
    ('General Discussion', 'General trading topics and discussions', 'message-square', 0),
    ('Strategy Discussion', 'Share and discuss trading strategies', 'trending-up', 1),
    ('Market Analysis', 'Daily market analysis and insights', 'bar-chart-2', 2),
    ('Education & Learning', 'Learning resources and questions', 'book-open', 3),
    ('ES (E-mini S&P 500)', 'Discussions about ES futures', 'activity', 4),
    ('NQ (E-mini Nasdaq)', 'Discussions about NQ futures', 'trending-up', 5),
    ('CL (Crude Oil)', 'Discussions about oil futures', 'droplet', 6),
    ('GC (Gold)', 'Discussions about gold futures', 'dollar-sign', 7),
    ('Technical Analysis', 'Chart patterns and technical indicators', 'line-chart', 8),
    ('Risk Management', 'Managing risk and capital preservation', 'shield', 9),
    ('Trading Psychology', 'Mental game and trading mindset', 'brain', 10),
    ('Success Stories', 'Share your wins and milestones', 'trophy', 11),
    ('Lessons Learned', 'Share mistakes and what you learned', 'alert-circle', 12),
    ('Platform Help', 'Get help using the platform', 'help-circle', 13),
    ('Feature Requests', 'Suggest new features and improvements', 'lightbulb', 14);
  END IF;
END $$;
