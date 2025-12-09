import { useState, useEffect } from 'react';
import { Search, User, Crown, Shield, Ban, CheckCircle, Mail, Calendar, Filter, ChevronDown, Edit, Trash2, MoreVertical, Key, Lock, Unlock, AlertTriangle, Activity, DollarSign, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  subscription_tier: string | null;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  current_capital: number;
  starting_capital: number;
  is_admin: boolean;
  is_mentor: boolean;
  avatar_url: string | null;
  bio: string | null;
  updated_at: string;
  subscription?: {
    status: string;
    tier: string;
    expires_at: string;
    current_period_start: string;
    current_period_end: string;
  }[];
  admin_role?: {
    role: string;
  }[];
  auth_user?: {
    last_sign_in_at: string;
    email_confirmed_at: string;
    banned_until: string | null;
    is_sso_user: boolean;
  }[];
  mentor_profile?: {
    title: string;
    hourly_rate: number;
    available: boolean;
  }[];
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user' | 'mentor'>('all');
  const [filterSubscription, setFilterSubscription] = useState<'all' | 'free' | 'pro' | 'elite'>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          subscription:user_subscriptions(*),
          admin_role:admin_users(role),
          mentor_profile:mentor_profiles(title, hourly_rate, available)
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

      const enrichedUsers = profilesData?.map(profile => {
        const authUser = authUsers?.find(u => u.id === profile.id);
        return {
          ...profile,
          auth_user: authUser ? [{
            last_sign_in_at: authUser.last_sign_in_at || '',
            email_confirmed_at: authUser.email_confirmed_at || '',
            banned_until: authUser.banned_until || null,
            is_sso_user: !!authUser.app_metadata.provider
          }] : []
        };
      });

      setUsers(enrichedUsers || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === 'all' ||
      (filterRole === 'admin' && user.admin_role && user.admin_role.length > 0) ||
      (filterRole === 'mentor' && user.is_mentor) ||
      (filterRole === 'user' && (!user.admin_role || user.admin_role.length === 0) && !user.is_mentor);

    const userTier = user.subscription?.[0]?.tier || 'free';
    const matchesSubscription =
      filterSubscription === 'all' || userTier === filterSubscription;

    return matchesSearch && matchesRole && matchesSubscription;
  });

  const toggleAdminStatus = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        await supabase.from('admin_users').delete().eq('user_id', userId);
      } else {
        await supabase.from('admin_users').insert({
          user_id: userId,
          role: 'support',
          permissions: { canViewUsers: true, canManageTickets: true }
        });
      }
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const toggleMentorStatus = async (userId: string, isCurrentlyMentor: boolean, userFullName: string) => {
    try {
      if (isCurrentlyMentor) {
        await supabase.from('profiles').update({ is_mentor: false }).eq('id', userId);
        await supabase.from('mentor_profiles').delete().eq('user_id', userId);
      } else {
        await supabase.from('profiles').update({ is_mentor: true }).eq('id', userId);
        await supabase.from('mentor_profiles').insert({
          user_id: userId,
          title: 'Trading Mentor',
          bio: '',
          years_experience: 0,
          specialties: [],
          hourly_rate: 80.00,
          available: true
        });
      }
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling mentor status:', error);
    }
  };

  const updateSubscription = async (userId: string, tier: string) => {
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_subscriptions')
          .update({ tier, status: 'active', expires_at: expiresAt.toISOString() })
          .eq('user_id', userId);
      } else {
        await supabase.from('user_subscriptions').insert({
          user_id: userId,
          tier,
          status: 'active',
          expires_at: expiresAt.toISOString()
        });
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('profiles').delete().eq('id', userId);
      await fetchUsers();
      setShowUserModal(false);
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const resetPassword = async (userId: string, email: string) => {
    if (!confirm(`Send password reset email to ${email}?`)) {
      return;
    }

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      alert('Password reset email sent successfully!');
    } catch (error) {
      console.error('Error sending password reset:', error);
      alert('Error sending password reset email. Please try again.');
    }
  };

  const toggleAccountLock = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'unlock' : 'lock';
    if (!confirm(`Are you sure you want to ${action} this account?`)) {
      return;
    }

    try {
      if (currentlyBanned) {
        await supabase.auth.admin.updateUserById(userId, {
          ban_duration: 'none'
        });
      } else {
        const banUntil = new Date();
        banUntil.setFullYear(banUntil.getFullYear() + 10);
        await supabase.auth.admin.updateUserById(userId, {
          ban_duration: banUntil.toISOString()
        });
      }
      await fetchUsers();
      alert(`Account ${action}ed successfully!`);
    } catch (error) {
      console.error('Error toggling account lock:', error);
      alert(`Error ${action}ing account. Please try again.`);
    }
  };

  const sendVerificationEmail = async (email: string) => {
    if (!confirm(`Send verification email to ${email}?`)) {
      return;
    }

    try {
      await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      alert('Verification email sent successfully!');
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Error sending verification email. Please try again.');
    }
  };

  const getWinRate = (user: UserData) => {
    if (user.total_trades === 0) return 0;
    return ((user.winning_trades / user.total_trades) * 100).toFixed(1);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'trial': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'canceled': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="mentor">Mentors</option>
            <option value="user">Users</option>
          </select>

          <select
            value={filterSubscription}
            onChange={(e) => setFilterSubscription(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="elite">Elite</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">User</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Role</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Subscription</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Trading Stats</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Last Login</th>
                <th className="text-right px-4 py-3 text-slate-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-700 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {(user.full_name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium flex items-center gap-2">
                          {user.full_name || 'Unknown'}
                          {user.admin_role && user.admin_role.length > 0 && (
                            <Crown className="w-4 h-4 text-yellow-400" />
                          )}
                        </p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {user.auth_user?.[0]?.banned_until ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/30">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    ) : user.auth_user?.[0]?.email_confirmed_at ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/30">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 text-xs font-semibold border border-yellow-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {user.admin_role && user.admin_role.length > 0 ? (
                      <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/30">
                        {user.admin_role[0].role}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-slate-500/10 text-slate-400 text-xs font-semibold">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(user.subscription?.[0]?.status)}`}>
                        {user.subscription?.[0]?.tier || 'free'}
                      </span>
                      {user.subscription?.[0]?.expires_at && (
                        <p className="text-slate-500 text-xs mt-1">
                          Expires {new Date(user.subscription[0].expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <p className="text-white">
                        {user.total_trades} trades
                      </p>
                      <p className="text-slate-400">
                        {getWinRate(user)}% win rate
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-400 text-sm">
                    {user.auth_user?.[0]?.last_sign_in_at
                      ? new Date(user.auth_user[0].last_sign_in_at).toLocaleDateString() + ' ' +
                        new Date(user.auth_user[0].last_sign_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Never'
                    }
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-2 hover:bg-slate-700 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No users found</p>
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
          <button
            onClick={fetchUsers}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {(selectedUser.full_name || selectedUser.email)[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-white flex items-center gap-2">
                    {selectedUser.full_name || 'Unknown'}
                    {selectedUser.auth_user?.[0]?.banned_until && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                        LOCKED
                      </span>
                    )}
                  </h4>
                  <p className="text-slate-400">{selectedUser.email}</p>
                  <p className="text-slate-500 text-sm">ID: {selectedUser.id}</p>
                  <div className="flex gap-2 mt-2">
                    {selectedUser.auth_user?.[0]?.email_confirmed_at ? (
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Email Verified
                      </span>
                    ) : (
                      <span className="text-yellow-400 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Email Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <p className="text-slate-400 text-xs">Total Trades</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedUser.total_trades}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <p className="text-slate-400 text-xs">Win Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{getWinRate(selectedUser)}%</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-purple-400" />
                    <p className="text-slate-400 text-xs">Current Capital</p>
                  </div>
                  <p className="text-xl font-bold text-white">${selectedUser.current_capital?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-400 text-xs">Last Login</p>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {selectedUser.auth_user?.[0]?.last_sign_in_at
                      ? new Date(selectedUser.auth_user[0].last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Account Information
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">Member Since</p>
                    <p className="text-white font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Email Confirmed</p>
                    <p className="text-white font-medium">
                      {selectedUser.auth_user?.[0]?.email_confirmed_at
                        ? new Date(selectedUser.auth_user[0].email_confirmed_at).toLocaleDateString()
                        : 'Not Verified'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Starting Capital</p>
                    <p className="text-white font-medium">${selectedUser.starting_capital?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">P&L</p>
                    <p className={`font-medium ${
                      (selectedUser.current_capital - selectedUser.starting_capital) >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      ${((selectedUser.current_capital || 0) - (selectedUser.starting_capital || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-white font-semibold flex items-center gap-2">
                  <Key className="w-5 h-5 text-yellow-400" />
                  Security Controls
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => resetPassword(selectedUser.id, selectedUser.email)}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg font-semibold transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    Reset Password
                  </button>

                  <button
                    onClick={() => toggleAccountLock(
                      selectedUser.id,
                      !!(selectedUser.auth_user?.[0]?.banned_until)
                    )}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold transition-colors ${
                      selectedUser.auth_user?.[0]?.banned_until
                        ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {selectedUser.auth_user?.[0]?.banned_until ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        Unlock Account
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Lock Account
                      </>
                    )}
                  </button>

                  {!selectedUser.auth_user?.[0]?.email_confirmed_at && (
                    <button
                      onClick={() => sendVerificationEmail(selectedUser.email)}
                      className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-semibold transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send Verification Email
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-white font-semibold">Subscription Management</h5>
                <div className="flex gap-2">
                  {['free', 'pro', 'elite'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => updateSubscription(selectedUser.id, tier)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold capitalize transition-colors ${
                        selectedUser.subscription?.[0]?.tier === tier
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-white font-semibold">Role Management</h5>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => toggleAdminStatus(
                      selectedUser.id,
                      !!(selectedUser.admin_role && selectedUser.admin_role.length > 0)
                    )}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      selectedUser.admin_role && selectedUser.admin_role.length > 0
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4 inline mr-2" />
                    {selectedUser.admin_role && selectedUser.admin_role.length > 0 ? 'Remove Admin' : 'Make Admin'}
                  </button>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-semibold">Mentor Status</p>
                          <p className="text-slate-400 text-xs">Allow user to appear in mentor marketplace</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleMentorStatus(
                          selectedUser.id,
                          selectedUser.is_mentor || false,
                          selectedUser.full_name || selectedUser.email
                        )}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                          selectedUser.is_mentor ? 'bg-blue-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            selectedUser.is_mentor ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {selectedUser.is_mentor && selectedUser.mentor_profile && selectedUser.mentor_profile.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <p className="text-slate-400 text-xs mb-2">Mentor Details</p>
                        <div className="space-y-1">
                          <p className="text-white text-sm">{selectedUser.mentor_profile[0].title}</p>
                          <p className="text-blue-400 text-sm font-semibold">${selectedUser.mentor_profile[0].hourly_rate}/hour</p>
                          <p className={`text-xs ${selectedUser.mentor_profile[0].available ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedUser.mentor_profile[0].available ? 'Available for sessions' : 'Unavailable'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <button
                  onClick={() => deleteUser(selectedUser.id)}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
