import { useState, useEffect } from 'react';
import { supabase, Trade } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Camera, Plus, TrendingUp, TrendingDown, Search } from 'lucide-react';

type JournalEntry = {
  id: string;
  user_id: string;
  trade_id: string;
  screenshot_url: string | null;
  setup_type: string | null;
  emotion_before: string | null;
  emotion_after: string | null;
  what_went_right: string | null;
  what_went_wrong: string | null;
  lessons_learned: string | null;
  would_take_again: boolean;
  created_at: string;
  trade?: Trade;
};

export default function TradingJournal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    setup_type: '',
    emotion_before: '',
    emotion_after: '',
    what_went_right: '',
    what_went_wrong: '',
    lessons_learned: '',
    would_take_again: true,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchEntries(), fetchTrades()]);
    setLoading(false);
  };

  const fetchEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trade_journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        return;
      }

      const tradesData = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);

      const tradesMap = new Map(tradesData.data?.map(t => [t.id, t]) || []);
      const entriesWithTrades = data?.map(entry => ({
        ...entry,
        trade: tradesMap.get(entry.trade_id),
      })) || [];

      setEntries(entriesWithTrades);
    } catch (error) {
      console.error('Error in fetchEntries:', error);
    }
  };

  const fetchTrades = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'closed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trades:', error);
        return;
      }

      const tradesWithoutJournal = data?.filter(trade =>
        !entries.some(entry => entry.trade_id === trade.id)
      ) || [];

      setTrades(tradesWithoutJournal);
    } catch (error) {
      console.error('Error in fetchTrades:', error);
    }
  };

  const createEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTrade) return;

    const { error } = await supabase.from('trade_journal_entries').insert({
      user_id: user.id,
      trade_id: selectedTrade,
      ...formData,
    });

    if (error) {
      console.error('Error creating entry:', error);
      alert('Error creating journal entry');
      return;
    }

    setFormData({
      setup_type: '',
      emotion_before: '',
      emotion_after: '',
      what_went_right: '',
      what_went_wrong: '',
      lessons_learned: '',
      would_take_again: true,
    });
    setSelectedTrade('');
    setShowForm(false);
    loadData();
  };

  const filteredEntries = entries.filter(entry =>
    entry.trade?.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.setup_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.lessons_learned?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading journal...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trading Journal</h1>
          <p className="text-slate-400">Reflect on your trades and improve consistently</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by symbol, setup, or lessons..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Journal Entries Yet</h3>
          <p className="text-slate-400 mb-6">
            Start journaling your trades to track patterns and improve your trading
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                    entry.trade && entry.trade.profit_loss >= 0
                      ? 'bg-emerald-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    {entry.trade && entry.trade.profit_loss >= 0 ? (
                      <TrendingUp className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-8 h-8 text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{entry.trade?.symbol}</h3>
                    <div className="text-slate-400 text-sm">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    entry.trade && entry.trade.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {entry.trade && entry.trade.profit_loss >= 0 ? '+' : ''}
                    ${entry.trade?.profit_loss.toFixed(2)}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {entry.trade?.quantity} shares @ ${entry.trade?.entry_price}
                  </div>
                </div>
              </div>

              {entry.setup_type && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
                    {entry.setup_type}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {entry.emotion_before && (
                  <div>
                    <div className="text-sm font-semibold text-slate-400 mb-1">Emotion Before</div>
                    <div className="text-white">{entry.emotion_before}</div>
                  </div>
                )}
                {entry.emotion_after && (
                  <div>
                    <div className="text-sm font-semibold text-slate-400 mb-1">Emotion After</div>
                    <div className="text-white">{entry.emotion_after}</div>
                  </div>
                )}
              </div>

              {entry.what_went_right && (
                <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="text-sm font-semibold text-emerald-400 mb-2">✓ What Went Right</div>
                  <div className="text-slate-300">{entry.what_went_right}</div>
                </div>
              )}

              {entry.what_went_wrong && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="text-sm font-semibold text-red-400 mb-2">× What Went Wrong</div>
                  <div className="text-slate-300">{entry.what_went_wrong}</div>
                </div>
              )}

              {entry.lessons_learned && (
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-sm font-semibold text-blue-400 mb-2">💡 Lessons Learned</div>
                  <div className="text-slate-300">{entry.lessons_learned}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">
                  Would take this trade again?
                </div>
                <div className={`text-sm font-semibold ${
                  entry.would_take_again ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {entry.would_take_again ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold text-white mb-6">New Journal Entry</h3>

            <form onSubmit={createEntry} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Trade *
                </label>
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                >
                  <option value="">Choose a trade...</option>
                  {trades.map((trade) => (
                    <option key={trade.id} value={trade.id}>
                      {trade.symbol} - {trade.type.toUpperCase()} - {trade.profit_loss >= 0 ? '+' : ''}$
                      {trade.profit_loss.toFixed(2)} ({new Date(trade.exit_date!).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Setup Type
                </label>
                <input
                  type="text"
                  value={formData.setup_type}
                  onChange={(e) => setFormData({ ...formData, setup_type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Breakout, Pullback, VWAP Bounce, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Emotion Before Trade
                  </label>
                  <select
                    value={formData.emotion_before}
                    onChange={(e) => setFormData({ ...formData, emotion_before: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="">Select...</option>
                    <option value="Confident">Confident</option>
                    <option value="Uncertain">Uncertain</option>
                    <option value="Fearful">Fearful</option>
                    <option value="Greedy">Greedy</option>
                    <option value="Calm">Calm</option>
                    <option value="Anxious">Anxious</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Emotion After Trade
                  </label>
                  <select
                    value={formData.emotion_after}
                    onChange={(e) => setFormData({ ...formData, emotion_after: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="">Select...</option>
                    <option value="Satisfied">Satisfied</option>
                    <option value="Disappointed">Disappointed</option>
                    <option value="Frustrated">Frustrated</option>
                    <option value="Euphoric">Euphoric</option>
                    <option value="Regretful">Regretful</option>
                    <option value="Neutral">Neutral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What Went Right?
                </label>
                <textarea
                  value={formData.what_went_right}
                  onChange={(e) => setFormData({ ...formData, what_went_right: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={3}
                  placeholder="What did you do correctly? What worked well?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What Went Wrong?
                </label>
                <textarea
                  value={formData.what_went_wrong}
                  onChange={(e) => setFormData({ ...formData, what_went_wrong: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={3}
                  placeholder="Mistakes made? What could be improved?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Lessons Learned
                </label>
                <textarea
                  value={formData.lessons_learned}
                  onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={3}
                  placeholder="Key takeaways from this trade..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="would_take_again"
                  checked={formData.would_take_again}
                  onChange={(e) => setFormData({ ...formData, would_take_again: e.target.checked })}
                  className="w-5 h-5 bg-slate-700 border-slate-600 rounded"
                />
                <label htmlFor="would_take_again" className="text-slate-300">
                  I would take this trade again with the same setup
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedTrade('');
                    setFormData({
                      setup_type: '',
                      emotion_before: '',
                      emotion_after: '',
                      what_went_right: '',
                      what_went_wrong: '',
                      lessons_learned: '',
                      would_take_again: true,
                    });
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
