import { useState } from 'react';
import { Plus, X, TrendingUp, TrendingDown, Activity, Target, Trash2, Save, Play } from 'lucide-react';

interface Condition {
  id: string;
  indicator: string;
  operator: string;
  value: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  entryConditions: Condition[];
  exitConditions: Condition[];
  riskPerTrade: number;
  maxDailyLoss: number;
}

export default function StrategyBuilder() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const indicators = [
    'RSI', 'MACD', 'Moving Average (50)', 'Moving Average (200)',
    'Volume', 'Price', 'Bollinger Bands', 'Stochastic', 'ATR'
  ];

  const operators = ['>', '<', '=', '>=', '<=', 'crosses above', 'crosses below'];

  const createNewStrategy = () => {
    const newStrategy: Strategy = {
      id: Date.now().toString(),
      name: 'New Strategy',
      description: '',
      entryConditions: [],
      exitConditions: [],
      riskPerTrade: 1,
      maxDailyLoss: 500
    };
    setEditingStrategy(newStrategy);
  };

  const addCondition = (type: 'entry' | 'exit') => {
    if (!editingStrategy) return;

    const newCondition: Condition = {
      id: Date.now().toString(),
      indicator: 'RSI',
      operator: '>',
      value: '50'
    };

    if (type === 'entry') {
      setEditingStrategy({
        ...editingStrategy,
        entryConditions: [...editingStrategy.entryConditions, newCondition]
      });
    } else {
      setEditingStrategy({
        ...editingStrategy,
        exitConditions: [...editingStrategy.exitConditions, newCondition]
      });
    }
  };

  const removeCondition = (type: 'entry' | 'exit', conditionId: string) => {
    if (!editingStrategy) return;

    if (type === 'entry') {
      setEditingStrategy({
        ...editingStrategy,
        entryConditions: editingStrategy.entryConditions.filter(c => c.id !== conditionId)
      });
    } else {
      setEditingStrategy({
        ...editingStrategy,
        exitConditions: editingStrategy.exitConditions.filter(c => c.id !== conditionId)
      });
    }
  };

  const updateCondition = (type: 'entry' | 'exit', conditionId: string, field: keyof Condition, value: string) => {
    if (!editingStrategy) return;

    const updateConditions = (conditions: Condition[]) =>
      conditions.map(c => c.id === conditionId ? { ...c, [field]: value } : c);

    if (type === 'entry') {
      setEditingStrategy({
        ...editingStrategy,
        entryConditions: updateConditions(editingStrategy.entryConditions)
      });
    } else {
      setEditingStrategy({
        ...editingStrategy,
        exitConditions: updateConditions(editingStrategy.exitConditions)
      });
    }
  };

  const saveStrategy = () => {
    if (!editingStrategy) return;

    const existingIndex = strategies.findIndex(s => s.id === editingStrategy.id);
    if (existingIndex >= 0) {
      const updated = [...strategies];
      updated[existingIndex] = editingStrategy;
      setStrategies(updated);
    } else {
      setStrategies([...strategies, editingStrategy]);
    }

    setEditingStrategy(null);
  };

  const deleteStrategy = (id: string) => {
    setStrategies(strategies.filter(s => s.id !== id));
  };

  const testStrategy = (strategy: Strategy) => {
    const wins = Math.floor(Math.random() * 30) + 20;
    const losses = Math.floor(Math.random() * 20) + 10;
    const totalTrades = wins + losses;
    const winRate = (wins / totalTrades) * 100;
    const avgWin = Math.random() * 500 + 200;
    const avgLoss = Math.random() * 300 + 100;
    const netProfit = (wins * avgWin) - (losses * avgLoss);

    setTestResults({
      strategyName: strategy.name,
      totalTrades,
      wins,
      losses,
      winRate,
      netProfit,
      avgWin,
      avgLoss,
      profitFactor: (wins * avgWin) / (losses * avgLoss)
    });
  };

  const renderCondition = (condition: Condition, type: 'entry' | 'exit') => (
    <div key={condition.id} className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
      <select
        value={condition.indicator}
        onChange={(e) => updateCondition(type, condition.id, 'indicator', e.target.value)}
        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm flex-1"
      >
        {indicators.map(ind => (
          <option key={ind} value={ind}>{ind}</option>
        ))}
      </select>

      <select
        value={condition.operator}
        onChange={(e) => updateCondition(type, condition.id, 'operator', e.target.value)}
        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
      >
        {operators.map(op => (
          <option key={op} value={op}>{op}</option>
        ))}
      </select>

      <input
        type="text"
        value={condition.value}
        onChange={(e) => updateCondition(type, condition.id, 'value', e.target.value)}
        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm w-24"
        placeholder="Value"
      />

      <button
        onClick={() => removeCondition(type, condition.id)}
        className="p-1 hover:bg-red-500/20 text-red-400 rounded transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="w-7 h-7 text-purple-400" />
          Strategy Builder
        </h1>
        <button
          onClick={createNewStrategy}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          New Strategy
        </button>
      </div>

      {editingStrategy && (
        <div className="glass-card p-4">
          <h3 className="text-white font-semibold mb-4">
            {editingStrategy.name === 'New Strategy' ? 'Create Strategy' : 'Edit Strategy'}
          </h3>

          <div className="space-y-4 mb-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Strategy Name</label>
              <input
                type="text"
                value={editingStrategy.name}
                onChange={(e) => setEditingStrategy({ ...editingStrategy, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                placeholder="My Trading Strategy"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Description</label>
              <textarea
                value={editingStrategy.description}
                onChange={(e) => setEditingStrategy({ ...editingStrategy, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                placeholder="Describe your strategy..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Risk Per Trade (%)</label>
                <input
                  type="number"
                  value={editingStrategy.riskPerTrade}
                  onChange={(e) => setEditingStrategy({ ...editingStrategy, riskPerTrade: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  min="0.1"
                  max="5"
                  step="0.1"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Max Daily Loss ($)</label>
                <input
                  type="number"
                  value={editingStrategy.maxDailyLoss}
                  onChange={(e) => setEditingStrategy({ ...editingStrategy, maxDailyLoss: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Entry Conditions
                </h4>
                <button
                  onClick={() => addCondition('entry')}
                  className="text-sm px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition"
                >
                  Add Condition
                </button>
              </div>
              <div className="space-y-2">
                {editingStrategy.entryConditions.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No entry conditions yet</p>
                ) : (
                  editingStrategy.entryConditions.map(condition => renderCondition(condition, 'entry'))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Exit Conditions
                </h4>
                <button
                  onClick={() => addCondition('exit')}
                  className="text-sm px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                >
                  Add Condition
                </button>
              </div>
              <div className="space-y-2">
                {editingStrategy.exitConditions.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No exit conditions yet</p>
                ) : (
                  editingStrategy.exitConditions.map(condition => renderCondition(condition, 'exit'))
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveStrategy}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
            >
              <Save className="w-4 h-4" />
              Save Strategy
            </button>
            <button
              onClick={() => setEditingStrategy(null)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {testResults && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Backtest Results: {testResults.strategyName}</h3>
            <button
              onClick={() => setTestResults(null)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Total Trades</p>
              <p className="text-white font-bold text-xl">{testResults.totalTrades}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Win Rate</p>
              <p className="text-green-400 font-bold text-xl">{testResults.winRate.toFixed(1)}%</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Net Profit</p>
              <p className={`font-bold text-xl ${testResults.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${testResults.netProfit.toFixed(0)}
              </p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Profit Factor</p>
              <p className="text-white font-bold text-xl">{testResults.profitFactor.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.map(strategy => (
          <div key={strategy.id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">{strategy.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{strategy.description || 'No description'}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Entry Rules:</span>
                <span className="text-white font-semibold">{strategy.entryConditions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Exit Rules:</span>
                <span className="text-white font-semibold">{strategy.exitConditions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Risk per Trade:</span>
                <span className="text-purple-400 font-semibold">{strategy.riskPerTrade}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => testStrategy(strategy)}
                className="flex items-center gap-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition text-sm flex-1 justify-center"
              >
                <Play className="w-4 h-4" />
                Test
              </button>
              <button
                onClick={() => setEditingStrategy(strategy)}
                className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded transition text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deleteStrategy(strategy.id)}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {strategies.length === 0 && !editingStrategy && (
          <div className="col-span-full glass-card p-8 text-center">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">No strategies yet. Create your first trading strategy!</p>
            <button
              onClick={createNewStrategy}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
            >
              Create Strategy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
