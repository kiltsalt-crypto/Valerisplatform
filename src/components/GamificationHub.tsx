import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, Flame, Target, Zap, Medal, Crown } from 'lucide-react';

export default function GamificationHub() {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: challengesData } = await supabase
      .from('daily_challenges')
      .select('*')
      .gte('challenge_date', new Date().toISOString().split('T')[0])
      .order('challenge_date', { ascending: false })
      .limit(5);

    const { data: userChallengesData } = await supabase
      .from('user_challenges')
      .select('*, daily_challenges(*)')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });

    const { data: streaksData } = await supabase
      .from('trading_streaks')
      .select('*')
      .eq('user_id', profile?.id);

    const { data: competitionsData } = await supabase
      .from('competitions')
      .select('*')
      .in('status', ['upcoming', 'active'])
      .order('start_date', { ascending: false });

    if (challengesData) setChallenges(challengesData);
    if (userChallengesData) setUserChallenges(userChallengesData);
    if (streaksData) setStreaks(streaksData);
    if (competitionsData) setCompetitions(competitionsData);
  };

  const joinChallenge = async (challengeId: string) => {
    await supabase.from('user_challenges').insert({
      user_id: profile?.id,
      challenge_id: challengeId,
      status: 'in_progress'
    });
    loadData();
  };

  const joinCompetition = async (competitionId: string) => {
    await supabase.from('competition_participants').insert({
      competition_id: competitionId,
      user_id: profile?.id
    });
    loadData();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Trophy className="w-7 h-7 text-purple-400" />
          Gamification Hub
        </h1>
        <p className="text-slate-400 text-sm">Challenges, streaks, and competitions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {streaks.map((streak) => (
          <div key={streak.id} className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-semibold text-sm capitalize">
                {streak.streak_type.replace(/_/g, ' ')}
              </h3>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{streak.current_streak}</p>
            <p className="text-slate-400 text-xs">Best: {streak.longest_streak}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Daily Challenges
        </h2>
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const userChallenge = userChallenges.find(uc => uc.challenge_id === challenge.id);
            const isCompleted = userChallenge?.status === 'completed';
            const isInProgress = userChallenge?.status === 'in_progress';

            return (
              <div key={challenge.id} className="bg-slate-800/50 p-3 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-sm">{challenge.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        challenge.difficulty === 'easy'
                          ? 'bg-green-500/20 text-green-400'
                          : challenge.difficulty === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">{challenge.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-purple-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {challenge.reward_points} pts
                      </span>
                      {challenge.reward_badge && (
                        <span className="text-yellow-400 flex items-center gap-1">
                          <Medal className="w-3 h-3" />
                          {challenge.reward_badge}
                        </span>
                      )}
                    </div>
                  </div>
                  {isCompleted ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                      Completed
                    </span>
                  ) : isInProgress ? (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                      In Progress
                    </span>
                  ) : (
                    <button
                      onClick={() => joinChallenge(challenge.id)}
                      className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-4">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          Trading Competitions
        </h2>
        <div className="space-y-3">
          {competitions.map((comp) => (
            <div key={comp.id} className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{comp.title}</h3>
                  <p className="text-slate-400 text-sm mb-2">{comp.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400">
                      {new Date(comp.start_date).toLocaleDateString()} - {new Date(comp.end_date).toLocaleDateString()}
                    </span>
                    <span className="text-yellow-400 font-semibold">Prize: ${comp.prize_pool}</span>
                  </div>
                </div>
                <button
                  onClick={() => joinCompetition(comp.id)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 text-sm font-semibold"
                >
                  Join
                </button>
              </div>
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                comp.status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {comp.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
