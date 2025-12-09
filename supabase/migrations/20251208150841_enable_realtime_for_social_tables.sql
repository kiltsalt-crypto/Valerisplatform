/*
  # Enable Realtime for Social Features

  1. Realtime Configuration
    - Enables realtime on trading_room_messages for live chat
    - Enables realtime on forum_posts for live forum updates
    - Enables realtime on shared_trades for live social feed
    - Enables realtime on notifications for live notifications
  
  2. Security
    - Realtime respects existing RLS policies
*/

ALTER PUBLICATION supabase_realtime ADD TABLE trading_room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE shared_trades;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE shared_trade_ideas;
