import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  entry_fee: number;
  status: string;
  participant_count?: number;
  user_rank?: number;
  user_pnl?: number;
}

export default function TradingChallenges() {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  useEffect(() => {
    loadChallenges();
    seedSampleChallenges();
  }, [activeTab]);

  const seedSampleChallenges = async () => {
    const { count } = await supabase
      .from('trading_challenges')
      .select('*', { count: 'exact', head: true });

    if (count === 0) {
      const sampleChallenges = [
        {
          title: 'Weekly Profit Challenge',
          description: 'Highest net P&L wins! Trade any instrument.',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          prize_pool: 5000,
          entry_fee: 50,
          status: 'active',
          rules: { max_drawdown: 20, min_trades: 5 }
        },
        {
          title: 'Futures Masters Tournament',
          description: 'Best win rate with minimum 20 trades',
          start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          prize_pool: 10000,
          entry_fee: 100,
          status: 'upcoming',
          rules: { min_trades: 20, instruments: ['ES', 'NQ'] }
        },
        {
          title: 'Scalping Championship',
          description: 'Most profitable scalping strategy',
          start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          prize_pool: 3000,
          entry_fee: 25,
          status: 'upcoming',
          rules: { max_hold_time: '5 minutes' }
        }
      ];

      await supabase.from('trading_challenges').insert(sampleChallenges);
    }
  };

  const loadChallenges = async () => {
    const { data } = await supabase
      .from('trading_challenges')
      .select('*')
      .eq('status', activeTab)
      .order('start_date', { ascending: false });

    if (data) {
      const challengesWithParticipants = await Promise.all(
        data.map(async (challenge) => {
          const { count } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id);

          let userParticipation = null;
          if (profile) {
            const { data: participation } = await supabase
              .from('challenge_participants')
              .select('*')
              .eq('challenge_id', challenge.id)
              .eq('user_id', profile.id)
              .maybeSingle();

            userParticipation = participation;
          }

          return {
            ...challenge,
            participant_count: count || 0,
            user_rank: userParticipation?.rank,
            user_pnl: userParticipation?.current_pnl
          };
        })
      );

      setChallenges(challengesWithParticipants);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!profile) return;

    await supabase.from('challenge_participants').insert({
      challenge_id: challengeId,
      user_id: profile.id,
      current_pnl: 0
    });

    loadChallenges();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Trophy className="w-7 h-7 text-purple-400" />
          Trading Challenges
        </h1>
        <p className="text-slate-400 text-sm">Compete with traders worldwide for cash prizes</p>
      </div>

      <div className="flex items-center gap-2">
        {(['active', 'upcoming', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition capitalize ${
              activeTab === tab
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {challenges.map(challenge => {
          const isJoined = challenge.user_rank !== undefined;
          const daysRemaining = Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <div key={challenge.id} className="glass-card p-6 hover:bg-slate-800/50 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-bold text-xl">{challenge.title}</h3>
                    {isJoined && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                        Joined
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mb-3">{challenge.description}</p>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-white font-semibold">${challenge.prize_pool.toLocaleString()}</span>
                      <span className="text-slate-500 text-sm">Prize Pool</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-semibold">{challenge.participant_count}</span>
                      <span className="text-slate-500 text-sm">Participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-semibold">{daysRemaining}d</span>
                      <span className="text-slate-500 text-sm">Remaining</span>
                    </div>
                  </div>
                </div>

                {!isJoined && activeTab !== 'completed' && (
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    className="ml-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-semibold whitespace-nowrap"
                  >
                    Join (${challenge.entry_fee})
                  </button>
                )}
              </div>

              {isJoined && (
                <div className="pt-4 border-t border-slate-700">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <p className="text-slate-400 text-xs">Your Rank</p>
                      </div>
                      <p className="text-white font-bold text-lg">#{challenge.user_rank || 'TBD'}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <p className="text-slate-400 text-xs">Your P&L</p>
                      </div>
                      <p className={`font-bold text-lg ${(challenge.user_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${challenge.user_pnl?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Entry Fee Paid</p>
                      <p className="text-white font-bold text-lg">${challenge.entry_fee}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">No {activeTab} challenges</p>
          <p className="text-slate-500 text-sm">Check back soon for new competitions</p>
        </div>
      )}
    </div>
  );
}
