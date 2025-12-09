import { useState, useEffect } from 'react';
import { GitCompare, Plus, X } from 'lucide-react';
import { getRealtimeQuote, getHistoricalData, MarketQuote, HistoricalData } from '../lib/marketData';

interface ComparisonStock {
  symbol: string;
  quote: MarketQuote | null;
  historical: HistoricalData[];
  color: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function StockComparison() {
  const [stocks, setStocks] = useState<ComparisonStock[]>([
    { symbol: 'SPY', quote: null, historical: [], color: COLORS[0] },
  ]);
  const [newSymbol, setNewSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [normalizeData, setNormalizeData] = useState(true);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 5000);
    return () => clearInterval(interval);
  }, [stocks.length]);

  const loadAllData = async () => {
    const updatedStocks = await Promise.all(
      stocks.map(async (stock) => {
        const [quote, historical] = await Promise.all([
          getRealtimeQuote(stock.symbol),
          getHistoricalData(stock.symbol, 90),
        ]);
        return { ...stock, quote, historical };
      })
    );
    setStocks(updatedStocks);
  };

  const addStock = async () => {
    if (!newSymbol || stocks.length >= 6) return;

    setLoading(true);
    try {
      const [quote, historical] = await Promise.all([
        getRealtimeQuote(newSymbol),
        getHistoricalData(newSymbol, 90),
      ]);

      if (quote && historical.length > 0) {
        setStocks(prev => [
          ...prev,
          {
            symbol: newSymbol.toUpperCase(),
            quote,
            historical,
            color: COLORS[prev.length % COLORS.length],
          },
        ]);
        setNewSymbol('');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeStock = (symbol: string) => {
    setStocks(prev => prev.filter(s => s.symbol !== symbol));
  };

  const normalizePrice = (price: number, initialPrice: number) => {
    return ((price - initialPrice) / initialPrice) * 100;
  };

  const getChartData = () => {
    if (stocks.length === 0 || stocks[0].historical.length === 0) return [];

    const maxLength = Math.min(...stocks.map(s => s.historical.length));

    return stocks.map(stock => {
      const data = stock.historical.slice(-maxLength);
      const initialPrice = data[0].close;

      return {
        ...stock,
        points: data.map(d => ({
          timestamp: d.timestamp,
          value: normalizeData ? normalizePrice(d.close, initialPrice) : d.close,
        })),
      };
    });
  };

  const chartData = getChartData();
  const maxValue = normalizeData
    ? Math.max(...chartData.flatMap(s => s.points.map(p => p.value)))
    : Math.max(...chartData.flatMap(s => s.points.map(p => p.value)));
  const minValue = normalizeData
    ? Math.min(...chartData.flatMap(s => s.points.map(p => p.value)))
    : Math.min(...chartData.flatMap(s => s.points.map(p => p.value)));
  const range = maxValue - minValue;

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Stock Comparison</h2>
            <p className="text-slate-400 text-sm">Compare multiple stocks on one chart</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && addStock()}
            placeholder="Add symbol (e.g., AAPL)"
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            disabled={stocks.length >= 6}
          />
          <button
            onClick={addStock}
            disabled={!newSymbol || stocks.length >= 6 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
          <button
            onClick={() => setNormalizeData(!normalizeData)}
            className={`px-4 py-2 rounded-lg transition ${
              normalizeData
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {normalizeData ? 'Normalized' : 'Absolute'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stock.color }}
              />
              <span className="text-white font-semibold">{stock.symbol}</span>
              {stock.quote && (
                <span className={`text-sm ${
                  stock.quote.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {normalizeData
                    ? `${stock.quote.changePercent >= 0 ? '+' : ''}${stock.quote.changePercent.toFixed(2)}%`
                    : `$${stock.quote.price.toFixed(2)}`
                  }
                </span>
              )}
              <button
                onClick={() => removeStock(stock.symbol)}
                className="text-slate-400 hover:text-red-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {stocks.length > 0 ? (
        <>
          <div className="bg-slate-900 rounded-lg p-4 mb-4" style={{ height: '400px' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 400">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = 40 + ratio * 320;
                const value = maxValue - ratio * range;
                return (
                  <g key={ratio}>
                    <line x1="25" y1={y} x2="775" y2={y} stroke="#374151" strokeWidth="1" strokeDasharray="4" />
                    <text x="5" y={y + 4} fill="#9ca3af" fontSize="12">
                      {normalizeData ? `${value.toFixed(1)}%` : `$${value.toFixed(2)}`}
                    </text>
                  </g>
                );
              })}

              {chartData.map((stock) => (
                <polyline
                  key={stock.symbol}
                  points={stock.points
                    .map((point, i) => {
                      const x = (i / (stock.points.length - 1)) * 750 + 25;
                      const y = 40 + ((maxValue - point.value) / range) * 320;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke={stock.color}
                  strokeWidth="3"
                  opacity="0.9"
                />
              ))}
            </svg>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stocks.map((stock) => (
              <div key={stock.symbol} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stock.color }}
                  />
                  <div className="text-white font-semibold">{stock.symbol}</div>
                </div>
                {stock.quote && (
                  <>
                    <div className="text-2xl font-bold text-white mb-1">
                      ${stock.quote.price.toFixed(2)}
                    </div>
                    <div className={`text-sm ${
                      stock.quote.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stock.quote.change >= 0 ? '+' : ''}
                      {stock.quote.change.toFixed(2)} ({stock.quote.changePercent.toFixed(2)}%)
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {normalizeData && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
              <div className="text-blue-400 font-semibold mb-2">Normalized View</div>
              <div className="text-slate-300 text-sm">
                All stocks are shown as percentage change from their starting price, making it easy to compare relative performance regardless of absolute price levels.
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-slate-900 rounded-lg p-12 text-center text-slate-400">
          Add stocks to compare their performance
        </div>
      )}
    </div>
  );
}
