/*
  # Seed Education Courses and Lessons

  1. Courses
    - Adds foundational trading courses
    - Different skill levels and categories
    
  2. Lessons
    - Adds lessons for each course
    - Organized learning path
  
  3. Security
    - Uses IF NOT EXISTS to avoid duplicates
    - Safe to run multiple times
*/

DO $$
DECLARE
  course1_id uuid;
  course2_id uuid;
  course3_id uuid;
  course4_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM courses LIMIT 1) THEN
    INSERT INTO courses (title, description, difficulty, category, duration_minutes, is_published, order_index)
    VALUES 
    ('Trading Fundamentals', 'Master the basics of futures trading, including market structure, order types, and essential terminology', 'beginner', 'fundamentals', 180, true, 0)
    RETURNING id INTO course1_id;
    
    INSERT INTO courses (title, description, difficulty, category, duration_minutes, is_published, order_index)
    VALUES 
    ('Technical Analysis Mastery', 'Learn to read charts, identify patterns, and use technical indicators effectively', 'intermediate', 'technical', 240, true, 1)
    RETURNING id INTO course2_id;
    
    INSERT INTO courses (title, description, difficulty, category, duration_minutes, is_published, order_index)
    VALUES 
    ('Risk Management Essentials', 'Protect your capital and manage risk like a professional trader', 'beginner', 'risk', 120, true, 2)
    RETURNING id INTO course3_id;
    
    INSERT INTO courses (title, description, difficulty, category, duration_minutes, is_published, order_index)
    VALUES 
    ('Trading Psychology', 'Develop the mental discipline and emotional control required for consistent trading success', 'intermediate', 'psychology', 150, true, 3)
    RETURNING id INTO course4_id;

    INSERT INTO course_lessons (course_id, title, content, video_url, duration_minutes, order_index)
    VALUES
    (course1_id, 'Welcome to Futures Trading', 'Introduction to futures markets and how they work', 'https://example.com/lesson1', 15, 0),
    (course1_id, 'Understanding Market Structure', 'Learn about bid-ask spreads, order books, and market depth', 'https://example.com/lesson2', 20, 1),
    (course1_id, 'Order Types Explained', 'Market orders, limit orders, stop orders, and more', 'https://example.com/lesson3', 25, 2),
    (course1_id, 'ES Futures Deep Dive', 'Everything you need to know about E-mini S&P 500 futures', 'https://example.com/lesson4', 30, 3),
    (course1_id, 'NQ Futures Deep Dive', 'Trading the E-mini Nasdaq futures contract', 'https://example.com/lesson5', 30, 4),
    (course1_id, 'Contract Specifications', 'Understanding tick values, contract sizes, and trading hours', 'https://example.com/lesson6', 20, 5),

    (course2_id, 'Chart Basics', 'Candlesticks, timeframes, and chart types', 'https://example.com/lesson7', 25, 0),
    (course2_id, 'Support and Resistance', 'Identifying key levels in the market', 'https://example.com/lesson8', 30, 1),
    (course2_id, 'Trend Analysis', 'Understanding trends and how to trade with them', 'https://example.com/lesson9', 25, 2),
    (course2_id, 'Moving Averages', 'Using moving averages for trend identification', 'https://example.com/lesson10', 20, 3),
    (course2_id, 'Chart Patterns', 'Head and shoulders, triangles, flags, and more', 'https://example.com/lesson11', 35, 4),
    (course2_id, 'Volume Analysis', 'Understanding volume and its relationship to price', 'https://example.com/lesson12', 25, 5),
    (course2_id, 'Indicators Overview', 'RSI, MACD, Stochastics, and other popular indicators', 'https://example.com/lesson13', 30, 6),

    (course3_id, 'Why Risk Management Matters', 'The foundation of successful trading', 'https://example.com/lesson14', 15, 0),
    (course3_id, 'Position Sizing', 'How to determine the right position size for each trade', 'https://example.com/lesson15', 25, 1),
    (course3_id, 'Stop Loss Strategies', 'Protecting your capital with proper stop losses', 'https://example.com/lesson16', 20, 2),
    (course3_id, 'Risk-Reward Ratios', 'Understanding and applying risk-reward analysis', 'https://example.com/lesson17', 20, 3),
    (course3_id, 'Daily Loss Limits', 'Setting and respecting daily loss limits', 'https://example.com/lesson18', 15, 4),
    (course3_id, 'Building Your Risk Plan', 'Creating a comprehensive risk management plan', 'https://example.com/lesson19', 25, 5),

    (course4_id, 'The Mental Game', 'Why psychology is critical for trading success', 'https://example.com/lesson20', 20, 0),
    (course4_id, 'Emotional Control', 'Managing fear, greed, and other emotions', 'https://example.com/lesson21', 25, 1),
    (course4_id, 'Dealing with Losses', 'How to handle losing trades mentally', 'https://example.com/lesson22', 20, 2),
    (course4_id, 'Discipline and Consistency', 'Following your trading plan every time', 'https://example.com/lesson23', 25, 3),
    (course4_id, 'Building Confidence', 'Developing trust in your trading system', 'https://example.com/lesson24', 20, 4),
    (course4_id, 'Creating Your Routine', 'Establishing daily habits for trading success', 'https://example.com/lesson25', 20, 5),
    (course4_id, 'Advanced Mindset Techniques', 'Meditation, visualization, and mental preparation', 'https://example.com/lesson26', 20, 6);
  END IF;
END $$;
