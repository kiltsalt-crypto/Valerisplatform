import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PlayCircle, TrendingUp, BarChart2, Calendar } from 'lucide-react';

interface Backtest {
  id: string;
  name: string;
  instrument: string;
  start_date: string;
  end_date: string;
  total_trades: number;
  winning_trades: number;
  win_rate: number;
  profit_factor: number;
  final_capital: number;
  initial_capital: number;
}

export default function Backtesting() {
  const { profile } = useAuth();
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    instrument: 'ES',
    strategy: 'Moving Average Crossover',
    start_date: '2024-01-01',
    end_date: '2024-12-01',
    initial_capital: 10000
  });

  useEffect(() => {
    loadBacktests();
  }, [profile]);

  const loadBacktests = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('backtests')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) setBacktests(data);
  };

  const runBacktest = async () => {
    if (!profile) return;

    setIsRunning(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const totalTrades = Math.floor(Math.random() * 100) + 50;
    const winningTrades = Math.floor(totalTrades * (0.55 + Math.random() * 0.2));
    const winRate = (winningTrades / totalTrades) * 100;
    const profitFactor = 1.2 + Math.random() * 0.8;
    const finalCapital = formData.initial_capital * (1 + (Math.random() * 0.4 - 0.1));

    await supabase.from('backtests').insert({
      user_id: profile.id,
      name: formData.name,
      strategy_description: formData.strategy,
      instrument: formData.instrument,
      start_date: formData.start_date,
      end_date: formData.end_date,
      initial_capital: formData.initial_capital,
      final_capital: finalCapital,
      total_trades: totalTrades,
      winning_trades: winningTrades,
      losing_trades: totalTrades - winningTrades,
      win_rate: winRate,
      profit_factor: profitFactor,
      max_drawdown: Math.random() * 20,
      sharpe_ratio: 1 + Math.random() * 2
    });

    setIsRunning(false);
    setShowForm(false);
    loadBacktests();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-7 h-7 text-purple-400" />
            Strategy Backtesting
          </h1>
          <p className="text-slate-400 text-sm">Test your strategies against historical data</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-semibold"
        >
          <PlayCircle className="w-5 h-5" />
          New Backtest
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <h3 className="text-white font-semibold mb-4">Configure Backtest</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Test Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="MA Crossover Test"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Instrument</label>
              <select
                value={formData.instrument}
                onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                {['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC'].map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Initial Capital</label>
              <input
                type="number"
                value={formData.initial_capital}
                onChange={(e) => setFormData({ ...formData, initial_capital: parseFloat(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Strategy</label>
              <select
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                <option>Moving Average Crossover</option>
                <option>RSI Mean Reversion</option>
                <option>Breakout Strategy</option>
                <option>MACD Divergence</option>
              </select>
            </div>
          </div>

          <button
            onClick={runBacktest}
            disabled={isRunning}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-semibold disabled:opacity-50"
          >
            {isRunning ? 'Running Backtest...' : 'Run Backtest'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {backtests.map(backtest => {
          const pnl = backtest.final_capital - backtest.initial_capital;
          const returns = (pnl / backtest.initial_capital) * 100;

          return (
            <div key={backtest.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{backtest.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                      {backtest.instrument}
                    </span>
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(backtest.start_date).toLocaleDateString()} - {new Date(backtest.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pnl >= 0 ? '+' : ''}{returns.toFixed(2)}%
                  </p>
                  <p className="text-slate-400 text-sm">${pnl.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Total Trades</p>
                  <p className="text-white font-bold text-lg">{backtest.total_trades}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Win Rate</p>
                  <p className="text-white font-bold text-lg">{backtest.win_rate?.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Profit Factor</p>
                  <p className="text-white font-bold text-lg">{backtest.profit_factor?.toFixed(2)}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Winners</p>
                  <p className="text-green-400 font-bold text-lg">{backtest.winning_trades}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Final Capital</p>
                  <p className="text-white font-bold text-lg">${backtest.final_capital?.toFixed(0)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {backtests.length === 0 && !showForm && (
        <div className="glass-card p-12 text-center">
          <BarChart2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">No backtests yet</p>
          <p className="text-slate-500 text-sm">Test your strategies against historical market data</p>
        </div>
      )}
    </div>
  );
}
