import { useState, useEffect } from 'react';
import { X, Users, Heart, MessageCircle, Share2, TrendingUp, Eye, UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SocialTradingProps {
  onClose: () => void;
}

export default function SocialTrading({ onClose }: SocialTradingProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'following' | 'share'>('feed');
  const [sharedTrades, setSharedTrades] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [myTrades, setMyTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (activeTab === 'feed') {
        const { data } = await supabase
          .from('shared_trades')
          .select(`
            *,
            user:auth.users!shared_trades_user_id_fkey(email),
            trade:trades(*)
          `)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(20);

        setSharedTrades(data || []);
      } else if (activeTab === 'following') {
        const { data } = await supabase
          .from('user_follows')
          .select(`
            *,
            following:auth.users!user_follows_following_id_fkey(id, email)
          `)
          .eq('follower_id', user.id);

        setFollowing(data || []);
      } else if (activeTab === 'share') {
        const { data } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        setMyTrades(data || []);
      }
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (sharedTradeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trade_likes')
        .insert({ shared_trade_id: sharedTradeId, user_id: user.id });

      if (!error) {
        await supabase
          .from('shared_trades')
          .update({ likes_count: supabase.raw('likes_count + 1') })
          .eq('id', sharedTradeId);

        fetchData();
      }
    } catch (error) {
      console.error('Error liking trade:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: userId });

      if (!error) {
        fetchData();
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (!error) {
        fetchData();
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleShareTrade = async (tradeId: string, caption: string, visibility: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('shared_trades')
        .insert({
          user_id: user.id,
          trade_id: tradeId,
          caption,
          visibility
        });

      if (!error) {
        alert('Trade shared successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error sharing trade:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Social Trading</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b border-slate-700 px-6">
          <div className="flex gap-4">
            {[
              { id: 'feed', label: 'Feed', icon: TrendingUp },
              { id: 'following', label: 'Following', icon: Users },
              { id: 'share', label: 'Share Trade', icon: Share2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'feed' ? (
            <div className="space-y-4">
              {sharedTrades.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No shared trades in your feed yet</p>
                  <p className="text-slate-500 text-sm mt-2">Follow other traders to see their shared trades</p>
                </div>
              ) : (
                sharedTrades.map((shared) => (
                  <div
                    key={shared.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {shared.user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{shared.user?.email || 'Anonymous'}</p>
                          <p className="text-slate-400 text-sm">
                            {new Date(shared.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFollow(shared.user_id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                      >
                        <UserPlus className="w-5 h-5" />
                        Follow
                      </button>
                    </div>

                    {shared.caption && (
                      <p className="text-slate-300 mb-4">{shared.caption}</p>
                    )}

                    {shared.trade && (
                      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-slate-400 text-sm">Symbol</p>
                            <p className="text-white font-bold">{shared.trade.symbol}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">Direction</p>
                            <p className={`font-bold ${
                              shared.trade.direction === 'long' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {shared.trade.direction?.toUpperCase()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">P&L</p>
                            <p className={`font-bold ${
                              shared.trade.pnl > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${shared.trade.pnl?.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">Win Rate</p>
                            <p className="text-white font-bold">
                              {shared.trade.pnl > 0 ? '100%' : '0%'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-6 text-slate-400">
                      <button
                        onClick={() => handleLike(shared.id)}
                        className="flex items-center gap-2 hover:text-red-400 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        <span>{shared.likes_count || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span>{shared.comments_count || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                        <Eye className="w-5 h-5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'following' ? (
            <div className="space-y-4">
              {following.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">You're not following anyone yet</p>
                  <p className="text-slate-500 text-sm mt-2">Start following traders to see their activity</p>
                </div>
              ) : (
                following.map((follow) => (
                  <div
                    key={follow.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {follow.following?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{follow.following?.email || 'User'}</p>
                        <p className="text-slate-400 text-sm">
                          Following since {new Date(follow.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnfollow(follow.following_id)}
                      className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                    >
                      <UserMinus className="w-5 h-5" />
                      Unfollow
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Share Your Trades</h3>
                <p className="text-slate-300">
                  Share your successful trades with the community. Help others learn from your strategies
                  and build your reputation as a trader.
                </p>
              </div>

              {myTrades.length === 0 ? (
                <div className="text-center py-12">
                  <Share2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No trades to share yet</p>
                  <p className="text-slate-500 text-sm mt-2">Start logging trades to share them with the community</p>
                </div>
              ) : (
                myTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-slate-400 text-sm">Symbol</p>
                        <p className="text-white font-bold">{trade.symbol}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Direction</p>
                        <p className={`font-bold ${
                          trade.direction === 'long' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trade.direction?.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">P&L</p>
                        <p className={`font-bold ${
                          trade.pnl > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${trade.pnl?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Date</p>
                        <p className="text-white font-bold">
                          {new Date(trade.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleShareTrade(trade.id, trade.notes || '', 'public')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share This Trade
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
