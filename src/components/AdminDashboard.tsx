import { useState, useEffect } from 'react';
import { X, Users, DollarSign, TrendingUp, Activity, AlertCircle, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import UsersManagement from './admin/UsersManagement';
import SupportManagement from './admin/SupportManagement';
import AnalyticsManagement from './admin/AnalyticsManagement';
import InternalAnalytics from './admin/InternalAnalytics';
import Admin2FAEnforcement from './Admin2FAEnforcement';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'support' | 'analytics' | 'internal_analytics'>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    openTickets: 0,
    activeUsers24h: 0,
    trialUsers: 0
  });
  const [tickets, setTickets] = useState<Array<{id: string; status: string; subject?: string; category?: string; [key: string]: unknown}>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{id: string; action?: string; created_at?: string; [key: string]: unknown}>>([]);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setIsAdmin(true);
        await fetchAdminData();
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [
        { count: totalUsers },
        { data: subscriptions },
        { data: support },
        { data: activity }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('*'),
        supabase.from('support_tickets').select('*').eq('status', 'open'),
        supabase.from('user_activity_logs').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active' || s.status === 'trial').length || 0;
      const trialUsers = subscriptions?.filter(s => s.status === 'trial').length || 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeSubscriptions,
        monthlyRevenue: activeSubscriptions * 75,
        openTickets: support?.length || 0,
        activeUsers24h: Math.floor((totalUsers || 0) * 0.3),
        trialUsers
      });

      setTickets(support || []);
      setRecentActivity(activity || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-300 mt-4">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-2xl p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-2">Access Denied</h2>
          <p className="text-slate-400 text-center mb-6">
            You do not have permission to access the admin dashboard.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b border-slate-700 px-6">
          <div className="flex gap-4 overflow-x-auto">
            {(['overview', 'users', 'support', 'analytics', 'internal_analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 font-semibold border-b-2 transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Admin2FAEnforcement />

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <Users className="w-10 h-10 text-blue-400 mb-3" />
                  <p className="text-3xl font-black text-white mb-1">{stats.totalUsers}</p>
                  <p className="text-slate-400">Total Users</p>
                  <p className="text-green-400 text-sm mt-2">
                    +{stats.activeUsers24h} active in 24h
                  </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <TrendingUp className="w-10 h-10 text-green-400 mb-3" />
                  <p className="text-3xl font-black text-white mb-1">{stats.activeSubscriptions}</p>
                  <p className="text-slate-400">Active Subscriptions</p>
                  <p className="text-yellow-400 text-sm mt-2">
                    {stats.trialUsers} on trial
                  </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <DollarSign className="w-10 h-10 text-green-400 mb-3" />
                  <p className="text-3xl font-black text-white mb-1">${stats.monthlyRevenue}</p>
                  <p className="text-slate-400">Monthly Recurring Revenue</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-purple-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-white">{activity.action}</p>
                          <p className="text-slate-400 text-xs">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                    Support Tickets
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-400">{stats.openTickets}</p>
                      <p className="text-slate-400 text-sm">Open</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {tickets.slice(0, 3).map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-slate-900/50 border border-slate-700 rounded p-2 text-xs"
                        >
                          <p className="text-white font-medium truncate">{ticket.subject}</p>
                          <p className="text-slate-400">{ticket.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && <UsersManagement />}

          {activeTab === 'support' && <SupportManagement />}

          {activeTab === 'analytics' && <AnalyticsManagement />}

          {activeTab === 'internal_analytics' && <InternalAnalytics />}
        </div>
      </div>
    </div>
  );
}
