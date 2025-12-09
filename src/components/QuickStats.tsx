import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

export default function QuickStats() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    todayPnL: 0,
    todayTrades: 0,
    weekPnL: 0,
    winRate: 0
  });

  useEffect(() => {
    loadStats();
  }, [profile]);

  const loadStats = async () => {
    if (!profile) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: todayTrades } = await supabase
      .from('trades')
      .select('profit_loss')
      .eq('user_id', profile.id)
      .gte('created_at', today.toISOString());

    const { data: weekTrades } = await supabase
      .from('trades')
      .select('profit_loss')
      .eq('user_id', profile.id)
      .gte('created_at', weekAgo.toISOString());

    const todayPnL = todayTrades?.reduce((sum, t: any) => sum + (t.profit_loss || 0), 0) || 0;
    const weekPnL = weekTrades?.reduce((sum, t: any) => sum + (t.profit_loss || 0), 0) || 0;
    const winningTrades = weekTrades?.filter((t: any) => t.profit_loss > 0).length || 0;
    const winRate = weekTrades?.length ? (winningTrades / weekTrades.length) * 100 : 0;

    setStats({
      todayPnL,
      todayTrades: todayTrades?.length || 0,
      weekPnL,
      winRate
    });
  };

  return (
    <div className="glass-card p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Zap className="w-5 h-5 text-red-500" />
        Quick Stats
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            {stats.todayPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <p className="text-slate-400 text-xs">Today P&L</p>
          </div>
          <p className={`text-xl font-bold ${stats.todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${stats.todayPnL.toFixed(2)}
          </p>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg">
          <p className="text-slate-400 text-xs mb-1">Today Trades</p>
          <p className="text-white text-xl font-bold">{stats.todayTrades}</p>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            {stats.weekPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <p className="text-slate-400 text-xs">Week P&L</p>
          </div>
          <p className={`text-xl font-bold ${stats.weekPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${stats.weekPnL.toFixed(2)}
          </p>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-purple-400" />
            <p className="text-slate-400 text-xs">Win Rate</p>
          </div>
          <p className="text-white text-xl font-bold">{stats.winRate.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
