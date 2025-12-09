import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, Award, Target, BookOpen, Calendar, Bell, Zap } from 'lucide-react';

interface DashboardStats {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  todayPnl: number;
  activeEvaluation: any;
  moduleProgress: number;
  nextModule: any;
  recentTrades: any[];
  notifications: any[];
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTrades: 0,
    winRate: 0,
    totalPnl: 0,
    todayPnl: 0,
    activeEvaluation: null,
    moduleProgress: 0,
    nextModule: null,
    recentTrades: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const [tradesRes, dailyRes, evaluationRes, progressRes, notificationsRes] = await Promise.all([
        supabase
          .from('trades')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('dashboard_stats')
          .select('*')
          .eq('user_id', profile.id)
          .eq('date', today)
          .maybeSingle(),
        supabase
          .from('evaluation_challenges')
          .select('*')
          .eq('user_id', profile.id)
          .eq('status', 'active')
          .maybeSingle(),
        supabase
          .from('user_progress')
          .select('*, learning_modules(*)')
          .eq('user_id', profile.id),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const completedModules = progressRes.data?.filter(p => p.completed).length || 0;
      const totalModules = 12;
      const moduleProgress = (completedModules / totalModules) * 100;

      const nextModule = progressRes.data?.find(p => !p.completed)?.learning_modules;

      setStats({
        totalTrades: profile.total_trades || 0,
        winRate: profile.total_trades > 0
          ? ((profile.winning_trades || 0) / profile.total_trades) * 100
          : 0,
        totalPnl: Number(profile.current_capital || 0) - Number(profile.starting_capital || 0),
        todayPnl: Number(dailyRes.data?.total_pnl || 0),
        activeEvaluation: evaluationRes.data,
        moduleProgress,
        nextModule,
        recentTrades: tradesRes.data || [],
        notifications: notificationsRes.data || []
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 h-32 bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back, {profile?.full_name || 'Trader'}!
          </h1>
          <p className="text-slate-400 text-sm">Here's your trading overview for today</p>
        </div>
        {stats.notifications.length > 0 && (
          <button className="relative glass-card p-3 hover:bg-slate-800/50 transition">
            <Bell className="w-6 h-6 text-blue-400" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {stats.notifications.length}
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-xs font-medium">Today's P&L</h3>
            {stats.todayPnl >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <p className={`text-2xl font-bold ${stats.todayPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${stats.todayPnl.toFixed(2)}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Total: ${stats.totalPnl.toFixed(2)}
          </p>
        </div>

        <div className="glass-card p-4 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-xs font-medium">Win Rate</h3>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.winRate.toFixed(1)}%
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {stats.totalTrades} total trades
          </p>
        </div>

        <div className="glass-card p-4 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-xs font-medium">Learning Progress</h3>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.moduleProgress.toFixed(0)}%
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {stats.nextModule ? `Next: ${stats.nextModule.title?.substring(0, 20)}...` : 'All complete!'}
          </p>
        </div>

        <div className="glass-card p-4 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-xs font-medium">Evaluation Status</h3>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          {stats.activeEvaluation ? (
            <>
              <p className="text-2xl font-bold text-white">
                {((Number(stats.activeEvaluation.current_balance) / Number(stats.activeEvaluation.starting_balance) - 1) * 100).toFixed(1)}%
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Day {stats.activeEvaluation.days_traded} of {stats.activeEvaluation.min_trading_days}
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-slate-400">No Active</p>
              <p className="text-slate-500 text-xs mt-1">Start an evaluation</p>
            </>
          )}
        </div>
      </div>

      {stats.activeEvaluation && (
        <div className="glass-card p-4">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            Active Evaluation Progress
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Profit Target</span>
                <span className="text-white">
                  ${(Number(stats.activeEvaluation.current_balance) - Number(stats.activeEvaluation.starting_balance)).toFixed(2)} /
                  ${Number(stats.activeEvaluation.profit_target).toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(((Number(stats.activeEvaluation.current_balance) - Number(stats.activeEvaluation.starting_balance)) / Number(stats.activeEvaluation.profit_target)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Trading Days</span>
                <span className="text-white">
                  {stats.activeEvaluation.days_traded} / {stats.activeEvaluation.min_trading_days}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(stats.activeEvaluation.days_traded / stats.activeEvaluation.min_trading_days) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-slate-800/50 rounded-lg p-2">
                <p className="text-slate-400 text-xs mb-1">Max Loss Limit</p>
                <p className="text-red-400 font-bold text-sm">${Number(stats.activeEvaluation.max_loss).toFixed(2)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2">
                <p className="text-slate-400 text-xs mb-1">Daily Loss Limit</p>
                <p className="text-orange-400 font-bold text-sm">${Number(stats.activeEvaluation.daily_loss_limit).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h2 className="text-lg font-bold text-white mb-3">Recent Trades</h2>
          {stats.recentTrades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No trades yet. Start trading to see your history here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentTrades.map((trade) => (
                <div key={trade.id} className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{trade.symbol}</p>
                      <p className="text-slate-400 text-sm">{new Date(trade.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${Number(trade.profit_loss) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${Number(trade.profit_loss).toFixed(2)}
                      </p>
                      <p className="text-slate-400 text-sm">{trade.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-4">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold py-2 px-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition text-sm">
              New Trade
            </button>
            <button className="glass-card text-white font-semibold py-2 px-3 rounded-lg hover:bg-slate-800/50 transition text-sm">
              Journal Entry
            </button>
            <button className="glass-card text-white font-semibold py-2 px-3 rounded-lg hover:bg-slate-800/50 transition text-sm">
              Next Module
            </button>
            <button className="glass-card text-white font-semibold py-2 px-3 rounded-lg hover:bg-slate-800/50 transition text-sm">
              View Analytics
            </button>
          </div>

          {stats.notifications.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Recent Notifications</h3>
              <div className="space-y-2">
                {stats.notifications.map((notif) => (
                  <div key={notif.id} className="bg-slate-800/50 rounded-lg p-3 text-sm">
                    <p className="text-white font-medium">{notif.title}</p>
                    <p className="text-slate-400 text-xs mt-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
