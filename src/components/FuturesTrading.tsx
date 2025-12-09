import { useState } from 'react';
import { Zap, DollarSign, Clock, TrendingUp, AlertCircle, Info } from 'lucide-react';

type FuturesContract = {
  symbol: string;
  name: string;
  tickSize: number;
  tickValue: number;
  pointValue: number;
  margin: number;
  microSymbol?: string;
  microMargin?: number;
};

const futuresContracts: FuturesContract[] = [
  {
    symbol: '/ES',
    name: 'E-mini S&P 500',
    tickSize: 0.25,
    tickValue: 12.50,
    pointValue: 50,
    margin: 13000,
    microSymbol: '/MES',
    microMargin: 1300,
  },
  {
    symbol: '/NQ',
    name: 'E-mini NASDAQ-100',
    tickSize: 0.25,
    tickValue: 5,
    pointValue: 20,
    margin: 17000,
    microSymbol: '/MNQ',
    microMargin: 1700,
  },
  {
    symbol: '/YM',
    name: 'E-mini Dow',
    tickSize: 1,
    tickValue: 5,
    pointValue: 5,
    margin: 11000,
    microSymbol: '/MYM',
    microMargin: 1100,
  },
  {
    symbol: '/CL',
    name: 'Crude Oil',
    tickSize: 0.01,
    tickValue: 10,
    pointValue: 1000,
    margin: 7500,
    microSymbol: '/MCL',
    microMargin: 750,
  },
  {
    symbol: '/GC',
    name: 'Gold',
    tickSize: 0.10,
    tickValue: 10,
    pointValue: 100,
    margin: 11000,
    microSymbol: '/MGC',
    microMargin: 1100,
  },
  {
    symbol: '/RTY',
    name: 'E-mini Russell 2000',
    tickSize: 0.10,
    tickValue: 5,
    pointValue: 50,
    margin: 8000,
    microSymbol: '/M2K',
    microMargin: 800,
  },
];

