import { useState, useEffect } from 'react';
import { X, Award, Trophy, Target, Flame, Star, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GamificationSystemProps {
  onClose: () => void;
}

export default function GamificationSystem({ onClose }: GamificationSystemProps) {
  const { user } = useAuth();
  const [experience, setExperience] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges'>('overview');

  useEffect(() => {
    if (user) {
      fetchGamificationData();
    }
  }, [user]);

  const fetchGamificationData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [
        { data: expData },
        { data: userAchievements },
        { data: allAchievements },
        { data: activeChallenges }
      ] = await Promise.all([
        supabase
          .from('user_experience')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_achievements')
          .select('*, achievement:achievement_definitions(*)')
          .eq('user_id', user.id),
        supabase
          .from('achievement_definitions')
          .select('*')
          .order('points', { ascending: false }),
        supabase
          .from('trading_challenges_active')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
      ]);

      if (!expData) {
        const { data: newExp } = await supabase
          .from('user_experience')
          .insert({
            user_id: user.id,
            total_xp: 0,
            level: 1,
            current_streak: 0,
            longest_streak: 0
          })
          .select()
          .single();
        setExperience(newExp);
      } else {
        setExperience(expData);
      }

      setAchievements(userAchievements || []);
      setAvailableAchievements(allAchievements || []);
      setChallenges(activeChallenges || []);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getXPForNextLevel = (level: number) => {
    return level * 100;
  };

  const getCurrentLevelProgress = () => {
    if (!experience) return 0;
    const xpForCurrentLevel = (experience.level - 1) * 100;
    const xpForNextLevel = experience.level * 100;
    const progressInLevel = experience.total_xp - xpForCurrentLevel;
    return (progressInLevel / (xpForNextLevel - xpForCurrentLevel)) * 100;
  };

  const achievementCategories = [
    { id: 'trading', name: 'Trading', icon: TrendingUp, color: 'blue' },
    { id: 'consistency', name: 'Consistency', icon: Flame, color: 'orange' },
    { id: 'learning', name: 'Learning', icon: Star, color: 'yellow' },
    { id: 'community', name: 'Community', icon: Award, color: 'purple' }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Achievements & Progress</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b border-slate-700 px-6">
          <div className="flex gap-4">
            {['overview', 'achievements', 'challenges'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 px-4 font-semibold border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2">Level {experience?.level || 1}</h3>
                    <p className="text-slate-300">
                      {experience?.total_xp || 0} XP • {getXPForNextLevel(experience?.level || 1)} XP to next level
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${getCurrentLevelProgress()}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <Flame className="w-10 h-10 text-orange-400 mb-3" />
                  <p className="text-3xl font-black text-white mb-1">{experience?.current_streak || 0}</p>
                  <p className="text-slate-400">Day Streak</p>
                  <p className="text-orange-400 text-sm mt-2">
                    Best: {experience?.longest_streak || 0} days
                  </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <Award className="w-10 h-10 text-yellow-400 mb-3" />
                  <p className="text-3xl font-black text-white mb-1">{achievements.length}</p>
                  <p className="text-slate-400">Achievements Unlocked</p>
                  <p className="text-yellow-400 text-sm mt-2">
                    {availableAchievements.length - achievements.length} remaining
                  </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <Target className="w-10 h-10 text-green-400 mb-3" />
                  <p className="text-3xl font-black text-white mb-1">{challenges.length}</p>
                  <p className="text-slate-400">Active Challenges</p>
                  <p className="text-green-400 text-sm mt-2">In progress</p>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  {achievements.slice(0, 5).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold">{achievement.achievement?.name}</h4>
                        <p className="text-slate-400 text-sm">{achievement.achievement?.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">+{achievement.achievement?.points} XP</p>
                        <p className="text-slate-500 text-xs">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {achievementCategories.map((category) => {
                const Icon = category.icon;
                const categoryAchievements = availableAchievements.filter(
                  (a) => a.category === category.id
                );
                const earned = achievements.filter((a) =>
                  categoryAchievements.some((ca) => ca.id === a.achievement_id)
                );

                return (
                  <div key={category.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className={`w-6 h-6 text-${category.color}-400`} />
                      <h3 className="text-xl font-bold text-white">{category.name}</h3>
                      <span className="text-slate-400 text-sm">
                        ({earned.length}/{categoryAchievements.length})
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {categoryAchievements.map((achievement) => {
                        const isEarned = achievements.some((a) => a.achievement_id === achievement.id);

                        return (
                          <div
                            key={achievement.id}
                            className={`border rounded-lg p-4 ${
                              isEarned
                                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                                : 'bg-slate-900/50 border-slate-700'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isEarned
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                                    : 'bg-slate-700'
                                }`}
                              >
                                <Award className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-bold ${isEarned ? 'text-white' : 'text-slate-400'}`}>
                                  {achievement.name}
                                </h4>
                                <p className="text-slate-400 text-sm">{achievement.description}</p>
                                <p className="text-yellow-400 text-sm mt-2">+{achievement.points} XP</p>
                              </div>
                              {isEarned && (
                                <div className="text-green-400">
                                  <Award className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-4">
              {challenges.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No active challenges</p>
                  <p className="text-slate-500 text-sm mt-2">Check back soon for new challenges!</p>
                </div>
              ) : (
                challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Challenge #{challenge.challenge_id}</h3>
                        <p className="text-slate-400 text-sm">
                          Started {new Date(challenge.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        {challenge.status}
                      </span>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-slate-300 mb-2">Progress</p>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                          style={{ width: '45%' }}
                        ></div>
                      </div>
                      <p className="text-slate-500 text-xs mt-2">45% complete</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
