import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Flame, TrendingUp, TrendingDown, Award, Target } from 'lucide-react';

interface StreakData {
  current_win_streak: number;
  current_loss_streak: number;
  longest_win_streak: number;
  longest_loss_streak: number;
  last_trade_result: string;
  last_updated: string;
}

export default function StreakTracker() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreakData();
      const subscription = supabase
        .channel('trades_channel')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `user_id=eq.${user.id}`
        }, () => {
          updateStreaks();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchStreakData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('streak_tracking')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setStreakData(data);
    } else {
      await initializeStreak();
    }
    setLoading(false);
  };

  const initializeStreak = async () => {
    if (!user) return;

    const { data } = await supabase.from('streak_tracking').insert({
      user_id: user.id,
      current_win_streak: 0,
      current_loss_streak: 0,
      longest_win_streak: 0,
      longest_loss_streak: 0,
    }).select().single();

    if (data) setStreakData(data);
  };

  const updateStreaks = async () => {
    if (!user) return;

    const { data: trades } = await supabase
      .from('trades')
      .select('profit_loss, exit_date')
      .eq('user_id', user.id)
      .eq('status', 'closed')
      .order('exit_date', { ascending: false })
      .limit(100);

    if (!trades || trades.length === 0) return;

    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;

    for (const trade of trades) {
      const isWin = trade.profit_loss > 0;

      if (isWin) {
        tempWinStreak++;
        tempLossStreak = 0;
        if (tempWinStreak > longestWinStreak) longestWinStreak = tempWinStreak;
      } else {
        tempLossStreak++;
        tempWinStreak = 0;
        if (tempLossStreak > longestLossStreak) longestLossStreak = tempLossStreak;
      }
    }

    currentWinStreak = trades[0].profit_loss > 0 ? tempWinStreak : 0;
    currentLossStreak = trades[0].profit_loss <= 0 ? tempLossStreak : 0;

    await supabase.from('streak_tracking').upsert({
      user_id: user.id,
      current_win_streak: currentWinStreak,
      current_loss_streak: currentLossStreak,
      longest_win_streak: Math.max(longestWinStreak, streakData?.longest_win_streak || 0),
      longest_loss_streak: Math.max(longestLossStreak, streakData?.longest_loss_streak || 0),
      last_trade_result: trades[0].profit_loss > 0 ? 'win' : 'loss',
      last_updated: new Date().toISOString(),
    });

    fetchStreakData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading streaks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Streak Tracker</h1>
        <p className="text-slate-400">Monitor your winning and losing streaks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/30 rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Current Win Streak</h2>
            </div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-emerald-400 mb-2">
              {streakData?.current_win_streak || 0}
            </div>
            <div className="text-slate-300 text-lg">consecutive wins</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/50 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Current Loss Streak</h2>
            </div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-red-400 mb-2">
              {streakData?.current_loss_streak || 0}
            </div>
            <div className="text-slate-300 text-lg">consecutive losses</div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Best Win Streak</h3>
          </div>
          <div className="text-4xl font-bold text-yellow-400 mb-2">
            {streakData?.longest_win_streak || 0}
          </div>
          <div className="text-slate-400">Your longest winning streak</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-bold text-white">Worst Loss Streak</h3>
          </div>
          <div className="text-4xl font-bold text-orange-400 mb-2">
            {streakData?.longest_loss_streak || 0}
          </div>
          <div className="text-slate-400">Your longest losing streak</div>
        </div>
      </div>

      {streakData && streakData.current_loss_streak >= 3 && (
        <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚠️</div>
            <div>
              <h3 className="text-xl font-bold text-orange-400 mb-2">Losing Streak Warning</h3>
              <p className="text-slate-300 mb-4">
                You're on a {streakData.current_loss_streak}-trade losing streak. Consider taking a break to review your strategy.
              </p>
              <ul className="space-y-2 text-slate-300">
                <li>• Review your recent trades in your journal</li>
                <li>• Check if you're following your trading plan</li>
                <li>• Consider reducing position sizes</li>
                <li>• Take a mental break before your next trade</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {streakData && streakData.current_win_streak >= 5 && (
        <div className="mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Hot Streak!</h3>
              <p className="text-slate-300 mb-4">
                You're on a {streakData.current_win_streak}-trade winning streak! Keep doing what's working, but stay disciplined.
              </p>
              <ul className="space-y-2 text-slate-300">
                <li>• Don't get overconfident or increase risk</li>
                <li>• Stick to your proven strategy</li>
                <li>• Document what's working in your journal</li>
                <li>• Remember: consistency beats emotion</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
