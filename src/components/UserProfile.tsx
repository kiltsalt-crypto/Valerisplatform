import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Save, Bell, Globe, TrendingUp, Award } from 'lucide-react';

export default function UserProfile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    username: '',
    trading_experience: 'beginner',
    preferred_instruments: [] as string[],
    timezone: 'America/New_York',
    notification_preferences: {
      email: true,
      push: true,
      news: true
    }
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        username: profile.username || '',
        trading_experience: profile.trading_experience || 'beginner',
        preferred_instruments: profile.preferred_instruments || [],
        timezone: profile.timezone || 'America/New_York',
        notification_preferences: profile.notification_preferences || { email: true, push: true, news: true }
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profileData.display_name,
          bio: profileData.bio,
          username: profileData.username,
          trading_experience: profileData.trading_experience,
          preferred_instruments: profileData.preferred_instruments,
          timezone: profileData.timezone,
          notification_preferences: profileData.notification_preferences
        })
        .eq('id', profile?.id);

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInstrument = (instrument: string) => {
    setProfileData(prev => ({
      ...prev,
      preferred_instruments: prev.preferred_instruments.includes(instrument)
        ? prev.preferred_instruments.filter(i => i !== instrument)
        : [...prev.preferred_instruments, instrument]
    }));
  };

  const instruments = ['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'SI', 'NG', 'ZB', 'ZN'];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <User className="w-7 h-7 text-purple-400" />
          User Profile
        </h1>
        <p className="text-slate-400 text-sm">Manage your account settings and preferences</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {profileData.display_name?.[0]?.toUpperCase() || profileData.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{profileData.display_name || profileData.username}</h2>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Display Name</label>
                <input
                  type="text"
                  value={profileData.display_name}
                  onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                  placeholder="Your display name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  placeholder="username"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-slate-400 text-sm mb-2 block">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Tell us about your trading journey..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Trading Preferences
            </h3>

            <div className="mb-4">
              <label className="text-slate-400 text-sm mb-2 block">Experience Level</label>
              <select
                value={profileData.trading_experience}
                onChange={(e) => setProfileData({ ...profileData, trading_experience: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Preferred Instruments</label>
              <div className="grid grid-cols-5 gap-2">
                {instruments.map(instrument => (
                  <button
                    key={instrument}
                    onClick={() => toggleInstrument(instrument)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      profileData.preferred_instruments.includes(instrument)
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {instrument}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Regional Settings
            </h3>
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Timezone</label>
              <select
                value={profileData.timezone}
                onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              Notification Preferences
            </h3>
            <div className="space-y-3">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                { key: 'news', label: 'Market News Alerts', desc: 'Important market events' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                  <div>
                    <p className="text-white font-semibold text-sm">{label}</p>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                  <button
                    onClick={() => setProfileData({
                      ...profileData,
                      notification_preferences: {
                        ...profileData.notification_preferences,
                        [key]: !profileData.notification_preferences[key as keyof typeof profileData.notification_preferences]
                      }
                    })}
                    className={`relative w-12 h-6 rounded-full transition ${
                      profileData.notification_preferences[key as keyof typeof profileData.notification_preferences]
                        ? 'bg-purple-500'
                        : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      profileData.notification_preferences[key as keyof typeof profileData.notification_preferences]
                        ? 'translate-x-6'
                        : ''
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition disabled:opacity-50 font-semibold"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span className="text-green-400 text-sm flex items-center gap-1">
                <Award className="w-4 h-4" />
                Profile updated successfully!
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-3">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400 text-xs mb-1">Total Trades</p>
            <p className="text-white text-2xl font-bold">{profile?.total_trades || 0}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400 text-xs mb-1">Win Rate</p>
            <p className="text-white text-2xl font-bold">{profile?.win_rate?.toFixed(1) || 0}%</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400 text-xs mb-1">Total P&L</p>
            <p className={`text-2xl font-bold ${(profile?.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${profile?.total_pnl?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400 text-xs mb-1">Member Since</p>
            <p className="text-white text-sm font-bold">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
