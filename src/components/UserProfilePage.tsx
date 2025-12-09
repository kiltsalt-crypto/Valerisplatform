import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Award, TrendingUp, Calendar, Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function UserProfilePage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    starting_capital: 100000,
    current_capital: 100000
  });
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalPnL: 0,
    winRate: 0
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        bio: profile.bio || '',
        starting_capital: Number(profile.starting_capital) || 100000,
        current_capital: Number(profile.current_capital) || 100000
      });
      fetchUserStats();
    }
  }, [profile, user]);

  const fetchUserStats = async () => {
    if (!user?.id) return;

    try {
      const { data: trades, error } = await supabase
        .from('trades')
        .select('profit_loss')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching trades:', error);
        return;
      }

      if (trades) {
        const totalPnL = trades.reduce((sum, trade) => sum + (Number(trade.profit_loss) || 0), 0);
        const winning = trades.filter(t => (Number(t.profit_loss) || 0) > 0).length;
        const losing = trades.filter(t => (Number(t.profit_loss) || 0) < 0).length;
        const winRate = trades.length > 0 ? (winning / trades.length) * 100 : 0;

        setStats({
          totalTrades: trades.length,
          winningTrades: winning,
          losingTrades: losing,
          totalPnL,
          winRate
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          bio: formData.bio,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();
      setSuccess(true);
      setEditing(false);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = formData.full_name || profile?.full_name || 'User';
  const displayEmail = formData.email || profile?.email || user?.email || '';

  if (authLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold">Not Authenticated</p>
            <p className="text-red-300 text-sm">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <User className="w-8 h-8 text-blue-400" />
          User Profile
        </h2>
        <p className="text-slate-400 mt-1">Manage your account and view your trading statistics</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-400 font-semibold">Success</p>
            <p className="text-green-300 text-sm">Your profile has been updated successfully!</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{displayName}</h3>
            <p className="text-slate-400 text-sm mb-4">{displayEmail}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-4">
              <Calendar className="w-4 h-4" />
              Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
            </div>
            {profile?.is_admin && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500 rounded-full text-purple-400 text-sm font-semibold">
                <Award className="w-4 h-4" />
                Admin
              </div>
            )}
            <button
              onClick={() => {
                setEditing(!editing);
                setError(null);
                setSuccess(false);
              }}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mt-6">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Account Status
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Account Type</p>
                <p className="text-white font-semibold">Paper Trading</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Experience Level</p>
                <p className="text-white font-semibold">Intermediate</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Trades</p>
                <p className="text-white font-semibold">{stats.totalTrades}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {editing ? (
            <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Edit Profile</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Trading Statistics</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-900 rounded-xl">
                    <p className="text-slate-400 text-sm mb-1">Total Trades</p>
                    <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl">
                    <p className="text-slate-400 text-sm mb-1">Win Rate</p>
                    <p className="text-2xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</p>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl">
                    <p className="text-slate-400 text-sm mb-1">Winning</p>
                    <p className="text-2xl font-bold text-green-400">{stats.winningTrades}</p>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl">
                    <p className="text-slate-400 text-sm mb-1">Losing</p>
                    <p className="text-2xl font-bold text-red-400">{stats.losingTrades}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Portfolio Performance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900 rounded-xl">
                    <p className="text-slate-400 text-sm mb-1">Starting Capital</p>
                    <p className="text-2xl font-bold text-white">${formData.starting_capital.toLocaleString()}</p>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl">
                    <p className="text-slate-400 text-sm mb-1">Current Capital</p>
                    <p className="text-2xl font-bold text-white">${formData.current_capital.toLocaleString()}</p>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl">
                    <p className="text-slate-400 text-sm mb-1">Total P&L</p>
                    <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-400">Email</span>
                    </div>
                    <span className="text-white font-medium">{displayEmail}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-400">Full Name</span>
                    </div>
                    <span className="text-white font-medium">{displayName}</span>
                  </div>
                  {formData.bio && (
                    <div className="p-3 bg-slate-900 rounded-lg">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <span className="text-slate-400 block mb-1">Bio</span>
                          <span className="text-white">{formData.bio}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-400">Member Since</span>
                    </div>
                    <span className="text-white font-medium">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
