import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Award, Target, Lock } from 'lucide-react';

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
  created_at: string;
};

type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  created_at: string;
};

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('points');

    if (error) {
      console.error('Error fetching achievements:', error);
      return;
    }

    setAchievements(data || []);
    setLoading(false);
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user achievements:', error);
      return;
    }

    setUserAchievements(data || []);
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some((ua) => ua.achievement_id === achievementId);
  };

  const totalPoints = userAchievements.reduce((sum, ua) => {
    const achievement = achievements.find((a) => a.id === ua.achievement_id);
    return sum + (achievement?.points || 0);
  }, 0);

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const completionPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
        <p className="text-slate-400">Track your progress and unlock rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-300 text-sm">Total Points</div>
            <Trophy className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-4xl font-bold text-white">{totalPoints}</div>
          <div className="text-slate-400 text-sm mt-1">Keep earning!</div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Unlocked</div>
            <Award className="w-5 h-5 text-violet-400" />
          </div>
          <div className="text-4xl font-bold text-white">
            {unlockedCount}/{totalCount}
          </div>
          <div className="text-slate-400 text-sm mt-1">Achievements</div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Completion</div>
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-4xl font-bold text-white">{completionPercent.toFixed(0)}%</div>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-violet-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const unlocked = isUnlocked(achievement.id);
          const userAch = userAchievements.find((ua) => ua.achievement_id === achievement.id);

          return (
            <div
              key={achievement.id}
              className={`glass-card rounded-xl p-6 transition hover:scale-105 ${
                unlocked
                  ? 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-500/30'
                  : 'opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    unlocked ? 'bg-purple-500' : 'bg-slate-700'
                  }`}
                >
                  {unlocked ? (
                    <Trophy className="w-8 h-8 text-white" />
                  ) : (
                    <Lock className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    unlocked ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {achievement.points} pts
                </div>
              </div>

              <h3
                className={`text-lg font-bold mb-2 ${unlocked ? 'text-white' : 'text-slate-400'}`}
              >
                {achievement.name}
              </h3>

              <p className={`text-sm mb-3 ${unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                {achievement.description}
              </p>

              <div
                className={`text-xs p-3 rounded-lg ${
                  unlocked ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-700/50 text-slate-400'
                }`}
              >
                <div className="font-semibold mb-1">How to unlock:</div>
                {achievement.criteria}
              </div>

              {unlocked && userAch && (
                <div className="mt-4 pt-4 border-t border-purple-500/30">
                  <div className="text-xs text-purple-400">
                    Unlocked {new Date(userAch.earned_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {unlockedCount === totalCount && totalCount > 0 && (
        <div className="mt-8 glass-card bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-purple-500/30 rounded-xl p-8 text-center">
          <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Achievement Master!</h2>
          <p className="text-slate-300">
            You've unlocked all achievements! You're a true trading champion.
          </p>
        </div>
      )}
    </div>
  );
}