export default function FuturesTrading() {
  const [selectedContract, setSelectedContract] = useState<FuturesContract>(futuresContracts[0]);
  const [useMicro, setUseMicro] = useState(false);
  const [accountSize, setAccountSize] = useState(50000);
  const [riskPoints, setRiskPoints] = useState(10);
  const [targetPoints, setTargetPoints] = useState(20);

  const currentMargin = useMicro && selectedContract.microMargin
    ? selectedContract.microMargin
    : selectedContract.margin;

  const currentPointValue = useMicro && selectedContract.microSymbol
    ? selectedContract.pointValue / 10
    : selectedContract.pointValue;

  const maxContracts = Math.floor(accountSize / currentMargin);
  const riskPerContract = riskPoints * currentPointValue;
  const rewardPerContract = targetPoints * currentPointValue;
  const riskRewardRatio = riskPoints > 0 ? targetPoints / riskPoints : 0;

  const recommendedContracts = Math.floor((accountSize * 0.01) / riskPerContract);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Futures Trading Guide</h1>
        <p className="text-slate-400">Learn contract specs, calculate risk, and master futures markets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">Why Trade Futures?</h2>
          </div>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span><strong className="text-white">Tax Advantages:</strong> 60/40 tax treatment in the US</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span><strong className="text-white">No PDT Rule:</strong> Trade with any account size</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span><strong className="text-white">24-Hour Trading:</strong> Nearly round-the-clock access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span><strong className="text-white">Tight Spreads:</strong> Often just 1 tick</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span><strong className="text-white">Pure Price Action:</strong> No earnings surprises</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span><strong className="text-white">Equal Long/Short:</strong> No borrow fees or restrictions</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Trading Hours</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-emerald-400 font-semibold mb-1">Regular Trading Hours (RTH)</div>
              <div className="text-slate-300">9:30 AM - 4:00 PM ET</div>
              <div className="text-slate-400 text-sm mt-1">Highest volume and liquidity. Best for day trading.</div>
            </div>
            <div>
              <div className="text-blue-400 font-semibold mb-1">Globex (Electronic)</div>
              <div className="text-slate-300">Sunday 6:00 PM - Friday 5:00 PM ET</div>
              <div className="text-slate-400 text-sm mt-1">Nearly 24 hours. Lower volume, wider spreads.</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-300">
                  <strong className="text-orange-400">Pro Tip:</strong> Focus on 9:30 AM - 11:30 AM ET for best opportunities
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Contract Specifications</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {futuresContracts.map((contract) => (
            <button
              key={contract.symbol}
              onClick={() => setSelectedContract(contract)}
              className={`p-5 rounded-xl border-2 transition text-left ${
                selectedContract.symbol === contract.symbol
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-750 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xl font-bold text-white">{contract.symbol}</div>
                  <div className="text-sm text-slate-400">{contract.name}</div>
                </div>
                {selectedContract.symbol === contract.symbol && (
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Point Value:</span>
                  <span className="text-white font-semibold">${contract.pointValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Margin:</span>
                  <span className="text-white font-semibold">${contract.margin.toLocaleString()}</span>
                </div>
                {contract.microSymbol && (
                  <div className="text-xs text-emerald-400 mt-2">
                    Micro available: {contract.microSymbol}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            {selectedContract.symbol} Calculator
          </h2>

          <div className="space-y-6">
            {selectedContract.microSymbol && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contract Size
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setUseMicro(false)}
                    className={`px-4 py-3 rounded-lg font-semibold transition ${
                      !useMicro
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Standard {selectedContract.symbol}
                  </button>
                  <button
                    onClick={() => setUseMicro(true)}
                    className={`px-4 py-3 rounded-lg font-semibold transition ${
                      useMicro
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Micro {selectedContract.microSymbol}
                  </button>
                </div>
              </div>
            )}

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Risk (Points)
                </label>
                <input
                  type="number"
                  value={riskPoints}
                  onChange={(e) => setRiskPoints(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="0"
                  step="0.25"
                />
                <div className="text-xs text-slate-400 mt-1">
                  ${(riskPoints * currentPointValue).toFixed(2)} per contract
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target (Points)
                </label>
                <input
                  type="number"
                  value={targetPoints}
                  onChange={(e) => setTargetPoints(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="0"
                  step="0.25"
                />
                <div className="text-xs text-slate-400 mt-1">
                  ${(targetPoints * currentPointValue).toFixed(2)} per contract
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Contract Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Symbol:</span>
                <span className="text-white font-bold text-xl">
                  {useMicro && selectedContract.microSymbol ? selectedContract.microSymbol : selectedContract.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Point Value:</span>
                <span className="text-white font-semibold">${currentPointValue}/point</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tick Size:</span>
                <span className="text-white font-semibold">
                  {selectedContract.tickSize} = ${selectedContract.tickValue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Margin Required:</span>
                <span className="text-white font-semibold">${currentMargin.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Max Contracts:</span>
                <span className="text-emerald-400 font-bold">{maxContracts}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recommended Position</h3>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <div className="text-slate-400 text-sm mb-1">Using 1% Risk Rule</div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {recommendedContracts} {recommendedContracts === 1 ? 'Contract' : 'Contracts'}
              </div>
              <div className="text-slate-300 text-sm">
                Risk per contract: ${riskPerContract.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
                <div className="text-red-400 text-xs mb-1">Total Risk</div>
                <div className="text-red-400 font-bold text-lg">
                  ${(recommendedContracts * riskPerContract).toFixed(2)}
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-3">
                <div className="text-emerald-400 text-xs mb-1">Potential Profit</div>
                <div className="text-emerald-400 font-bold text-lg">
                  ${(recommendedContracts * rewardPerContract).toFixed(2)}
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              riskRewardRatio >= 2
                ? 'bg-emerald-500/20 border border-emerald-500'
                : riskRewardRatio >= 1.5
                ? 'bg-yellow-500/20 border border-yellow-500'
                : 'bg-red-500/20 border border-red-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white">Risk/Reward Ratio</span>
                {riskRewardRatio >= 2 ? (
                  <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">EXCELLENT</span>
                ) : riskRewardRatio >= 1.5 ? (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">GOOD</span>
                ) : (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">POOR</span>
                )}
              </div>
              <div className={`text-3xl font-bold ${
                riskRewardRatio >= 2 ? 'text-emerald-400' : riskRewardRatio >= 1.5 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                1:{riskRewardRatio.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Futures Trading Tips</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Start with Micros:</strong> Learn with /MES or /MNQ before trading full-size contracts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>RTH Focus:</strong> Trade during regular hours (9:30 AM - 4:00 PM ET) for best liquidity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Respect Leverage:</strong> Futures magnify both gains and losses dramatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Watch Rollover:</strong> Close or roll positions before contract expiration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Use Limit Orders:</strong> Avoid slippage, especially in fast markets</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
