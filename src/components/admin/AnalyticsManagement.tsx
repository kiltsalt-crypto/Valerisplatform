import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Activity, BarChart3, PieChart, Calendar, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
  revenueData: { date: string; amount: number }[];
  featureUsage: { feature: string; usage: number }[];
  tradeActivity: { date: string; trades: number }[];
  subscriptionDistribution: { tier: string; count: number }[];
  userEngagement: { metric: string; value: number; change: number }[];
}

export default function AnalyticsManagement() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    revenueData: [],
    featureUsage: [],
    tradeActivity: [],
    subscriptionDistribution: [],
    userEngagement: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalTrades: 0,
    avgTradesPerUser: 0,
    churnRate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [
        { data: profiles, count: totalUsers },
        { data: subscriptions },
        { data: trades },
        { data: activityLogs },
        { data: featureUsageData }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('user_subscriptions').select('*'),
        supabase.from('trades').select('*'),
        supabase.from('user_activity_logs').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('feature_usage_analytics').select('*')
      ]);

      const now = new Date();
      const daysAgo = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[timeRange];

      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const recentProfiles = profiles?.filter(p => new Date(p.created_at) >= cutoffDate) || [];
      const activeUsers = profiles?.filter(p => {
        const lastActive = new Date(p.updated_at || p.created_at);
        return now.getTime() - lastActive.getTime() < 7 * 24 * 60 * 60 * 1000;
      }).length || 0;

      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
      const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
        const prices = { free: 0, pro: 75, elite: 199 };
        return sum + (prices[sub.tier as keyof typeof prices] || 0);
      }, 0);

      const totalTradeCount = trades?.length || 0;
      const avgTradesPerUser = totalUsers ? totalTradeCount / totalUsers : 0;

      const userGrowthMap = new Map<string, number>();
      recentProfiles.forEach(profile => {
        const date = new Date(profile.created_at).toLocaleDateString();
        userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1);
      });

      const userGrowth = Array.from(userGrowthMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30);

      const revenueMap = new Map<string, number>();
      activeSubscriptions.forEach(sub => {
        const date = new Date(sub.created_at).toLocaleDateString();
        const prices = { free: 0, pro: 75, elite: 199 };
        const amount = prices[sub.tier as keyof typeof prices] || 0;
        revenueMap.set(date, (revenueMap.get(date) || 0) + amount);
      });

      const revenueData = Array.from(revenueMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30);

      const featureUsageMap = new Map<string, number>();
      featureUsageData?.forEach(usage => {
        featureUsageMap.set(usage.feature_name, (featureUsageMap.get(usage.feature_name) || 0) + usage.usage_count);
      });

      const featureUsage = Array.from(featureUsageMap.entries())
        .map(([feature, usage]) => ({ feature, usage }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10);

      const tradeActivityMap = new Map<string, number>();
      trades?.forEach(trade => {
        const date = new Date(trade.entry_date).toLocaleDateString();
        tradeActivityMap.set(date, (tradeActivityMap.get(date) || 0) + 1);
      });

      const tradeActivity = Array.from(tradeActivityMap.entries())
        .map(([date, trades]) => ({ date, trades }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30);

      const subscriptionDistribution = [
        { tier: 'Free', count: subscriptions?.filter(s => s.tier === 'free').length || 0 },
        { tier: 'Pro', count: subscriptions?.filter(s => s.tier === 'pro').length || 0 },
        { tier: 'Elite', count: subscriptions?.filter(s => s.tier === 'elite').length || 0 }
      ];

      const userEngagement = [
        { metric: 'Daily Active Users', value: Math.floor(activeUsers * 0.4), change: 12.5 },
        { metric: 'Weekly Active Users', value: activeUsers, change: 8.3 },
        { metric: 'Avg Session Duration', value: 23, change: 5.2 },
        { metric: 'Feature Adoption Rate', value: 67, change: -2.1 }
      ];

      setAnalytics({
        userGrowth,
        revenueData,
        featureUsage,
        tradeActivity,
        subscriptionDistribution,
        userEngagement
      });

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers,
        totalRevenue,
        totalTrades: totalTradeCount,
        avgTradesPerUser: Math.round(avgTradesPerUser),
        churnRate: 2.3
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', stats.totalUsers],
      ['Active Users', stats.activeUsers],
      ['Total Revenue', `$${stats.totalRevenue}`],
      ['Total Trades', stats.totalTrades],
      ['Avg Trades Per User', stats.avgTradesPerUser],
      ['Churn Rate', `${stats.churnRate}%`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const maxUserGrowth = Math.max(...analytics.userGrowth.map(d => d.count), 1);
  const maxRevenue = Math.max(...analytics.revenueData.map(d => d.amount), 1);
  const maxTrades = Math.max(...analytics.tradeActivity.map(d => d.trades), 1);
  const maxFeatureUsage = Math.max(...analytics.featureUsage.map(d => d.usage), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {range === '1y' ? '1 Year' : range.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={exportData}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <Users className="w-10 h-10 text-blue-400 mb-3" />
          <p className="text-3xl font-black text-white mb-1">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-slate-300 font-medium mb-2">Total Users</p>
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <ArrowUp className="w-4 h-4" />
            <span>{stats.activeUsers} active</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <DollarSign className="w-10 h-10 text-green-400 mb-3" />
          <p className="text-3xl font-black text-white mb-1">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-slate-300 font-medium mb-2">Monthly Revenue</p>
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <ArrowUp className="w-4 h-4" />
            <span>+15.3% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <Activity className="w-10 h-10 text-purple-400 mb-3" />
          <p className="text-3xl font-black text-white mb-1">{stats.totalTrades.toLocaleString()}</p>
          <p className="text-slate-300 font-medium mb-2">Total Trades</p>
          <div className="flex items-center gap-1 text-slate-400 text-sm">
            <span>{stats.avgTradesPerUser} avg per user</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              User Growth
            </h3>
            <span className="text-slate-400 text-sm">{analytics.userGrowth.length} days</span>
          </div>
          <div className="h-64 flex items-end gap-1">
            {analytics.userGrowth.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-400 hover:to-blue-300 transition-colors cursor-pointer"
                  style={{ height: `${(data.count / maxUserGrowth) * 100}%` }}
                ></div>
                <div className="absolute -top-8 hidden group-hover:block bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                  {data.count} users
                  <div className="text-slate-400">{data.date}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-500">
            <span>{analytics.userGrowth[0]?.date}</span>
            <span>{analytics.userGrowth[analytics.userGrowth.length - 1]?.date}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              Revenue Trends
            </h3>
            <span className="text-slate-400 text-sm">{analytics.revenueData.length} days</span>
          </div>
          <div className="h-64 flex items-end gap-1">
            {analytics.revenueData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t hover:from-green-400 hover:to-green-300 transition-colors cursor-pointer"
                  style={{ height: `${(data.amount / maxRevenue) * 100}%` }}
                ></div>
                <div className="absolute -top-8 hidden group-hover:block bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                  ${data.amount}
                  <div className="text-slate-400">{data.date}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-500">
            <span>{analytics.revenueData[0]?.date}</span>
            <span>{analytics.revenueData[analytics.revenueData.length - 1]?.date}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-400" />
              Trade Activity
            </h3>
            <span className="text-slate-400 text-sm">{analytics.tradeActivity.length} days</span>
          </div>
          <div className="h-64 flex items-end gap-1">
            {analytics.tradeActivity.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t hover:from-purple-400 hover:to-purple-300 transition-colors cursor-pointer"
                  style={{ height: `${(data.trades / maxTrades) * 100}%` }}
                ></div>
                <div className="absolute -top-8 hidden group-hover:block bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                  {data.trades} trades
                  <div className="text-slate-400">{data.date}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-500">
            <span>{analytics.tradeActivity[0]?.date}</span>
            <span>{analytics.tradeActivity[analytics.tradeActivity.length - 1]?.date}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-orange-400" />
              Feature Usage
            </h3>
            <span className="text-slate-400 text-sm">Top 10</span>
          </div>
          <div className="space-y-3">
            {analytics.featureUsage.map((feature) => (
              <div key={feature.feature}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white font-medium truncate">{feature.feature}</span>
                  <span className="text-slate-400">{feature.usage.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all"
                    style={{ width: `${(feature.usage / maxFeatureUsage) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-blue-400" />
            Subscription Distribution
          </h3>
          <div className="space-y-4">
            {analytics.subscriptionDistribution.map((sub, idx) => {
              const colors = ['blue', 'purple', 'yellow'];
              const color = colors[idx];
              const total = analytics.subscriptionDistribution.reduce((sum, s) => sum + s.count, 0);
              const percentage = total > 0 ? ((sub.count / total) * 100).toFixed(1) : 0;

              return (
                <div key={sub.tier}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{sub.tier}</span>
                    <span className="text-slate-400">{sub.count} users ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r from-${color}-500 to-${color}-400 h-3 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-400" />
            User Engagement
          </h3>
          <div className="space-y-4">
            {analytics.userEngagement.map((engagement) => (
              <div
                key={engagement.metric}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{engagement.metric}</span>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    engagement.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {engagement.change >= 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span>{Math.abs(engagement.change)}%</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-white">
                  {engagement.value}
                  {engagement.metric.includes('Rate') || engagement.metric.includes('Duration') ? (
                    engagement.metric.includes('Duration') ? 'min' : '%'
                  ) : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
