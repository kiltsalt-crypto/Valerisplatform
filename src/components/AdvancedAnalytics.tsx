import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingDown, Clock, Target, Activity, Zap } from 'lucide-react';

interface TimeData {
  time_value: string;
  total_trades: number;
  win_rate: number;
  avg_pnl: number;
}

interface DrawdownPeriod {
  start_date: string;
  peak_balance: number;
  trough_balance: number;
  drawdown_percentage: number;
  is_active: boolean;
}

export default function AdvancedAnalytics() {
  const { profile } = useAuth();
  const [timeAnalysis, setTimeAnalysis] = useState<TimeData[]>([]);
  const [drawdowns, setDrawdowns] = useState<DrawdownPeriod[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data: hourData } = await supabase
      .from('time_analysis')
      .select('*')
      .eq('user_id', profile?.id)
      .eq('analysis_type', 'hour_of_day')
      .order('avg_pnl', { ascending: false })
      .limit(10);

    const { data: drawdownData } = await supabase
      .from('drawdown_periods')
      .select('*')
      .eq('user_id', profile?.id)
      .order('start_date', { ascending: false })
      .limit(5);

    const { data: metricsData } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', profile?.id)
      .eq('period_type', 'monthly')
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (hourData) setTimeAnalysis(hourData);
    if (drawdownData) setDrawdowns(drawdownData);
    if (metricsData) setMetrics(metricsData);
  };

  const generateHeatMap = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const maxPnl = Math.max(...timeAnalysis.map(t => t.avg_pnl));

    return (
      <div className="grid grid-cols-12 gap-1">
        {hours.map(hour => {
          const data = timeAnalysis.find(t => parseInt(t.time_value) === hour);
          const intensity = data ? (data.avg_pnl / maxPnl) : 0;
          const color = intensity > 0
            ? `rgba(34, 197, 94, ${Math.abs(intensity)})`
            : `rgba(239, 68, 68, ${Math.abs(intensity)})`;

          return (
            <div
              key={hour}
              className="aspect-square rounded text-xs flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: color || 'rgba(51, 65, 85, 0.5)' }}
              title={`${hour}:00 - ${data?.total_trades || 0} trades`}
            >
              {hour}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-purple-400" />
          Advanced Analytics
        </h1>
        <p className="text-slate-400 text-sm">Deep dive into your trading performance</p>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-400" />
              <p className="text-slate-400 text-xs">Sharpe Ratio</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.sharpe_ratio?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-purple-400" />
              <p className="text-slate-400 text-xs">Profit Factor</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.profit_factor?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <p className="text-slate-400 text-xs">Win Streak</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.max_consecutive_wins || 0}</p>
          </div>

          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <p className="text-slate-400 text-xs">Max Drawdown</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{metrics.max_drawdown?.toFixed(2)}%</p>
          </div>
        </div>
      )}

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold">Performance Heat Map by Hour</h2>
        </div>
        {generateHeatMap()}
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Midnight</span>
          <span>Noon</span>
          <span>Evening</span>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-400" />
          <h2 className="text-white font-semibold">Drawdown History</h2>
        </div>
        <div className="space-y-2">
          {drawdowns.map((dd, idx) => (
            <div key={idx} className="bg-slate-800/50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-semibold ${dd.is_active ? 'text-red-400' : 'text-slate-300'}`}>
                  {dd.is_active ? 'Active Drawdown' : 'Recovered'}
                </span>
                <span className="text-red-400 font-bold">{dd.drawdown_percentage.toFixed(2)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Peak Balance</p>
                  <p className="text-white">${dd.peak_balance.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Lowest Point</p>
                  <p className="text-white">${dd.trough_balance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <h2 className="text-white font-semibold mb-3">Best Trading Times</h2>
        <div className="space-y-2">
          {timeAnalysis.slice(0, 5).map((time, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-800/50 p-2 rounded">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold text-sm">{time.time_value}:00</span>
                <span className="text-slate-400 text-xs">{time.total_trades} trades</span>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${time.avg_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${time.avg_pnl.toFixed(2)} avg
                </p>
                <p className="text-xs text-slate-400">{time.win_rate.toFixed(1)}% WR</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
