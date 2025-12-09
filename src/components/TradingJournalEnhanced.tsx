import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Plus, Calendar, TrendingUp, TrendingDown, Camera, Tag, Star, Edit2, Trash2, X } from 'lucide-react';

interface JournalEntry {
  id: string;
  trade_date: string;
  instrument: string;
  direction: 'long' | 'short';
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  pnl: number | null;
  pnl_percentage: number | null;
  strategy: string;
  emotional_state: string;
  pre_trade_plan: string;
  post_trade_review: string;
  mistakes: string;
  lessons_learned: string;
  screenshot_urls: string[];
  tags: string[];
  rating: number | null;
  status: 'open' | 'closed';
  created_at: string;
}

export default function TradingJournalEnhanced() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({
    trade_date: new Date().toISOString().split('T')[0],
    instrument: '',
    direction: 'long' as 'long' | 'short',
    entry_price: '',
    exit_price: '',
    quantity: '',
    strategy: '',
    emotional_state: '',
    pre_trade_plan: '',
    post_trade_review: '',
    mistakes: '',
    lessons_learned: '',
    tags: '',
    rating: 3,
    status: 'open' as 'open' | 'closed'
  });

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('trade_journal_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('trade_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const entry = {
      user_id: user?.id,
      trade_date: formData.trade_date,
      instrument: formData.instrument,
      direction: formData.direction,
      entry_price: parseFloat(formData.entry_price),
      exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
      quantity: parseInt(formData.quantity),
      strategy: formData.strategy,
      emotional_state: formData.emotional_state,
      pre_trade_plan: formData.pre_trade_plan,
      post_trade_review: formData.post_trade_review,
      mistakes: formData.mistakes,
      lessons_learned: formData.lessons_learned,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      rating: formData.rating,
      status: formData.status,
      screenshot_urls: [],
    };

    if (entry.exit_price && entry.entry_price) {
      const priceDiff = formData.direction === 'long'
        ? entry.exit_price - entry.entry_price
        : entry.entry_price - entry.exit_price;
      entry['pnl'] = priceDiff * entry.quantity;
      entry['pnl_percentage'] = (priceDiff / entry.entry_price) * 100;
    }

    try {
      if (selectedEntry) {
        const { error } = await supabase
          .from('trade_journal_entries')
          .update(entry)
          .eq('id', selectedEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trade_journal_entries')
          .insert(entry);
        if (error) throw error;
      }

      fetchEntries();
      resetForm();
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this journal entry?')) return;

    try {
      const { error } = await supabase
        .from('trade_journal_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const editEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setFormData({
      trade_date: entry.trade_date,
      instrument: entry.instrument,
      direction: entry.direction,
      entry_price: entry.entry_price.toString(),
      exit_price: entry.exit_price?.toString() || '',
      quantity: entry.quantity.toString(),
      strategy: entry.strategy || '',
      emotional_state: entry.emotional_state || '',
      pre_trade_plan: entry.pre_trade_plan || '',
      post_trade_review: entry.post_trade_review || '',
      mistakes: entry.mistakes || '',
      lessons_learned: entry.lessons_learned || '',
      tags: entry.tags?.join(', ') || '',
      rating: entry.rating || 3,
      status: entry.status
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedEntry(null);
    setFormData({
      trade_date: new Date().toISOString().split('T')[0],
      instrument: '',
      direction: 'long',
      entry_price: '',
      exit_price: '',
      quantity: '',
      strategy: '',
      emotional_state: '',
      pre_trade_plan: '',
      post_trade_review: '',
      mistakes: '',
      lessons_learned: '',
      tags: '',
      rating: 3,
      status: 'open'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-400" />
            Trading Journal
          </h2>
          <p className="text-slate-400 mt-1">Document your trades and improve your performance</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          New Entry
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {selectedEntry ? 'Edit Entry' : 'New Journal Entry'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.trade_date}
                    onChange={(e) => setFormData({ ...formData, trade_date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Instrument</label>
                  <input
                    type="text"
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                    placeholder="ES, NQ, CL, etc."
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Direction</label>
                  <select
                    value={formData.direction}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'long' | 'short' })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Entry Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.entry_price}
                    onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Exit Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.exit_price}
                    onChange={(e) => setFormData({ ...formData, exit_price: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'open' | 'closed' })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className="text-2xl"
                      >
                        <Star
                          className={`w-6 h-6 ${rating <= formData.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Strategy</label>
                <input
                  type="text"
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  placeholder="Breakout, Pullback, Range Trading, etc."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Emotional State</label>
                <input
                  type="text"
                  value={formData.emotional_state}
                  onChange={(e) => setFormData({ ...formData, emotional_state: e.target.value })}
                  placeholder="Confident, Anxious, Excited, etc."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Pre-Trade Plan</label>
                <textarea
                  value={formData.pre_trade_plan}
                  onChange={(e) => setFormData({ ...formData, pre_trade_plan: e.target.value })}
                  placeholder="What was your plan before entering?"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Post-Trade Review</label>
                <textarea
                  value={formData.post_trade_review}
                  onChange={(e) => setFormData({ ...formData, post_trade_review: e.target.value })}
                  placeholder="What happened during the trade?"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Mistakes</label>
                <textarea
                  value={formData.mistakes}
                  onChange={(e) => setFormData({ ...formData, mistakes: e.target.value })}
                  placeholder="What went wrong?"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Lessons Learned</label>
                <textarea
                  value={formData.lessons_learned}
                  onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                  placeholder="What did you learn?"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="breakout, news-driven, revenge-trade"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
                >
                  {selectedEntry ? 'Update Entry' : 'Save Entry'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {entries.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">No Journal Entries Yet</h3>
            <p className="text-slate-500 mb-6">Start documenting your trades to track your progress</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First Entry
            </button>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${entry.direction === 'long' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {entry.direction === 'long' ? (
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {entry.instrument}
                      <span className={`text-sm px-2 py-1 rounded ${entry.direction === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {entry.direction.toUpperCase()}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${entry.status === 'open' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {entry.status.toUpperCase()}
                      </span>
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (entry.rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editEntry(entry)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-slate-500 text-sm">Date</p>
                  <p className="text-white font-semibold">{new Date(entry.trade_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Entry Price</p>
                  <p className="text-white font-semibold">${entry.entry_price}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Exit Price</p>
                  <p className="text-white font-semibold">{entry.exit_price ? `$${entry.exit_price}` : '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">P&L</p>
                  <p className={`font-semibold ${entry.pnl && entry.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {entry.pnl ? `$${entry.pnl.toFixed(2)} (${entry.pnl_percentage?.toFixed(2)}%)` : '-'}
                  </p>
                </div>
              </div>

              {entry.strategy && (
                <div className="mb-3">
                  <p className="text-slate-500 text-sm mb-1">Strategy</p>
                  <p className="text-white">{entry.strategy}</p>
                </div>
              )}

              {entry.emotional_state && (
                <div className="mb-3">
                  <p className="text-slate-500 text-sm mb-1">Emotional State</p>
                  <p className="text-white">{entry.emotional_state}</p>
                </div>
              )}

              {entry.pre_trade_plan && (
                <div className="mb-3">
                  <p className="text-slate-500 text-sm mb-1">Pre-Trade Plan</p>
                  <p className="text-slate-300">{entry.pre_trade_plan}</p>
                </div>
              )}

              {entry.post_trade_review && (
                <div className="mb-3">
                  <p className="text-slate-500 text-sm mb-1">Post-Trade Review</p>
                  <p className="text-slate-300">{entry.post_trade_review}</p>
                </div>
              )}

              {entry.mistakes && (
                <div className="mb-3">
                  <p className="text-slate-500 text-sm mb-1">Mistakes</p>
                  <p className="text-red-300">{entry.mistakes}</p>
                </div>
              )}

              {entry.lessons_learned && (
                <div className="mb-3">
                  <p className="text-slate-500 text-sm mb-1">Lessons Learned</p>
                  <p className="text-green-300">{entry.lessons_learned}</p>
                </div>
              )}

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {entry.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
