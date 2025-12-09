import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  score: number;
  rank: number;
  period: string;
  metric: string;
  updated_at: string;
}

export default function Leaderboard() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('monthly');
  const [metric, setMetric] = useState<'pnl' | 'win-rate' | 'trades'>('pnl');
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [period, metric, profile]);

  const loadLeaderboard = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('period', period)
        .eq('metric', metric)
        .order('rank', { ascending: true })
        .limit(50);

      if (error) throw error;

      setEntries(data || []);
      const myEntry = data?.find(e => e.user_id === profile.id);
      setUserRank(myEntry || null);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-purple-600" />;
      default:
        return <span className="text-slate-400 font-bold">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-slate-400/20 to-slate-500/20 border-slate-400/30';
      case 3:
        return 'bg-gradient-to-r from-purple-600/20 to-purple-700/20 border-purple-600/30';
      default:
        return '';
    }
  };

  const formatScore = (score: number, metric: string) => {
    switch (metric) {
      case 'pnl':
        return `$${score.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'win-rate':
        return `${score.toFixed(1)}%`;
      case 'trades':
        return score.toString();
      default:
        return score.toString();
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'pnl':
        return 'Total P&L';
      case 'win-rate':
        return 'Win Rate';
      case 'trades':
        return 'Total Trades';
      default:
        return metric;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="glass-card p-4 h-20 bg-slate-800/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-purple-400" />
            Leaderboard
          </h1>
          <p className="text-slate-400">Compete with top traders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-400 text-sm font-medium mb-2">Period</label>
          <div className="grid grid-cols-4 gap-2">
            {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  period === p
                    ? 'bg-purple-500 text-black'
                    : 'glass-card text-slate-400 hover:text-white'
                }`}
              >
                {p === 'all-time' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-sm font-medium mb-2">Metric</label>
          <div className="grid grid-cols-3 gap-2">
            {(['pnl', 'win-rate', 'trades'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  metric === m
                    ? 'bg-purple-500 text-black'
                    : 'glass-card text-slate-400 hover:text-white'
                }`}
              >
                {m === 'win-rate' ? 'Win %' : m === 'pnl' ? 'P&L' : 'Trades'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {userRank && (
        <div className="glass-card p-4 border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20">
                  {getRankIcon(userRank.rank)}
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">Your Rank</p>
                <p className="text-slate-400 text-sm">#{userRank.rank} out of {entries.length}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-purple-400 font-bold text-xl">
                {formatScore(userRank.score, metric)}
              </p>
              <p className="text-slate-400 text-sm">{getMetricLabel(metric)}</p>
            </div>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No leaderboard data yet</p>
          <p className="text-slate-500 text-sm mt-2">
            Start trading to see your ranking
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`glass-card p-4 border transition hover:scale-[1.01] ${
                getRankBg(entry.rank)
              } ${entry.user_id === profile?.id ? 'border-purple-500/50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      {entry.username || `Trader ${entry.user_id.substring(0, 8)}`}
                      {entry.user_id === profile?.id && (
                        <span className="ml-2 text-purple-400 text-sm">(You)</span>
                      )}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {getMetricLabel(metric)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold text-xl ${
                      entry.rank <= 3 ? 'text-purple-400' : 'text-white'
                    }`}>
                      {formatScore(entry.score, metric)}
                    </p>
                    <p className="text-slate-500 text-xs">
                      Updated {new Date(entry.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
