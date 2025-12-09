import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Zap, Calendar, Award, Activity, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DayPerformance {
  date: string;
  pnl: number;
  trades: number;
}

export default function PerformanceDashboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [heatmapData, setHeatmapData] = useState<DayPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPerformanceData();
    }
  }, [timeframe, user]);

  const loadPerformanceData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('trades')
        .select('exit_time, pnl')
        .eq('user_id', user.id)
        .gte('exit_time', startDate.toISOString())
        .not('exit_time', 'is', null);

      if (error) throw error;

      const dailyData = new Map<string, { pnl: number; trades: number }>();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData.set(dateStr, { pnl: 0, trades: 0 });
      }

      data?.forEach((trade) => {
        const dateStr = new Date(trade.exit_time).toISOString().split('T')[0];
        if (dailyData.has(dateStr)) {
          const existing = dailyData.get(dateStr)!;
          dailyData.set(dateStr, {
            pnl: existing.pnl + (trade.pnl || 0),
            trades: existing.trades + 1
          });
        }
      });

      const result: DayPerformance[] = Array.from(dailyData.entries()).map(([date, stats]) => ({
        date,
        pnl: stats.pnl,
        trades: stats.trades
      }));

      setHeatmapData(result);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPnL = heatmapData.reduce((sum, day) => sum + day.pnl, 0);
  const winningDays = heatmapData.filter(d => d.pnl > 0).length;
  const losingDays = heatmapData.filter(d => d.pnl < 0).length;
  const winRate = ((winningDays / (winningDays + losingDays)) * 100) || 0;

  const bestDay = heatmapData.reduce((best, day) => day.pnl > best.pnl ? day : best, heatmapData[0] || { pnl: 0, date: '', trades: 0 });
  const worstDay = heatmapData.reduce((worst, day) => day.pnl < worst.pnl ? day : worst, heatmapData[0] || { pnl: 0, date: '', trades: 0 });

  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  for (let i = heatmapData.length - 1; i >= 0; i--) {
    if (heatmapData[i].pnl > 0) {
      tempStreak++;
      if (i === heatmapData.length - 1 || currentStreak === 0) {
        currentStreak = tempStreak;
      }
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      if (i < heatmapData.length - 1) tempStreak = 0;
    }
  }

  const getHeatmapColor = (pnl: number) => {
    if (pnl === 0) return 'bg-slate-800';
    const intensity = Math.min(Math.abs(pnl) / 1000, 1);
    if (pnl > 0) {
      if (intensity > 0.7) return 'bg-green-500';
      if (intensity > 0.4) return 'bg-green-600';
      return 'bg-green-700';
    } else {
      if (intensity > 0.7) return 'bg-red-500';
      if (intensity > 0.4) return 'bg-red-600';
      return 'bg-red-700';
    }
  };

  const weeksData: DayPerformance[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeksData.push(heatmapData.slice(i, i + 7));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-7 h-7 text-purple-400" />
          Performance Dashboard
        </h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total P&L</p>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(0)}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {winningDays}W / {losingDays}L
          </p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Win Rate</p>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Current Streak</p>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{currentStreak}</p>
          <p className="text-slate-500 text-xs mt-1">
            Max: {maxStreak} days
          </p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Trades</p>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {heatmapData.reduce((sum, day) => sum + day.trades, 0)}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Avg: {(heatmapData.reduce((sum, day) => sum + day.trades, 0) / heatmapData.length).toFixed(1)}/day
          </p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            P&L Heatmap
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-slate-400">Loss</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-slate-800 rounded"></div>
              <span className="text-slate-400">Flat</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-slate-400">Win</span>
            </div>
          </div>
        </div>

        <div className="space-y-1 overflow-x-auto">
          {weeksData.map((week, weekIdx) => (
            <div key={weekIdx} className="flex gap-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`w-8 h-8 rounded ${getHeatmapColor(day.pnl)} transition-all hover:scale-110 cursor-pointer group relative`}
                  title={`${day.date}: ${day.pnl >= 0 ? '+' : ''}$${day.pnl.toFixed(0)}`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {day.date}
                    <br />
                    <span className={day.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {day.pnl >= 0 ? '+' : ''}${day.pnl.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-semibold">Best Trading Day</h3>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">{bestDay.date}</p>
            <p className="text-3xl font-bold text-green-400 mb-2">+${bestDay.pnl.toFixed(2)}</p>
            <p className="text-slate-400 text-sm">{bestDay.trades} trades executed</p>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-semibold">Worst Trading Day</h3>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">{worstDay.date}</p>
            <p className="text-3xl font-bold text-red-400 mb-2">${worstDay.pnl.toFixed(2)}</p>
            <p className="text-slate-400 text-sm">{worstDay.trades} trades executed</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Recent Achievements</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {currentStreak >= 3 && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold">Hot Streak!</span>
              </div>
              <p className="text-slate-400 text-sm">{currentStreak} winning days in a row</p>
            </div>
          )}
          {winRate >= 60 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">High Win Rate</span>
              </div>
              <p className="text-slate-400 text-sm">Maintaining {winRate.toFixed(0)}% win rate</p>
            </div>
          )}
          {totalPnL >= 5000 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">Profit Milestone</span>
              </div>
              <p className="text-slate-400 text-sm">Over $5,000 in profits</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
