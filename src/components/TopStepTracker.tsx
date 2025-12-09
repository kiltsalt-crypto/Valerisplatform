import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign, Calendar } from 'lucide-react';

interface EvaluationStats {
  currentBalance: number;
  startingBalance: number;
  profitTarget: number;
  maxDrawdown: number;
  dailyLossLimit: number;
  daysTraded: number;
  targetDays: number;
  violationsCount: number;
}

export default function TopStepTracker() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EvaluationStats>({
    currentBalance: 100000,
    startingBalance: 100000,
    profitTarget: 103000,
    maxDrawdown: 97000,
    dailyLossLimit: 98000,
    daysTraded: 0,
    targetDays: 15,
    violationsCount: 0
  });

  const [todayPnL, setTodayPnL] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEvaluationData();
    }
  }, [user]);

  const fetchEvaluationData = async () => {
    try {
      const { data: performanceData, error } = await supabase
        .from('performance_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('trade_date', { ascending: false });

      if (error) throw error;

      if (performanceData && performanceData.length > 0) {
        const totalProfit = performanceData.reduce((sum, day) => sum + (day.pnl || 0), 0);
        const today = new Date().toISOString().split('T')[0];
        const todayData = performanceData.find(d => d.trade_date === today);

        setTotalPnL(totalProfit);
        setTodayPnL(todayData?.pnl || 0);
        setStats(prev => ({
          ...prev,
          currentBalance: prev.startingBalance + totalProfit,
          daysTraded: performanceData.length
        }));
      }
    } catch (error) {
      console.error('Error fetching evaluation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const progressToTarget = ((stats.currentBalance - stats.startingBalance) / (stats.profitTarget - stats.startingBalance)) * 100;
  const daysProgress = (stats.daysTraded / stats.targetDays) * 100;
  const drawdownUsed = ((stats.startingBalance - stats.currentBalance) / (stats.startingBalance - stats.maxDrawdown)) * 100;
  const dailyLossUsed = ((stats.startingBalance - (stats.startingBalance + todayPnL)) / (stats.startingBalance - stats.dailyLossLimit)) * 100;

  const isPassingEvaluation = stats.currentBalance >= stats.profitTarget && stats.daysTraded >= stats.targetDays && stats.violationsCount === 0;
  const hasViolation = stats.currentBalance <= stats.maxDrawdown || (stats.startingBalance + todayPnL) <= stats.dailyLossLimit;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-400" />
          TopStep Evaluation Tracker
        </h2>
        <p className="text-slate-400 mt-1">Monitor your progress towards funded account</p>
      </div>

      {isPassingEvaluation && (
        <div className="bg-green-500/10 border-2 border-green-500 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-xl font-bold text-green-400">Evaluation Passed!</h3>
              <p className="text-green-300">You've met all requirements for a funded account</p>
            </div>
          </div>
        </div>
      )}

      {hasViolation && (
        <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <div>
              <h3 className="text-xl font-bold text-red-400">Rule Violation Detected</h3>
              <p className="text-red-300">You've exceeded the maximum drawdown or daily loss limit</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Current Balance</span>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            ${stats.currentBalance.toLocaleString()}
          </div>
          <div className={`text-sm mt-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL >= 0 ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />} ${Math.abs(totalPnL).toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Today's P&L</span>
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div className={`text-3xl font-bold ${todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {todayPnL >= 0 ? '+' : ''}${todayPnL.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            Daily Limit: ${stats.dailyLossLimit.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Profit Target</span>
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            ${stats.profitTarget.toLocaleString()}
          </div>
          <div className="text-sm text-green-400 mt-1">
            ${(stats.profitTarget - stats.currentBalance).toLocaleString()} to go
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Days Traded</span>
            <Calendar className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {stats.daysTraded} / {stats.targetDays}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            {stats.targetDays - stats.daysTraded} days remaining
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Profit Target Progress
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Progress</span>
              <span>{Math.max(0, Math.min(100, progressToTarget)).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  progressToTarget >= 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, progressToTarget))}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Starting</p>
                <p className="text-white font-semibold">${stats.startingBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Current</p>
                <p className="text-white font-semibold">${stats.currentBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Target</p>
                <p className="text-white font-semibold">${stats.profitTarget.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            Max Drawdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Drawdown Used</span>
              <span>{Math.max(0, drawdownUsed).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  drawdownUsed >= 100 ? 'bg-red-500' : drawdownUsed >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, drawdownUsed))}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Max Allowed</p>
                <p className="text-white font-semibold">${stats.maxDrawdown.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Buffer</p>
                <p className="text-white font-semibold">${(stats.currentBalance - stats.maxDrawdown).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Evaluation Requirements</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border-2 ${
            stats.currentBalance >= stats.profitTarget ? 'border-green-500 bg-green-500/10' : 'border-slate-600'
          }`}>
            <div className="flex items-center gap-3">
              {stats.currentBalance >= stats.profitTarget ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-500" />
              )}
              <div>
                <p className="font-semibold text-white">Reach Profit Target</p>
                <p className="text-sm text-slate-400">${(stats.profitTarget - stats.startingBalance).toLocaleString()} profit</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${
            stats.daysTraded >= stats.targetDays ? 'border-green-500 bg-green-500/10' : 'border-slate-600'
          }`}>
            <div className="flex items-center gap-3">
              {stats.daysTraded >= stats.targetDays ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-500" />
              )}
              <div>
                <p className="font-semibold text-white">Complete Trading Days</p>
                <p className="text-sm text-slate-400">{stats.targetDays} days minimum</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${
            stats.currentBalance > stats.maxDrawdown ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
          }`}>
            <div className="flex items-center gap-3">
              {stats.currentBalance > stats.maxDrawdown ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <p className="font-semibold text-white">Stay Above Max Drawdown</p>
                <p className="text-sm text-slate-400">${stats.maxDrawdown.toLocaleString()} minimum</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${
            (stats.startingBalance + todayPnL) > stats.dailyLossLimit ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
          }`}>
            <div className="flex items-center gap-3">
              {(stats.startingBalance + todayPnL) > stats.dailyLossLimit ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <p className="font-semibold text-white">Respect Daily Loss Limit</p>
                <p className="text-sm text-slate-400">$2,000 max loss per day</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
