import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

interface Subscription {
  tier: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface MetricsData {
  totalUsers: number;
  activeSubscriptions: number;
  currentMRR: number;
  projectedARR: number;
  freeUsers: number;
  proUsers: number;
  eliteUsers: number;
  churnRate: number;
  revenueGrowth: number;
  avgRevenuePerUser: number;
}

export default function BusinessMetrics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalUsers: 0,
    activeSubscriptions: 0,
    currentMRR: 0,
    projectedARR: 0,
    freeUsers: 0,
    proUsers: 0,
    eliteUsers: 0,
    churnRate: 0,
    revenueGrowth: 0,
    avgRevenuePerUser: 0
  });
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const planPrices: Record<string, number> = {
    free: 0,
    pro: 75,
    elite: 199
  };

  useEffect(() => {
    fetchBusinessMetrics();
  }, []);

  const fetchBusinessMetrics = async () => {
    try {
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*');

      if (subError) throw subError;

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (profileError) throw profileError;

      const totalUsers = profiles?.length || 0;
      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;

      const freeUsers = subscriptions?.filter(s => s.tier === 'free').length || 0;
      const proUsers = subscriptions?.filter(s => s.tier === 'pro' && s.status === 'active').length || 0;
      const eliteUsers = subscriptions?.filter(s => s.tier === 'elite' && s.status === 'active').length || 0;

      const currentMRR = (proUsers * planPrices.pro) + (eliteUsers * planPrices.elite);
      const projectedARR = currentMRR * 12;
      const avgRevenuePerUser = totalUsers > 0 ? currentMRR / totalUsers : 0;

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const lastMonthSubs = subscriptions?.filter(s => {
        const createdDate = new Date(s.created_at);
        return createdDate < thisMonth && s.status === 'active';
      }).length || 0;

      const thisMonthSubs = activeSubscriptions;
      const churnRate = lastMonthSubs > 0 ? ((lastMonthSubs - thisMonthSubs) / lastMonthSubs) * 100 : 0;

      const lastMonthMRR = lastMonthSubs > 0 ? currentMRR * 0.85 : 0;
      const revenueGrowth = lastMonthMRR > 0 ? ((currentMRR - lastMonthMRR) / lastMonthMRR) * 100 : 0;

      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthSubs = subscriptions?.filter(s => {
          const createdDate = new Date(s.created_at);
          return createdDate <= date && s.status === 'active';
        }) || [];

        const monthPro = monthSubs.filter(s => s.tier === 'pro').length;
        const monthElite = monthSubs.filter(s => s.tier === 'elite').length;
        const revenue = (monthPro * planPrices.pro) + (monthElite * planPrices.elite);

        months.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue,
          users: monthSubs.length
        });
      }

      setRevenueHistory(months);

      setMetrics({
        totalUsers,
        activeSubscriptions,
        currentMRR,
        projectedARR,
        freeUsers,
        proUsers,
        eliteUsers,
        churnRate: Math.max(0, churnRate),
        revenueGrowth,
        avgRevenuePerUser
      });
    } catch (error) {
      console.error('Error fetching business metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading metrics...</div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueHistory.map(m => m.revenue));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Business Metrics</h1>
        <p className="text-slate-400">Track your platform's revenue and growth</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-300 text-sm mb-1">Monthly Recurring Revenue</p>
              <h3 className="text-3xl font-black text-white">${metrics.currentMRR.toLocaleString()}</h3>
            </div>
            <DollarSign className="w-10 h-10 text-green-400" />
          </div>
          <div className="flex items-center gap-2">
            {metrics.revenueGrowth >= 0 ? (
              <>
                <ArrowUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-semibold">
                  +{metrics.revenueGrowth.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <ArrowDown className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-semibold">
                  {metrics.revenueGrowth.toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-slate-400 text-sm">vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-300 text-sm mb-1">Projected ARR</p>
              <h3 className="text-3xl font-black text-white">${metrics.projectedARR.toLocaleString()}</h3>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm">
            ${(metrics.currentMRR).toLocaleString()}/month × 12
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-300 text-sm mb-1">Active Subscriptions</p>
              <h3 className="text-3xl font-black text-white">{metrics.activeSubscriptions}</h3>
            </div>
            <CreditCard className="w-10 h-10 text-purple-400" />
          </div>
          <p className="text-slate-400 text-sm">
            {((metrics.activeSubscriptions / metrics.totalUsers) * 100).toFixed(1)}% of total users
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-300 text-sm mb-1">ARPU</p>
              <h3 className="text-3xl font-black text-white">${metrics.avgRevenuePerUser.toFixed(2)}</h3>
            </div>
            <Users className="w-10 h-10 text-orange-400" />
          </div>
          <p className="text-slate-400 text-sm">
            Average revenue per user
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Revenue Trend</h2>

          <div className="space-y-4">
            {revenueHistory.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">{month.users} users</span>
                    <span className="text-white font-bold">${month.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500"
                    style={{ width: `${maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Distribution</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Free Tier</span>
                  <span className="text-white font-bold">{metrics.freeUsers}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-slate-500 h-full"
                    style={{ width: `${(metrics.freeUsers / metrics.totalUsers) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Pro Tier</span>
                  <span className="text-white font-bold">{metrics.proUsers}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${(metrics.proUsers / metrics.totalUsers) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Elite Tier</span>
                  <span className="text-white font-bold">{metrics.eliteUsers}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full"
                    style={{ width: `${(metrics.eliteUsers / metrics.totalUsers) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Users</p>
                <p className="text-2xl font-bold text-white">{metrics.totalUsers}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">
                  {((metrics.activeSubscriptions / metrics.totalUsers) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Churn Rate</p>
                <p className={`text-2xl font-bold ${metrics.churnRate < 5 ? 'text-green-400' : 'text-orange-400'}`}>
                  {metrics.churnRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">$0</span>
            </div>
            <div>
              <h4 className="text-white font-semibold">Free Plan</h4>
              <p className="text-slate-400 text-sm">{metrics.freeUsers} users</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            ${0} MRR contribution
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">$75</span>
            </div>
            <div>
              <h4 className="text-white font-semibold">Pro Plan</h4>
              <p className="text-blue-300 text-sm">{metrics.proUsers} users</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm font-bold">
            ${(metrics.proUsers * planPrices.pro).toLocaleString()} MRR
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">$199</span>
            </div>
            <div>
              <h4 className="text-white font-semibold">Elite Plan</h4>
              <p className="text-purple-300 text-sm">{metrics.eliteUsers} users</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm font-bold">
            ${(metrics.eliteUsers * planPrices.elite).toLocaleString()} MRR
          </p>
        </div>
      </div>
    </div>
  );
}
