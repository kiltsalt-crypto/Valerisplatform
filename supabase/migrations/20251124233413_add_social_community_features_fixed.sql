/*
  # Social & Community Features Schema

  1. New Tables
    - `following_traders` - Track who follows whom, copy trading settings
    - `trade_copies` - Record of copied trades
    - `chat_rooms` - Trading chat rooms
    - `chat_messages` - Messages in chat rooms
    - `chat_room_members` - Room membership
    - `mentorship_requests` - Mentorship matching
    - `shared_trade_ideas` - Community trade ideas
    - `trade_idea_likes` - Likes on ideas
    - `trade_idea_comments` - Comments on ideas

  2. Security
    - Enable RLS on all tables
    - Appropriate policies for social interactions
*/

-- Following Traders
CREATE TABLE IF NOT EXISTS following_traders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  copy_trading_enabled boolean DEFAULT false,
  copy_percentage numeric DEFAULT 0 CHECK (copy_percentage >= 0 AND copy_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE following_traders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their following relationships"
  ON following_traders FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can follow others"
  ON following_traders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update their following settings"
  ON following_traders FOR UPDATE
  TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON following_traders FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Trade Copies
CREATE TABLE IF NOT EXISTS trade_copies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_trade_id uuid REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  copier_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  copied_trade_id uuid REFERENCES trades(id) ON DELETE CASCADE,
  copy_status text DEFAULT 'pending' CHECK (copy_status IN ('pending', 'executed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trade_copies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their trade copies"
  ON trade_copies FOR SELECT
  TO authenticated
  USING (auth.uid() = copier_id);

CREATE POLICY "Users can create trade copies"
  ON trade_copies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = copier_id);

-- Chat Rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  room_type text DEFAULT 'general' CHECK (room_type IN ('general', 'instrument', 'strategy', 'private')),
  instrument text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_private boolean DEFAULT false,
  member_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Chat Room Members (create before chat_messages policies reference it)
CREATE TABLE IF NOT EXISTS chat_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view room membership"
  ON chat_room_members FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM chat_room_members crm WHERE crm.room_id = chat_room_members.room_id AND crm.user_id = auth.uid())
  );

CREATE POLICY "Users can join public rooms"
  ON chat_room_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Now create chat_rooms policies
CREATE POLICY "Anyone can view public chat rooms"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (NOT is_private OR auth.uid() IN (
    SELECT user_id FROM chat_room_members WHERE room_id = chat_rooms.id
  ));

CREATE POLICY "Authenticated users can create chat rooms"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  attachment_url text,
  trade_reference_id uuid REFERENCES trades(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room members can view chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = room_id 
      AND (NOT is_private OR auth.uid() IN (
        SELECT user_id FROM chat_room_members WHERE room_id = chat_rooms.id
      ))
    )
  );

CREATE POLICY "Room members can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = room_id 
      AND (NOT is_private OR auth.uid() IN (
        SELECT user_id FROM chat_room_members WHERE room_id = chat_rooms.id
      ))
    )
  );

-- Mentorship Requests
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  focus_areas jsonb DEFAULT '[]'::jsonb,
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their mentorship requests"
  ON mentorship_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

CREATE POLICY "Users can create mentorship requests"
  ON mentorship_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Users can update mentorship requests"
  ON mentorship_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id)
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Shared Trade Ideas
CREATE TABLE IF NOT EXISTS shared_trade_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  instrument text NOT NULL,
  direction text CHECK (direction IN ('long', 'short')),
  entry_price numeric NOT NULL,
  target_price numeric,
  stop_loss numeric,
  chart_image_url text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shared_trade_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared trade ideas"
  ON shared_trade_ideas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create trade ideas"
  ON shared_trade_ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trade ideas"
  ON shared_trade_ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trade Idea Likes
CREATE TABLE IF NOT EXISTS trade_idea_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES shared_trade_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(idea_id, user_id)
);

ALTER TABLE trade_idea_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON trade_idea_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like trade ideas"
  ON trade_idea_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike trade ideas"
  ON trade_idea_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trade Idea Comments
CREATE TABLE IF NOT EXISTS trade_idea_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES shared_trade_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trade_idea_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON trade_idea_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can comment on trade ideas"
  ON trade_idea_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON trade_idea_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_following_traders_follower ON following_traders(follower_id);
CREATE INDEX IF NOT EXISTS idx_following_traders_following ON following_traders(following_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_shared_trade_ideas_created ON shared_trade_ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_idea_likes_idea ON trade_idea_likes(idea_id);
