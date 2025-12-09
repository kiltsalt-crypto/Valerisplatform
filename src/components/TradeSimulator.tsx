import { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Percent, Target, BarChart3 } from 'lucide-react';

export default function TradeSimulator() {
  const [accountSize, setAccountSize] = useState(100000);
  const [entryPrice, setEntryPrice] = useState(4850);
  const [stopLoss, setStopLoss] = useState(4840);
  const [takeProfit, setTakeProfit] = useState(4870);
  const [riskPercent, setRiskPercent] = useState(1);
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [contractMultiplier, setContractMultiplier] = useState(50);

  const calculateSimulation = () => {
    const riskAmount = accountSize * (riskPercent / 100);
    const stopDistance = Math.abs(entryPrice - stopLoss);
    const profitDistance = Math.abs(takeProfit - entryPrice);

    const contracts = Math.floor(riskAmount / (stopDistance * contractMultiplier));
    const maxRisk = contracts * stopDistance * contractMultiplier;
    const maxProfit = contracts * profitDistance * contractMultiplier;
    const rewardRiskRatio = maxProfit / maxRisk;

    const scenarios = [
      { name: 'Hit Stop Loss', probability: 40, pnl: -maxRisk },
      { name: 'Break Even', probability: 20, pnl: 0 },
      { name: 'Half Target', probability: 25, pnl: maxProfit * 0.5 },
      { name: 'Full Target', probability: 15, pnl: maxProfit },
    ];

    const expectedValue = scenarios.reduce((sum, s) => sum + (s.pnl * s.probability / 100), 0);

    return {
      contracts,
      maxRisk,
      maxProfit,
      rewardRiskRatio,
      scenarios,
      expectedValue,
      newBalance: {
        win: accountSize + maxProfit,
        loss: accountSize - maxRisk
      }
    };
  };

  const results = calculateSimulation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calculator className="w-7 h-7 text-purple-400" />
          Trade Simulator
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Trade Setup
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Account Size</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={accountSize}
                  onChange={(e) => setAccountSize(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDirection('long')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
                    direction === 'long'
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Long
                </button>
                <button
                  onClick={() => setDirection('short')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
                    direction === 'short'
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  Short
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Entry Price</label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  step="0.25"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Stop Loss</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  step="0.25"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Take Profit</label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  step="0.25"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Risk per Trade (%)</label>
                <div className="relative">
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 pr-10 py-2 text-white"
                    min="0.1"
                    max="10"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Contract Multiplier</label>
                <input
                  type="number"
                  value={contractMultiplier}
                  onChange={(e) => setContractMultiplier(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Position Sizing
          </h3>

          <div className="space-y-3">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Contracts to Trade</p>
              <p className="text-3xl font-bold text-white">{results.contracts}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">Max Risk</p>
                <p className="text-red-400 font-bold text-lg">-${results.maxRisk.toFixed(0)}</p>
                <p className="text-slate-500 text-xs mt-1">
                  {((results.maxRisk / accountSize) * 100).toFixed(2)}% of account
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">Max Profit</p>
                <p className="text-green-400 font-bold text-lg">+${results.maxProfit.toFixed(0)}</p>
                <p className="text-slate-500 text-xs mt-1">
                  {((results.maxProfit / accountSize) * 100).toFixed(2)}% of account
                </p>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Reward:Risk Ratio</p>
              <p className="text-purple-400 font-bold text-2xl">{results.rewardRiskRatio.toFixed(2)}:1</p>
              <p className={`text-xs mt-1 ${
                results.rewardRiskRatio >= 2 ? 'text-green-400' :
                results.rewardRiskRatio >= 1.5 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {results.rewardRiskRatio >= 2 ? 'Excellent' :
                 results.rewardRiskRatio >= 1.5 ? 'Good' : 'Poor'}
              </p>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Expected Value</p>
              <p className={`font-bold text-xl ${results.expectedValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {results.expectedValue >= 0 ? '+' : ''}${results.expectedValue.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-white font-semibold mb-4">Monte Carlo Scenarios</h3>
        <div className="space-y-3">
          {results.scenarios.map((scenario, i) => (
            <div key={i} className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold">{scenario.name}</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                    {scenario.probability}% chance
                  </span>
                </div>
                <span className={`font-bold text-lg ${
                  scenario.pnl > 0 ? 'text-green-400' :
                  scenario.pnl < 0 ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {scenario.pnl > 0 ? '+' : ''}${scenario.pnl.toFixed(0)}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${scenario.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Winning Scenario
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Starting Balance:</span>
              <span className="text-white font-semibold">${accountSize.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Profit:</span>
              <span className="text-green-400 font-semibold">+${results.maxProfit.toFixed(0)}</span>
            </div>
            <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
              <span className="text-slate-400">New Balance:</span>
              <span className="text-green-400 font-bold text-xl">
                ${results.newBalance.win.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            Losing Scenario
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Starting Balance:</span>
              <span className="text-white font-semibold">${accountSize.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Loss:</span>
              <span className="text-red-400 font-semibold">-${results.maxRisk.toFixed(0)}</span>
            </div>
            <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
              <span className="text-slate-400">New Balance:</span>
              <span className="text-red-400 font-bold text-xl">
                ${results.newBalance.loss.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
