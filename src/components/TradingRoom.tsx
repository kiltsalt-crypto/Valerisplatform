import { useState, useEffect, useRef } from 'react';
import { Send, Users, Video, Mic, MicOff, VideoOff, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Message {
  message_id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
  message_type: 'message' | 'trade' | 'alert';
}

interface User {
  id: string;
  name: string;
  status: 'online' | 'trading' | 'away';
  avatar: string;
}

export default function TradingRoom() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadMessages();
      subscribeToMessages();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_room_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('trading-room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trading_room_messages',
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user || !profile) return;

    try {
      const { error } = await supabase
        .from('trading_room_messages')
        .insert({
          user_id: user.id,
          username: profile.full_name || profile.email || 'Anonymous',
          message: inputMessage,
          message_type: 'message',
        });

      if (error) throw error;
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'trading': return 'bg-blue-400';
      case 'away': return 'bg-yellow-400';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-purple-400" />
          Live Trading Room
        </h1>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            {activeUsers.length} Online
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-4" style={{ height: '400px' }}>
            <div className="bg-slate-900 rounded-lg h-full flex items-center justify-center relative">
              <div className="text-center">
                <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Video streaming coming soon</p>
                <p className="text-slate-500 text-sm">Screen sharing and live charts</p>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full transition ${
                    isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
                  } text-white`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-full transition ${
                    isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
                  } text-white`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Chat</h3>
            </div>

            <div className="bg-slate-900 rounded-lg p-4 h-64 overflow-y-auto mb-4">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No messages yet. Be the first to say something!
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.message_id} className="mb-3">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-400 text-xs font-bold">
                          {msg.username.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold text-sm">{msg.username}</span>
                          <span className="text-slate-500 text-xs">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                          {msg.message_type === 'trade' && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Trade
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Active Traders
            </h3>
            <div className="space-y-2">
              {activeUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg transition">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-400 font-bold text-sm">{user.avatar}</span>
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(user.status)}`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{user.name}</p>
                    <p className="text-slate-400 text-xs capitalize">{user.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-white font-semibold mb-4">Today's Top Traders</h3>
            <div className="space-y-3">
              {[
                { name: 'ChartMaster', profit: '+$2,450', trades: 8 },
                { name: 'BullMarket', profit: '+$1,890', trades: 6 },
                { name: 'TraderMike', profit: '+$1,320', trades: 5 },
              ].map((trader, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">#{i + 1}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{trader.name}</p>
                      <p className="text-slate-400 text-xs">{trader.trades} trades</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-bold">{trader.profit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
