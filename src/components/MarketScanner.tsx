import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Volume2, Zap, Bell, Filter } from 'lucide-react';

interface ScanResult {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  pattern: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number;
}

export default function MarketScanner() {
  const [scanType, setScanType] = useState('breakout');
  const [timeframe, setTimeframe] = useState('15');
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [filters, setFilters] = useState({
    minVolume: 1000,
    minPrice: 10,
    maxPrice: 10000
  });

  useEffect(() => {
    runScan();
  }, [scanType, timeframe]);

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const mockResults = generateMockResults();
      setResults(mockResults);
      setIsScanning(false);
    }, 1500);
  };

  const generateMockResults = () => {
    const symbols = ['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'SI', 'NG', '6E', '6J', 'ZB', 'ZN'];
    const patterns = [
      'Double Bottom', 'Head & Shoulders', 'Bull Flag', 'Bear Flag',
      'Triangle Breakout', 'Support Breakout', 'Resistance Breakout',
      'Volume Surge', 'Momentum Breakout', 'RSI Divergence'
    ];

    return symbols.slice(0, Math.floor(Math.random() * 8) + 5).map(symbol => {
      const price = Math.random() * 5000 + 1000;
      const change = (Math.random() - 0.5) * 5;
      const signal = change > 1 ? 'bullish' : change < -1 ? 'bearish' : 'neutral';

      return {
        symbol,
        price,
        change,
        volume: Math.floor(Math.random() * 50000) + 5000,
        pattern: patterns[Math.floor(Math.random() * patterns.length)],
        signal,
        strength: Math.floor(Math.random() * 40) + 60
      };
    }).sort((a, b) => b.strength - a.strength);
  };

  const scanTypes = [
    { id: 'breakout', label: 'Breakouts', icon: TrendingUp },
    { id: 'reversal', label: 'Reversals', icon: TrendingDown },
    { id: 'volume', label: 'Volume Surge', icon: Volume2 },
    { id: 'momentum', label: 'Momentum', icon: Zap },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-7 h-7 text-purple-400" />
          Market Scanner
        </h1>
        <button
          onClick={runScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 text-white rounded-lg transition"
        >
          <Search className="w-4 h-4" />
          {isScanning ? 'Scanning...' : 'Scan Now'}
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Scan Settings</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {scanTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setScanType(type.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition ${
                scanType === type.id
                  ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-purple-500/50'
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span className="font-semibold text-sm">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="5">5 Minutes</option>
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="240">4 Hours</option>
              <option value="D">Daily</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-1 block">Min Volume</label>
            <input
              type="number"
              value={filters.minVolume}
              onChange={(e) => setFilters({ ...filters, minVolume: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-1 block">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Min"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>

      {isScanning ? (
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Scanning markets for opportunities...</p>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              Scan Results ({results.length} opportunities)
            </h3>
            <button className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded transition text-sm">
              <Bell className="w-4 h-4" />
              Alert All
            </button>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No opportunities found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, i) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-lg hover:bg-slate-800/70 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        result.signal === 'bullish' ? 'bg-green-400' :
                        result.signal === 'bearish' ? 'bg-red-400' : 'bg-slate-400'
                      }`}></div>
                      <span className="text-white font-bold text-lg">{result.symbol}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        result.signal === 'bullish' ? 'bg-green-500/20 text-green-400' :
                        result.signal === 'bearish' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {result.pattern}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-bold">${result.price.toFixed(2)}</p>
                        <p className={`text-sm ${result.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {result.change >= 0 ? '+' : ''}{result.change.toFixed(2)}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-slate-400 text-xs">Strength</p>
                          <p className="text-white font-bold">{result.strength}%</p>
                        </div>
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              result.strength >= 80 ? 'bg-green-500' :
                              result.strength >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${result.strength}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Volume2 className="w-3 h-3" />
                        <span>Vol: {result.volume.toLocaleString()}</span>
                      </div>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{timeframe} min</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition text-xs">
                        Trade
                      </button>
                      <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded transition text-xs">
                        <Bell className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-semibold">Bullish Signals</h3>
          </div>
          <p className="text-3xl font-bold text-green-400 mb-1">
            {results.filter(r => r.signal === 'bullish').length}
          </p>
          <p className="text-slate-400 text-sm">Strong buying opportunities</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-semibold">Bearish Signals</h3>
          </div>
          <p className="text-3xl font-bold text-red-400 mb-1">
            {results.filter(r => r.signal === 'bearish').length}
          </p>
          <p className="text-slate-400 text-sm">Potential short opportunities</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">High Confidence</h3>
          </div>
          <p className="text-3xl font-bold text-purple-400 mb-1">
            {results.filter(r => r.strength >= 80).length}
          </p>
          <p className="text-slate-400 text-sm">80%+ signal strength</p>
        </div>
      </div>
    </div>
  );
}
