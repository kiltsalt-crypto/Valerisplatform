import { useState, useEffect } from 'react';
import { supabase, Trade } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, Target, AlertCircle, Trophy, Calendar, Download, Filter } from 'lucide-react';

export default function AnalyticsEnhanced() {
  const { user, profile } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [user]);

  useEffect(() => {
    filterTradesByDate();
  }, [trades, dateRange, customStartDate, customEndDate]);

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

  const filterTradesByDate = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) {
          setFilteredTrades(trades);
          return;
        }
        startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        const filtered = trades.filter((trade) => {
          const tradeDate = new Date(trade.created_at);
          return tradeDate >= startDate && tradeDate <= endDate;
        });
        setFilteredTrades(filtered);
        return;
      case 'all':
      default:
        setFilteredTrades(trades);
        return;
    }

    const filtered = trades.filter((trade) => {
      const tradeDate = new Date(trade.created_at);
      return tradeDate >= startDate;
    });
    setFilteredTrades(filtered);
  };

  const exportToCSV = () => {
    if (filteredTrades.length === 0) return;

    const headers = ['Date', 'Symbol', 'Type', 'Quantity', 'Entry', 'Exit', 'P/L', 'P/L %', 'Status'];
    const rows = filteredTrades.map((trade) => [
      new Date(trade.created_at).toLocaleDateString(),
      trade.symbol,
      trade.type,
      trade.quantity,
      trade.entry_price,
      trade.exit_price || '-',
      trade.profit_loss.toFixed(2),
      trade.profit_loss_percentage.toFixed(2),
      trade.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    window.print();
  };

  const closedTrades = filteredTrades.filter((t) => t.status === 'closed');
  const totalProfitLoss = closedTrades.reduce((sum, trade) => sum + trade.profit_loss, 0);
  const winningTrades = closedTrades.filter((t) => t.profit_loss > 0).length;
  const losingTrades = closedTrades.filter((t) => t.profit_loss < 0).length;
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

  const avgWin = winningTrades > 0
    ? closedTrades.filter(t => t.profit_loss > 0).reduce((sum, t) => sum + t.profit_loss, 0) / winningTrades
    : 0;
  const avgLoss = losingTrades > 0
    ? Math.abs(closedTrades.filter(t => t.profit_loss < 0).reduce((sum, t) => sum + t.profit_loss, 0) / losingTrades)
    : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Advanced Analytics</h1>
            <p className="text-slate-400">Analyze your performance with custom date ranges</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Date Range Filter</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                dateRange === '7d'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                dateRange === '30d'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('90d')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                dateRange === '90d'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Last 90 Days
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                dateRange === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                dateRange === 'custom'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Custom Range
            </button>

            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-3">
            Showing {filteredTrades.length} trades in selected range
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Total P/L</div>
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)}
          </div>
          <div className="text-slate-400 text-sm mt-1">
            {closedTrades.length} closed trades
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Win Rate</div>
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
          <div className="text-slate-400 text-sm mt-1">
            {winningTrades}W / {losingTrades}L
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Profit Factor</div>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{profitFactor.toFixed(2)}</div>
          <div className="text-slate-400 text-sm mt-1">
            {profitFactor >= 2 ? 'Excellent' : profitFactor >= 1.5 ? 'Good' : profitFactor >= 1 ? 'Fair' : 'Poor'}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Avg Win/Loss</div>
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">+${avgWin.toFixed(2)}</div>
          <div className="text-lg font-bold text-red-400">-${avgLoss.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Trades in Selected Period</h2>
        {closedTrades.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No closed trades in this period. Try adjusting your date range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 text-sm font-semibold py-3 px-2">Date</th>
                  <th className="text-left text-slate-400 text-sm font-semibold py-3 px-2">Symbol</th>
                  <th className="text-left text-slate-400 text-sm font-semibold py-3 px-2">Type</th>
                  <th className="text-right text-slate-400 text-sm font-semibold py-3 px-2">Qty</th>
                  <th className="text-right text-slate-400 text-sm font-semibold py-3 px-2">Entry</th>
                  <th className="text-right text-slate-400 text-sm font-semibold py-3 px-2">Exit</th>
                  <th className="text-right text-slate-400 text-sm font-semibold py-3 px-2">P/L</th>
                  <th className="text-right text-slate-400 text-sm font-semibold py-3 px-2">P/L %</th>
                </tr>
              </thead>
              <tbody>
                {closedTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-2 text-slate-300 text-sm">
                      {new Date(trade.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-white font-semibold">{trade.symbol}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        trade.type === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-slate-300">{trade.quantity}</td>
                    <td className="py-3 px-2 text-right text-slate-300">${trade.entry_price.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right text-slate-300">${trade.exit_price?.toFixed(2) || '-'}</td>
                    <td className={`py-3 px-2 text-right font-bold ${
                      trade.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss.toFixed(2)}
                    </td>
                    <td className={`py-3 px-2 text-right font-bold ${
                      trade.profit_loss_percentage >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {trade.profit_loss_percentage >= 0 ? '+' : ''}{trade.profit_loss_percentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
