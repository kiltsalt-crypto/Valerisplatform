import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { getHistoricalData, HistoricalData } from '../lib/marketData';

export default function MarketReplay() {
  const [symbol, setSymbol] = useState('AAPL');
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
  }, [symbol]);

  useEffect(() => {
    if (isPlaying && currentIndex < historicalData.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1000 / speed);
    } else if (currentIndex >= historicalData.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, speed, historicalData.length]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getHistoricalData(symbol, 90);
      if (data && data.length > 0) {
        setHistoricalData(data);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const stepForward = () => {
    if (currentIndex < historicalData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const visibleData = historicalData.slice(0, currentIndex + 1);
  const currentCandle = historicalData[currentIndex];

  const maxPrice = Math.max(...visibleData.map(d => d.high));
  const minPrice = Math.min(...visibleData.map(d => d.low));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Market Replay / Time Machine</h2>
          <p className="text-slate-400 text-sm">Practice trading on historical market data</p>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Symbol"
            className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none w-32"
          />
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Load Data
          </button>

          {historicalData.length > 0 && (
            <div className="text-slate-400 text-sm ml-auto">
              Bar {currentIndex + 1} of {historicalData.length}
              {' '}
              ({Math.round(((currentIndex + 1) / historicalData.length) * 100)}%)
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={reset}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={stepBackward}
            disabled={loading || currentIndex === 0}
            className="p-2 bg-slate-800 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            disabled={loading || historicalData.length === 0}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={stepForward}
            disabled={loading || currentIndex >= historicalData.length - 1}
            className="p-2 bg-slate-800 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-slate-400 text-sm">Speed:</span>
            {[0.5, 1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1 rounded text-sm transition ${
                  speed === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={historicalData.length - 1}
          value={currentIndex}
          onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
          className="w-full"
          disabled={loading || historicalData.length === 0}
        />
      </div>

      {loading ? (
        <div className="bg-slate-900 rounded-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-blue-500 mb-4"></div>
          <div className="text-slate-400">Loading historical data...</div>
        </div>
      ) : historicalData.length > 0 ? (
        <>
          {currentCandle && (
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-white">
                  ${currentCandle.close.toFixed(2)}
                </div>
                <div className="text-slate-400">
                  {new Date(currentCandle.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-slate-400 text-sm">Open</div>
                  <div className="text-white font-semibold">${currentCandle.open.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">High</div>
                  <div className="text-green-400 font-semibold">${currentCandle.high.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Low</div>
                  <div className="text-red-400 font-semibold">${currentCandle.low.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Volume</div>
                  <div className="text-white font-semibold">{(currentCandle.volume / 1000000).toFixed(2)}M</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900 rounded-lg p-4" style={{ height: '400px' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 400">
              {visibleData.map((candle, index) => {
                const x = (index / (historicalData.length - 1)) * 750 + 25;
                const bodyTop = 40 + ((maxPrice - Math.max(candle.open, candle.close)) / priceRange) * 320;
                const bodyBottom = 40 + ((maxPrice - Math.min(candle.open, candle.close)) / priceRange) * 320;
                const wickTop = 40 + ((maxPrice - candle.high) / priceRange) * 320;
                const wickBottom = 40 + ((maxPrice - candle.low) / priceRange) * 320;
                const isGreen = candle.close >= candle.open;
                const isCurrent = index === currentIndex;

                return (
                  <g key={index} opacity={isCurrent ? 1 : 0.7}>
                    <line
                      x1={x}
                      y1={wickTop}
                      x2={x}
                      y2={wickBottom}
                      stroke={isCurrent ? '#3b82f6' : isGreen ? '#10b981' : '#ef4444'}
                      strokeWidth={isCurrent ? '2' : '1'}
                    />
                    <rect
                      x={x - 3}
                      y={bodyTop}
                      width="6"
                      height={Math.max(bodyBottom - bodyTop, 1)}
                      fill={isCurrent ? '#3b82f6' : isGreen ? '#10b981' : '#ef4444'}
                    />
                  </g>
                );
              })}

              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = 40 + ratio * 320;
                const price = maxPrice - ratio * priceRange;
                return (
                  <g key={ratio}>
                    <line x1="25" y1={y} x2="775" y2={y} stroke="#374151" strokeWidth="1" strokeDasharray="4" />
                    <text x="780" y={y + 4} fill="#9ca3af" fontSize="12">${price.toFixed(2)}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
            <div className="text-blue-400 font-semibold mb-2">Practice Trading</div>
            <div className="text-slate-300 text-sm">
              Use the replay controls to step through historical data. Practice your trading strategy by predicting price movements before they happen. Current bar is highlighted in blue.
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-900 rounded-lg p-12 text-center text-slate-400">
          Enter a symbol and click "Load Data" to begin
        </div>
      )}
    </div>
  );
}
