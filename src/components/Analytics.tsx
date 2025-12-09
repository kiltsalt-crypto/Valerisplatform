import { useState, useEffect } from 'react';
import { supabase, Trade } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, Target, AlertCircle, Trophy, Calendar, DollarSign, CreditCard, Users, ArrowUp } from 'lucide-react';

export default function Analytics() {
  const { user, profile } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [revenueData, setRevenueData] = useState({
    currentRevenue: 0,
    projectedRevenue: 0,
    planValue: 0,
    nextBillingDate: null as Date | null
  });

  useEffect(() => {
    if (user) {
      fetchTrades();
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchTrades = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trades:', error);
      return;
    }

    setTrades(data || []);
    setLoading(false);
  };

  const fetchSubscriptionData = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setSubscription(data);

        const planPrices: Record<string, number> = {
          free: 0,
          pro: 75,
          elite: 199
        };

        const planValue = planPrices[data.tier] || 0;
        const currentRevenue = data.status === 'active' ? planValue : 0;
        const nextBillingDate = data.expires_at ? new Date(data.expires_at) : null;
        const projectedRevenue = currentRevenue * 12;

        setRevenueData({
          currentRevenue,
          projectedRevenue,
          planValue,
          nextBillingDate
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const closedTrades = trades.filter((t) => t.status === 'closed');

  const totalProfitLoss = closedTrades.reduce((sum, trade) => sum + trade.profit_loss, 0);
  const winRate = profile?.total_trades ? (profile.winning_trades / profile.total_trades) * 100 : 0;
  const avgWin = profile?.winning_trades ? closedTrades.filter(t => t.profit_loss > 0).reduce((sum, t) => sum + t.profit_loss, 0) / profile.winning_trades : 0;
  const avgLoss = profile?.losing_trades ? Math.abs(closedTrades.filter(t => t.profit_loss < 0).reduce((sum, t) => sum + t.profit_loss, 0) / profile.losing_trades) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  const accountGrowth = profile ? ((profile.current_capital - profile.starting_capital) / profile.starting_capital) * 100 : 0;
  const maxDrawdown = profile ? ((profile.worst_trade / profile.starting_capital) * 100) : 0;

  const fundedAccountTarget = 100000;
  // Available for future criteria checks
  // const dailyLossLimit = fundedAccountTarget * 0.05;
  const maxDrawdownLimit = fundedAccountTarget * 0.10;
  const currentDrawdown = profile ? (profile.starting_capital - profile.current_capital) : 0;
  // const minDaysTrading = 5;
  const minTrades = 10;

  const meetsWinRate = winRate >= 50;
  const meetsMinTrades = (profile?.total_trades || 0) >= minTrades;
  const withinDrawdownLimit = currentDrawdown <= maxDrawdownLimit;
  const positiveReturn = accountGrowth > 0;

  const passedCriteria = [meetsWinRate, meetsMinTrades, withinDrawdownLimit, positiveReturn].filter(Boolean).length;
  const totalCriteria = 4;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Performance Analytics</h1>
        <p className="text-slate-400">Track your trading progress and subscription value</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Total P/L</div>
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)}
          </div>
          <div className="text-slate-400 text-sm mt-1">
            {accountGrowth >= 0 ? '+' : ''}{accountGrowth.toFixed(2)}% growth
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Win Rate</div>
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
          <div className={`text-sm mt-1 ${meetsWinRate ? 'text-emerald-400' : 'text-slate-400'}`}>
            Target: 50%+
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Profit Factor</div>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{profitFactor.toFixed(2)}</div>
          <div className="text-slate-400 text-sm mt-1">
            {profitFactor >= 2 ? 'Excellent' : profitFactor >= 1.5 ? 'Good' : profitFactor >= 1 ? 'Fair' : 'Poor'}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Max Drawdown</div>
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{Math.abs(maxDrawdown).toFixed(2)}%</div>
          <div className={`text-sm mt-1 ${Math.abs(maxDrawdown) <= 10 ? 'text-emerald-400' : 'text-red-400'}`}>
            Limit: 10%
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-300 text-sm mb-1">Current Plan</p>
              <h3 className="text-2xl font-black text-white capitalize">{subscription?.tier || 'Free'}</h3>
            </div>
            <CreditCard className="w-10 h-10 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">${revenueData.planValue}</span>
            <span className="text-slate-400 text-sm">/month</span>
          </div>
          {subscription?.status === 'active' && revenueData.nextBillingDate && (
            <p className="text-slate-400 text-sm mt-3">
              Next billing: {revenueData.nextBillingDate.toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-300 text-sm mb-1">Monthly Value</p>
              <h3 className="text-xl font-bold text-white">Your Investment</h3>
            </div>
            <DollarSign className="w-10 h-10 text-green-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">${revenueData.currentRevenue}</span>
            <span className="text-slate-400 text-sm">/mo</span>
          </div>
          {subscription?.status === 'active' && (
            <div className="flex items-center gap-1 text-green-400 text-sm mt-3">
              <ArrowUp className="w-4 h-4" />
              <span>Active subscription</span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-300 text-sm mb-1">Annual Value</p>
              <h3 className="text-xl font-bold text-white">Projected Cost</h3>
            </div>
            <Users className="w-10 h-10 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">${revenueData.projectedRevenue}</span>
            <span className="text-slate-400 text-sm">/year</span>
          </div>
          {revenueData.projectedRevenue > 0 && (
            <p className="text-slate-400 text-sm mt-3">
              Based on current plan
            </p>
          )}
        </div>
      </div>

      {subscription?.tier !== 'elite' && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Trophy className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Upgrade for More Value</h3>
              <p className="text-slate-300 mb-4">
                {subscription?.tier === 'free'
                  ? 'Unlock advanced analytics, unlimited trades, and priority support with Pro or Elite.'
                  : 'Maximize your trading potential with Elite features including real-time data and mentorship access.'}
              </p>
              <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Funded Account Readiness</h2>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Overall Progress</span>
              <span className="text-emerald-400 font-bold">{passedCriteria}/{totalCriteria}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${(passedCriteria / totalCriteria) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${meetsWinRate ? 'bg-emerald-500/10 border border-emerald-500' : 'bg-slate-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {meetsWinRate ? (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-slate-600 rounded-full" />
                  )}
                  <span className="text-white font-medium">Win Rate ≥ 50%</span>
                </div>
                <span className={`font-bold ${meetsWinRate ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {winRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-slate-400 text-sm ml-8">
                Maintain a winning percentage of at least 50%
              </p>
            </div>

            <div className={`p-4 rounded-lg ${meetsMinTrades ? 'bg-emerald-500/10 border border-emerald-500' : 'bg-slate-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {meetsMinTrades ? (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-slate-600 rounded-full" />
                  )}
                  <span className="text-white font-medium">Minimum {minTrades} Trades</span>
                </div>
                <span className={`font-bold ${meetsMinTrades ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {profile?.total_trades || 0}/{minTrades}
                </span>
              </div>
              <p className="text-slate-400 text-sm ml-8">
                Execute at least {minTrades} trades to demonstrate consistency
              </p>
            </div>

            <div className={`p-4 rounded-lg ${withinDrawdownLimit ? 'bg-emerald-500/10 border border-emerald-500' : 'bg-slate-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {withinDrawdownLimit ? (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-slate-600 rounded-full" />
                  )}
                  <span className="text-white font-medium">Max Drawdown ≤ 10%</span>
                </div>
                <span className={`font-bold ${withinDrawdownLimit ? 'text-emerald-400' : 'text-red-400'}`}>
                  {((currentDrawdown / profile!.starting_capital) * 100).toFixed(2)}%
                </span>
              </div>
              <p className="text-slate-400 text-sm ml-8">
                Keep your maximum drawdown under 10% of starting capital
              </p>
            </div>

            <div className={`p-4 rounded-lg ${positiveReturn ? 'bg-emerald-500/10 border border-emerald-500' : 'bg-slate-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {positiveReturn ? (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-slate-600 rounded-full" />
                  )}
                  <span className="text-white font-medium">Positive Return</span>
                </div>
                <span className={`font-bold ${positiveReturn ? 'text-emerald-400' : 'text-red-400'}`}>
                  {accountGrowth >= 0 ? '+' : ''}{accountGrowth.toFixed(2)}%
                </span>
              </div>
              <p className="text-slate-400 text-sm ml-8">
                Achieve a net positive return on your trading account
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Trading Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="text-slate-400 text-sm mb-1">Average Win</div>
                <div className="text-emerald-400 font-bold text-lg">+${avgWin.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Average Loss</div>
                <div className="text-red-400 font-bold text-lg">-${avgLoss.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Best Trade</div>
                <div className="text-emerald-400 font-bold text-lg">+${profile?.best_trade.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Worst Trade</div>
                <div className="text-red-400 font-bold text-lg">${profile?.worst_trade.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Risk Guidelines</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Max Daily Loss:</span>
                <span className="text-white font-semibold">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Max Total Drawdown:</span>
                <span className="text-white font-semibold">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Risk Per Trade:</span>
                <span className="text-white font-semibold">1-2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Min Risk/Reward:</span>
                <span className="text-white font-semibold">1:2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Trades Performance</h2>
        {closedTrades.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No closed trades yet. Start trading to see your performance!
          </div>
        ) : (
          <div className="space-y-3">
            {closedTrades.slice(0, 10).map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    trade.profit_loss >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    {trade.profit_loss >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{trade.symbol}</div>
                    <div className="text-slate-400 text-sm">
                      {trade.quantity} shares • {trade.type.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-lg ${trade.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss.toFixed(2)}
                  </div>
                  <div className={`text-sm ${trade.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.profit_loss_percentage >= 0 ? '+' : ''}{trade.profit_loss_percentage.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
