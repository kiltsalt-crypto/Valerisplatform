import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calculator, DollarSign, TrendingUp, AlertTriangle, Info } from 'lucide-react';

export default function RiskCalculator() {
  const { profile } = useAuth();
  const [accountSize, setAccountSize] = useState(profile?.current_capital || 100000);
  const [riskPercentage, setRiskPercentage] = useState(1);
  const [entryPrice, setEntryPrice] = useState(0);
  const [stopLoss, setStopLoss] = useState(0);
  const [takeProfit, setTakeProfit] = useState(0);

  const riskAmount = (accountSize * riskPercentage) / 100;
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  const positionSize = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const positionValue = positionSize * entryPrice;
  const rewardPerShare = Math.abs(takeProfit - entryPrice);
  const potentialProfit = positionSize * rewardPerShare;
  const riskRewardRatio = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;

  const dailyLossLimit = (accountSize * 5) / 100;
  const maxDrawdownLimit = (accountSize * 10) / 100;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Risk Management Calculator</h1>
        <p className="text-slate-400">Calculate optimal position sizes and manage your risk</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <div className="text-slate-400 text-sm">Daily Loss Limit</div>
          </div>
          <div className="text-2xl font-bold text-white">${dailyLossLimit.toLocaleString()}</div>
          <div className="text-slate-400 text-sm mt-1">5% of account</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
            <div className="text-slate-400 text-sm">Max Drawdown Limit</div>
          </div>
          <div className="text-2xl font-bold text-white">${maxDrawdownLimit.toLocaleString()}</div>
          <div className="text-slate-400 text-sm mt-1">10% of account</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <div className="text-slate-400 text-sm">Risk Per Trade</div>
          </div>
          <div className="text-2xl font-bold text-white">${riskAmount.toLocaleString()}</div>
          <div className="text-slate-400 text-sm mt-1">{riskPercentage}% of account</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Position Size Calculator
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Account Size ($)
              </label>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg font-semibold"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Risk Per Trade (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={riskPercentage}
                  onChange={(e) => setRiskPercentage(parseFloat(e.target.value))}
                  className="flex-1"
                  min="0.5"
                  max="5"
                  step="0.5"
                />
                <span className="text-white font-semibold text-lg w-16">{riskPercentage}%</span>
              </div>
              <div className="mt-2 text-slate-400 text-sm flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Recommended: 1-2% per trade for funded accounts</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Entry Price ($)
                </label>
                <input
                  type="number"
                  value={entryPrice || ''}
                  onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Stop Loss ($)
                </label>
                <input
                  type="number"
                  value={stopLoss || ''}
                  onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Take Profit ($)
                </label>
                <input
                  type="number"
                  value={takeProfit || ''}
                  onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Results
          </h2>

          <div className="space-y-6">
            <div className="bg-slate-700 rounded-lg p-6">
              <div className="text-slate-400 text-sm mb-2">Recommended Position Size</div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {positionSize.toLocaleString()} shares
              </div>
              <div className="text-slate-300">
                Position Value: ${positionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                <div className="text-red-400 text-sm mb-1">Risk Amount</div>
                <div className="text-2xl font-bold text-red-400">
                  ${riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-red-400/70 text-sm mt-1">
                  ${riskPerShare.toFixed(2)}/share
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
                <div className="text-emerald-400 text-sm mb-1">Potential Profit</div>
                <div className="text-2xl font-bold text-emerald-400">
                  ${potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-emerald-400/70 text-sm mt-1">
                  ${rewardPerShare.toFixed(2)}/share
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-6 ${
              riskRewardRatio >= 2
                ? 'bg-emerald-500/20 border border-emerald-500'
                : riskRewardRatio >= 1.5
                ? 'bg-yellow-500/20 border border-yellow-500'
                : 'bg-red-500/20 border border-red-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-white">Risk/Reward Ratio</div>
                {riskRewardRatio >= 2 ? (
                  <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded">EXCELLENT</span>
                ) : riskRewardRatio >= 1.5 ? (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">GOOD</span>
                ) : (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">POOR</span>
                )}
              </div>
              <div className={`text-4xl font-bold ${
                riskRewardRatio >= 2
                  ? 'text-emerald-400'
                  : riskRewardRatio >= 1.5
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                1:{riskRewardRatio.toFixed(2)}
              </div>
              <div className="mt-3 text-sm text-slate-300">
                {riskRewardRatio >= 2
                  ? 'Excellent risk/reward ratio. This trade meets professional standards.'
                  : riskRewardRatio >= 1.5
                  ? 'Acceptable ratio, but aim for 1:2 or better for optimal results.'
                  : 'Risk/reward ratio is too low. Consider adjusting your targets.'}
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <div className="font-semibold text-white mb-1">Pro Tip</div>
                  Always aim for a minimum 1:2 risk/reward ratio. This means you can be profitable even with a 50% win rate.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Funded Account Risk Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 mb-1">Daily Loss Limit</div>
            <div className="text-white font-semibold">Maximum 5% per day</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 mb-1">Total Drawdown</div>
            <div className="text-white font-semibold">Maximum 10% total</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 mb-1">Risk Per Trade</div>
            <div className="text-white font-semibold">1-2% recommended</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 mb-1">Min R:R Ratio</div>
            <div className="text-white font-semibold">1:2 or better</div>
          </div>
        </div>
      </div>
    </div>
  );
}
