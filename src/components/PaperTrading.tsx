import { useState, useEffect } from 'react';
import { supabase, Trade, WatchlistItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, Plus, Star, X, DollarSign } from 'lucide-react';

type TradeFormData = {
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  strategy: string;
  notes: string;
};

export default function PaperTrading() {
  const { user, profile, refreshProfile } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [showWatchlistForm, setShowWatchlistForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: '',
    type: 'buy',
    quantity: 0,
    entry_price: 0,
    stop_loss: 0,
    take_profit: 0,
    strategy: '',
    notes: '',
  });
  const [watchlistSymbol, setWatchlistSymbol] = useState('');

  useEffect(() => {
    if (user) {
      fetchTrades();
      fetchWatchlist();
    }
  }, [user]);

  const fetchTrades = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trades:', error);
      return;
    }

    setTrades(data || []);
    setLoading(false);
  };

  const fetchWatchlist = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching watchlist:', error);
      return;
    }

    setWatchlist(data || []);
  };

  const executeTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const tradeCost = formData.quantity * formData.entry_price;

    if (formData.type === 'buy' && tradeCost > profile.current_capital) {
      alert('Insufficient capital for this trade');
      return;
    }

    const { error } = await supabase.from('trades').insert({
      user_id: user.id,
      symbol: formData.symbol.toUpperCase(),
      type: formData.type,
      quantity: formData.quantity,
      entry_price: formData.entry_price,
      stop_loss: formData.stop_loss || null,
      take_profit: formData.take_profit || null,
      strategy: formData.strategy || null,
      notes: formData.notes || null,
      status: 'open',
      profit_loss: 0,
      profit_loss_percentage: 0,
    });

    if (error) {
      console.error('Error executing trade:', error);
      alert('Error executing trade');
      return;
    }

    const newCapital = formData.type === 'buy'
      ? profile.current_capital - tradeCost
      : profile.current_capital + tradeCost;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        current_capital: newCapital,
        total_trades: profile.total_trades + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    }

    setFormData({
      symbol: '',
      type: 'buy',
      quantity: 0,
      entry_price: 0,
      stop_loss: 0,
      take_profit: 0,
      strategy: '',
      notes: '',
    });
    setShowTradeForm(false);
    fetchTrades();
    refreshProfile();
  };

  const closeTrade = async (trade: Trade, exitPrice: number) => {
    if (!user || !profile) return;

    const profitLoss = trade.type === 'buy'
      ? (exitPrice - trade.entry_price) * trade.quantity
      : (trade.entry_price - exitPrice) * trade.quantity;

    const profitLossPercentage = ((exitPrice - trade.entry_price) / trade.entry_price) * 100 * (trade.type === 'buy' ? 1 : -1);

    const { error } = await supabase
      .from('trades')
      .update({
        status: 'closed',
        exit_price: exitPrice,
        exit_date: new Date().toISOString(),
        profit_loss: profitLoss,
        profit_loss_percentage: profitLossPercentage,
      })
      .eq('id', trade.id);

    if (error) {
      console.error('Error closing trade:', error);
      return;
    }

    const newCapital = profile.current_capital + profitLoss;
    const isWinningTrade = profitLoss > 0;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        current_capital: newCapital,
        winning_trades: isWinningTrade ? profile.winning_trades + 1 : profile.winning_trades,
        losing_trades: !isWinningTrade ? profile.losing_trades + 1 : profile.losing_trades,
        best_trade: profitLoss > profile.best_trade ? profitLoss : profile.best_trade,
        worst_trade: profitLoss < profile.worst_trade ? profitLoss : profile.worst_trade,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    }

    fetchTrades();
    refreshProfile();
  };

  const addToWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('watchlist').insert({
      user_id: user.id,
      symbol: watchlistSymbol.toUpperCase(),
    });

    if (error) {
      if (error.code === '23505') {
        alert('Symbol already in watchlist');
      } else {
        console.error('Error adding to watchlist:', error);
      }
      return;
    }

    setWatchlistSymbol('');
    setShowWatchlistForm(false);
    fetchWatchlist();
  };

  const removeFromWatchlist = async (id: string) => {
    const { error } = await supabase.from('watchlist').delete().eq('id', id);

    if (error) {
      console.error('Error removing from watchlist:', error);
      return;
    }

    fetchWatchlist();
  };

  const openTrades = trades.filter((t) => t.status === 'open');
  const closedTrades = trades.filter((t) => t.status === 'closed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading trades...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Paper Trading</h1>
        <p className="text-slate-400">Practice trading with virtual capital</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">Current Capital</div>
          <div className="text-3xl font-bold text-white">
            ${profile?.current_capital.toLocaleString()}
          </div>
          <div className={`text-sm mt-2 ${(profile?.current_capital || 0) >= (profile?.starting_capital || 0) ? 'text-emerald-400' : 'text-red-400'}`}>
            {(profile?.current_capital || 0) >= (profile?.starting_capital || 0) ? '+' : ''}
            ${((profile?.current_capital || 0) - (profile?.starting_capital || 0)).toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">Win Rate</div>
          <div className="text-3xl font-bold text-white">
            {profile?.total_trades ? Math.round((profile.winning_trades / profile.total_trades) * 100) : 0}%
          </div>
          <div className="text-sm mt-2 text-slate-400">
            {profile?.winning_trades}W / {profile?.losing_trades}L
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">Total Trades</div>
          <div className="text-3xl font-bold text-white">{profile?.total_trades}</div>
          <div className="text-sm mt-2 text-slate-400">
            {openTrades.length} open positions
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Open Positions</h2>
            <button
              onClick={() => setShowTradeForm(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              New Trade
            </button>
          </div>

          {openTrades.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-slate-400">No open positions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {openTrades.map((trade) => (
                <div key={trade.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{trade.symbol}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {trade.quantity} shares @ ${trade.entry_price}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const exitPrice = parseFloat(prompt('Enter exit price:') || '0');
                        if (exitPrice > 0) {
                          closeTrade(trade, exitPrice);
                        }
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Close Position
                    </button>
                  </div>

                  {trade.strategy && (
                    <div className="mb-3">
                      <span className="text-slate-400 text-sm">Strategy: </span>
                      <span className="text-white text-sm">{trade.strategy}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {trade.stop_loss && (
                      <div>
                        <span className="text-slate-400">Stop Loss: </span>
                        <span className="text-red-400 font-semibold">${trade.stop_loss}</span>
                      </div>
                    )}
                    {trade.take_profit && (
                      <div>
                        <span className="text-slate-400">Take Profit: </span>
                        <span className="text-emerald-400 font-semibold">${trade.take_profit}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Watchlist</h2>
            <button
              onClick={() => setShowWatchlistForm(true)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Star className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {watchlist.map((item) => (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">{item.symbol}</div>
                  {item.notes && <div className="text-slate-400 text-sm">{item.notes}</div>}
                </div>
                <button
                  onClick={() => removeFromWatchlist(item.id)}
                  className="text-slate-400 hover:text-red-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {watchlist.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center text-slate-400 text-sm">
                No symbols in watchlist
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Trade History</h2>
        {closedTrades.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <p className="text-slate-400">No closed trades yet</p>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Entry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Exit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">P/L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">P/L %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {closedTrades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-slate-750">
                      <td className="px-6 py-4 text-white font-semibold">{trade.symbol}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{trade.quantity}</td>
                      <td className="px-6 py-4 text-slate-300">${trade.entry_price}</td>
                      <td className="px-6 py-4 text-slate-300">${trade.exit_price}</td>
                      <td className={`px-6 py-4 font-semibold ${trade.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 font-semibold ${trade.profit_loss_percentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.profit_loss_percentage >= 0 ? '+' : ''}{trade.profit_loss_percentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showTradeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">New Trade</h3>
            <form onSubmit={executeTrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="AAPL"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'buy' | 'sell' })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Entry Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.entry_price || ''}
                    onChange={(e) => setFormData({ ...formData, entry_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Stop Loss</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stop_loss || ''}
                    onChange={(e) => setFormData({ ...formData, stop_loss: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Take Profit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.take_profit || ''}
                    onChange={(e) => setFormData({ ...formData, take_profit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Strategy</label>
                <input
                  type="text"
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Breakout, Trend Following, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={3}
                  placeholder="Trade reasoning and observations"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Execute Trade
                </button>
                <button
                  type="button"
                  onClick={() => setShowTradeForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWatchlistForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-4">Add to Watchlist</h3>
            <form onSubmit={addToWatchlist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Symbol</label>
                <input
                  type="text"
                  value={watchlistSymbol}
                  onChange={(e) => setWatchlistSymbol(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="AAPL"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowWatchlistForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
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
