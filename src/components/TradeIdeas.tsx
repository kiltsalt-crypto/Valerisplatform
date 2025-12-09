import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, Plus, ThumbsUp, Eye, EyeOff, Clock } from 'lucide-react';

interface TradeIdea {
  id: string;
  title: string;
  description: string;
  instrument: string;
  direction: 'long' | 'short';
  entry_price: number;
  target_price: number;
  stop_loss: number;
  timeframe: string;
  status: 'active' | 'completed' | 'cancelled';
  is_public: boolean;
  likes: number;
  created_at: string;
  user_id: string;
}

export default function TradeIdeas() {
  const { profile } = useAuth();
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [filter, setFilter] = useState<'my' | 'public'>('my');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instrument: '',
    direction: 'long' as 'long' | 'short',
    entry_price: '',
    target_price: '',
    stop_loss: '',
    timeframe: '1h',
    is_public: false
  });

  useEffect(() => {
    loadIdeas();
  }, [filter, profile]);

  const loadIdeas = async () => {
    if (!profile) return;

    try {
      let query = supabase.from('trade_ideas').select('*').order('created_at', { ascending: false });

      if (filter === 'my') {
        query = query.eq('user_id', profile.id);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error loading trade ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase.from('trade_ideas').insert({
        user_id: profile.id,
        title: formData.title,
        description: formData.description,
        instrument: formData.instrument,
        direction: formData.direction,
        entry_price: parseFloat(formData.entry_price),
        target_price: parseFloat(formData.target_price),
        stop_loss: parseFloat(formData.stop_loss),
        timeframe: formData.timeframe,
        is_public: formData.is_public,
        status: 'active'
      });

      if (error) throw error;

      setFormData({
        title: '',
        description: '',
        instrument: '',
        direction: 'long',
        entry_price: '',
        target_price: '',
        stop_loss: '',
        timeframe: '1h',
        is_public: false
      });
      setShowForm(false);
      loadIdeas();
    } catch (error) {
      console.error('Error creating trade idea:', error);
    }
  };

  const handleLike = async (ideaId: string, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from('trade_ideas')
        .update({ likes: currentLikes + 1 })
        .eq('id', ideaId);

      if (error) throw error;
      loadIdeas();
    } catch (error) {
      console.error('Error liking trade idea:', error);
    }
  };

  const calculateRR = (entry: number, target: number, stop: number, direction: string) => {
    if (direction === 'long') {
      const risk = entry - stop;
      const reward = target - entry;
      return risk > 0 ? (reward / risk).toFixed(2) : '0';
    } else {
      const risk = stop - entry;
      const reward = entry - target;
      return risk > 0 ? (reward / risk).toFixed(2) : '0';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 h-48 bg-slate-800/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trade Ideas</h1>
          <p className="text-slate-400">Share and discover trading setups</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-black font-semibold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Idea
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setFilter('my')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            filter === 'my'
              ? 'bg-purple-500 text-black'
              : 'glass-card text-slate-400 hover:text-white'
          }`}
        >
          My Ideas
        </button>
        <button
          onClick={() => setFilter('public')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            filter === 'public'
              ? 'bg-purple-500 text-black'
              : 'glass-card text-slate-400 hover:text-white'
          }`}
        >
          Community Ideas
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Create Trade Idea</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., ES Bull Flag Breakout"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Instrument</label>
                <input
                  type="text"
                  required
                  value={formData.instrument}
                  onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., ES, NQ, CL"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Direction</label>
                <select
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'long' | 'short' })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Timeframe</label>
                <select
                  value={formData.timeframe}
                  onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="4h">4 Hours</option>
                  <option value="1d">1 Day</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Entry Price</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.entry_price}
                  onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Target Price</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.target_price}
                  onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Stop Loss</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.stop_loss}
                  onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-800/50 border-slate-700"
                />
                <label htmlFor="public" className="text-slate-300 text-sm font-medium">
                  Share with community
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                placeholder="Describe your trade setup, reasoning, and key levels..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-black font-semibold py-3 rounded-lg hover:shadow-lg transition"
              >
                Create Trade Idea
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 glass-card text-slate-400 hover:text-white font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {ideas.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400 mb-4">
            {filter === 'my' ? "You haven't created any trade ideas yet." : "No public trade ideas available."}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Create your first trade idea
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {ideas.map((idea) => (
            <div key={idea.id} className="glass-card p-6 hover:border-purple-500/30 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{idea.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      idea.direction === 'long'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {idea.direction === 'long' ? (
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 inline mr-1" />
                      )}
                      {idea.direction.toUpperCase()}
                    </span>
                    {idea.is_public ? (
                      <Eye className="w-4 h-4 text-blue-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{idea.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Instrument</p>
                  <p className="text-white font-bold">{idea.instrument}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Entry</p>
                  <p className="text-white font-bold">${idea.entry_price}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Target</p>
                  <p className="text-green-400 font-bold">${idea.target_price}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Stop Loss</p>
                  <p className="text-red-400 font-bold">${idea.stop_loss}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">R:R Ratio</p>
                  <p className="text-purple-400 font-bold">
                    1:{calculateRR(idea.entry_price, idea.target_price, idea.stop_loss, idea.direction)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {idea.timeframe}
                  </span>
                  <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleLike(idea.id, idea.likes)}
                  className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{idea.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
