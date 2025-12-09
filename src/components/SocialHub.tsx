import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, MessageCircle, UserPlus, TrendingUp, Send, Heart, MessageSquare, Copy, Check } from 'lucide-react';

interface Trader {
  id: string;
  username: string;
  total_pnl: number;
  win_rate: number;
  total_trades: number;
  is_following: boolean;
}

interface TradeIdea {
  id: string;
  user_id: string;
  username: string;
  title: string;
  description: string;
  instrument: string;
  direction: string;
  entry_price: number;
  target_price: number | null;
  stop_loss: number | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  room_type: string;
  member_count: number;
}

export default function SocialHub() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'traders' | 'ideas' | 'chat'>('traders');
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [copiedTraders, setCopiedTraders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTopTraders();
    loadTradeIdeas();
    loadChatRooms();
  }, []);

  const loadTopTraders = async () => {
    const { data: traders } = await supabase
      .from('profiles')
      .select('id, username, total_pnl, win_rate, total_trades')
      .order('total_pnl', { ascending: false })
      .limit(20);

    if (traders) {
      const { data: following } = await supabase
        .from('following_traders')
        .select('following_id')
        .eq('follower_id', profile?.id);

      const followingIds = new Set(following?.map(f => f.following_id) || []);

      setTopTraders(traders.map(t => ({
        ...t,
        is_following: followingIds.has(t.id)
      })));
    }
  };

  const loadTradeIdeas = async () => {
    const { data: ideas } = await supabase
      .from('shared_trade_ideas')
      .select(`
        *,
        profiles!shared_trade_ideas_user_id_fkey(username)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (ideas) {
      const { data: likes } = await supabase
        .from('trade_idea_likes')
        .select('idea_id')
        .eq('user_id', profile?.id);

      const likedIds = new Set(likes?.map(l => l.idea_id) || []);

      setTradeIdeas(ideas.map((idea: any) => ({
        ...idea,
        username: idea.profiles?.username || 'Anonymous',
        is_liked: likedIds.has(idea.id)
      })));
    }
  };

  const loadChatRooms = async () => {
    const { data: rooms } = await supabase
      .from('chat_rooms')
      .select('*, chat_room_members(count)')
      .eq('is_private', false)
      .order('created_at', { ascending: false });

    if (rooms) {
      setChatRooms(rooms.map((room: any) => ({
        ...room,
        member_count: room.chat_room_members?.[0]?.count || 0
      })));
    }
  };

  const followTrader = async (traderId: string) => {
    await supabase.from('following_traders').insert({
      follower_id: profile?.id,
      following_id: traderId,
      copy_trading_enabled: false
    });
    loadTopTraders();
  };

  const unfollowTrader = async (traderId: string) => {
    await supabase
      .from('following_traders')
      .delete()
      .eq('follower_id', profile?.id)
      .eq('following_id', traderId);
    loadTopTraders();
  };

  const enableCopyTrading = async (traderId: string) => {
    await supabase
      .from('following_traders')
      .update({ copy_trading_enabled: true, copy_percentage: 10 })
      .eq('follower_id', profile?.id)
      .eq('following_id', traderId);

    setCopiedTraders(prev => new Set(prev).add(traderId));
  };

  const likeIdea = async (ideaId: string) => {
    const idea = tradeIdeas.find(i => i.id === ideaId);
    if (!idea) return;

    if (idea.is_liked) {
      await supabase
        .from('trade_idea_likes')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', profile?.id);

      await supabase
        .from('shared_trade_ideas')
        .update({ likes_count: Math.max(0, idea.likes_count - 1) })
        .eq('id', ideaId);
    } else {
      await supabase.from('trade_idea_likes').insert({
        idea_id: ideaId,
        user_id: profile?.id
      });

      await supabase
        .from('shared_trade_ideas')
        .update({ likes_count: idea.likes_count + 1 })
        .eq('id', ideaId);
    }

    loadTradeIdeas();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Users className="w-7 h-7 text-purple-400" />
          Social Trading Hub
        </h1>
        <p className="text-slate-400 text-sm">Connect, learn, and trade with the community</p>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'traders', label: 'Top Traders', icon: Users },
          { id: 'ideas', label: 'Trade Ideas', icon: TrendingUp },
          { id: 'chat', label: 'Chat Rooms', icon: MessageCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-black font-semibold'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'traders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topTraders.map((trader) => (
            <div key={trader.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{trader.username}</h3>
                  <p className="text-slate-400 text-xs">{trader.total_trades} trades</p>
                </div>
                <div className={`text-right ${trader.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <p className="font-bold">${trader.total_pnl.toFixed(2)}</p>
                  <p className="text-xs">{trader.win_rate.toFixed(1)}% WR</p>
                </div>
              </div>

              <div className="flex gap-2">
                {trader.is_following ? (
                  <>
                    <button
                      onClick={() => unfollowTrader(trader.id)}
                      className="flex-1 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-600 transition"
                    >
                      Unfollow
                    </button>
                    {copiedTraders.has(trader.id) ? (
                      <button
                        disabled
                        className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Copying
                      </button>
                    ) : (
                      <button
                        onClick={() => enableCopyTrading(trader.id)}
                        className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600 transition flex items-center justify-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => followTrader(trader.id)}
                    className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-xs hover:from-purple-600 hover:to-purple-700 transition flex items-center justify-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    Follow
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ideas' && (
        <div className="space-y-4">
          {tradeIdeas.map((idea) => (
            <div key={idea.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{idea.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      idea.direction === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {idea.direction.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-2">by {idea.username} • {idea.instrument}</p>
                  <p className="text-slate-300 text-sm mb-3">{idea.description}</p>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Entry</p>
                      <p className="text-white font-semibold">${idea.entry_price}</p>
                    </div>
                    {idea.target_price && (
                      <div>
                        <p className="text-slate-500">Target</p>
                        <p className="text-green-400 font-semibold">${idea.target_price}</p>
                      </div>
                    )}
                    {idea.stop_loss && (
                      <div>
                        <p className="text-slate-500">Stop</p>
                        <p className="text-red-400 font-semibold">${idea.stop_loss}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-slate-700">
                <button
                  onClick={() => likeIdea(idea.id)}
                  className={`flex items-center gap-1 text-sm ${
                    idea.is_liked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
                  } transition`}
                >
                  <Heart className={`w-4 h-4 ${idea.is_liked ? 'fill-current' : ''}`} />
                  <span>{idea.likes_count}</span>
                </button>
                <button className="flex items-center gap-1 text-slate-400 hover:text-purple-400 text-sm transition">
                  <MessageSquare className="w-4 h-4" />
                  <span>{idea.comments_count}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chatRooms.map((room) => (
            <div key={room.id} className="glass-card p-4 hover:bg-slate-800/50 transition cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-400" />
                    {room.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">{room.description}</p>
                </div>
                <span className="text-slate-500 text-xs">{room.member_count} members</span>
              </div>
              <button className="w-full mt-3 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs hover:bg-purple-500/30 transition">
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
