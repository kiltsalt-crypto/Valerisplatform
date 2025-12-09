import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Calendar,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface DailyStat {
  date: string;
  total_users: number;
  new_users: number;
  active_users: number;
  total_events: number;
  trades_logged: number;
  paper_trades: number;
  revenue: number;
}

interface PopularEvent {
  event_name: string;
  event_count: number;
  unique_users: number;
}

export default function InternalAnalytics() {
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [popularEvents, setPopularEvents] = useState<PopularEvent[]>([]);
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    loadAnalytics();
  }, [selectedDays]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load daily stats for the last N days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - selectedDays);

      const { data: stats, error: statsError } = await supabase
        .from('analytics_daily_stats')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (statsError) throw statsError;
      setDailyStats(stats || []);

      // Load popular events
      const { data: events, error: eventsError } = await supabase
        .rpc('get_popular_events', { days_back: selectedDays });

      if (eventsError) throw eventsError;
      setPopularEvents(events || []);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyStats = async () => {
    try {
      const { error } = await supabase.rpc('calculate_daily_analytics');
      if (error) throw error;

      // Reload analytics after calculation
      await loadAnalytics();
      alert('Daily stats calculated successfully!');
    } catch (error) {
      console.error('Error calculating daily stats:', error);
      alert('Error calculating stats. Check console for details.');
    }
  };

  const todayStats = dailyStats[0] || {
    total_users: 0,
    new_users: 0,
    active_users: 0,
    total_events: 0,
    trades_logged: 0,
    paper_trades: 0,
    revenue: 0,
  };

  const totalRevenue = dailyStats.reduce((sum, stat) => sum + Number(stat.revenue), 0);
  const avgActiveUsers = dailyStats.length > 0
    ? Math.round(dailyStats.reduce((sum, stat) => sum + stat.active_users, 0) / dailyStats.length)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Internal Analytics</h2>
        <div className="flex gap-3">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button
            onClick={calculateDailyStats}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Calculate Today's Stats
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <Users className="w-10 h-10 text-blue-400 mb-3" />
          <p className="text-3xl font-black text-white mb-1">{todayStats.total_users}</p>
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="text-sm text-green-400 mt-2">+{todayStats.new_users} today</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <Activity className="w-10 h-10 text-green-400 mb-3" />
          <p className="text-3xl font-black text-white mb-1">{todayStats.active_users}</p>
          <p className="text-sm text-slate-400">Active Today</p>
          <p className="text-sm text-slate-400 mt-2">Avg: {avgActiveUsers}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <TrendingUp className="w-10 h-10 text-purple-400 mb-3" />
          <p className="text-3xl font-black text-white mb-1">{todayStats.total_events}</p>
          <p className="text-sm text-slate-400">Events Today</p>
          <p className="text-sm text-slate-400 mt-2">
            {dailyStats.reduce((sum, stat) => sum + stat.total_events, 0)} total
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <DollarSign className="w-10 h-10 text-yellow-400 mb-3" />
          <p className="text-3xl font-black text-white mb-1">
            ${totalRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-slate-400">Revenue ({selectedDays}d)</p>
          <p className="text-sm text-slate-400 mt-2">
            ${Number(todayStats.revenue).toFixed(2)} today
          </p>
        </div>
      </div>

      {/* Trading Activity */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Trading Activity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Journal Entries</span>
              <span className="text-2xl font-bold text-white">
                {dailyStats.reduce((sum, stat) => sum + stat.trades_logged, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Paper Trades</span>
              <span className="text-2xl font-bold text-white">
                {dailyStats.reduce((sum, stat) => sum + stat.paper_trades, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-700">
              <span className="text-slate-400">Today</span>
              <div className="text-right">
                <p className="text-sm text-slate-400">
                  {todayStats.trades_logged} entries, {todayStats.paper_trades} trades
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Growth Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">New Users ({selectedDays}d)</span>
              <span className="text-2xl font-bold text-white">
                {dailyStats.reduce((sum, stat) => sum + stat.new_users, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg Daily Active</span>
              <span className="text-2xl font-bold text-white">{avgActiveUsers}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-700">
              <span className="text-slate-400">Engagement Rate</span>
              <div className="text-right">
                <p className="text-lg font-bold text-green-400">
                  {todayStats.total_users > 0
                    ? ((todayStats.active_users / todayStats.total_users) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Events */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Popular Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3 font-semibold">Event Name</th>
                <th className="pb-3 font-semibold text-right">Total Count</th>
                <th className="pb-3 font-semibold text-right">Unique Users</th>
                <th className="pb-3 font-semibold text-right">Avg per User</th>
              </tr>
            </thead>
            <tbody>
              {popularEvents.map((event, index) => (
                <tr key={index} className="border-b border-slate-700/50">
                  <td className="py-3 text-white font-medium">{event.event_name}</td>
                  <td className="py-3 text-slate-300 text-right">{event.event_count}</td>
                  <td className="py-3 text-slate-300 text-right">{event.unique_users}</td>
                  <td className="py-3 text-slate-300 text-right">
                    {(Number(event.event_count) / Number(event.unique_users)).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Timeline */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Daily Timeline</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">New Users</th>
                <th className="pb-3 font-semibold text-right">Active Users</th>
                <th className="pb-3 font-semibold text-right">Events</th>
                <th className="pb-3 font-semibold text-right">Trades</th>
                <th className="pb-3 font-semibold text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {dailyStats.map((stat, index) => (
                <tr key={index} className="border-b border-slate-700/50">
                  <td className="py-3 text-white">{stat.date}</td>
                  <td className="py-3 text-slate-300 text-right">
                    {stat.new_users > 0 && (
                      <span className="text-green-400">+{stat.new_users}</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-300 text-right">{stat.active_users}</td>
                  <td className="py-3 text-slate-300 text-right">{stat.total_events}</td>
                  <td className="py-3 text-slate-300 text-right">
                    {stat.trades_logged + stat.paper_trades}
                  </td>
                  <td className="py-3 text-slate-300 text-right">
                    ${Number(stat.revenue).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
