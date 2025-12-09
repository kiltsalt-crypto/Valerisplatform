import { useState, useEffect } from 'react';
import { Grid, Maximize2, X } from 'lucide-react';
import { getRealtimeQuote, getHistoricalData, MarketQuote, HistoricalData } from '../lib/marketData';

interface ChartData {
  id: string;
  symbol: string;
  quote: MarketQuote | null;
  chartData: HistoricalData[];
  interval: string;
}

export default function MultiChartLayout() {
  const [layout, setLayout] = useState<2 | 4>(4);
  const [charts, setCharts] = useState<ChartData[]>([
    { id: '1', symbol: 'SPY', quote: null, chartData: [], interval: '1D' },
    { id: '2', symbol: 'AAPL', quote: null, chartData: [], interval: '1D' },
    { id: '3', symbol: 'TSLA', quote: null, chartData: [], interval: '1D' },
    { id: '4', symbol: 'BTC-USD', quote: null, chartData: [], interval: '1D' },
  ]);

  useEffect(() => {
    charts.forEach((chart) => {
      loadChartData(chart.id, chart.symbol, chart.interval);
    });

    const interval = setInterval(() => {
      charts.forEach((chart) => {
        updateQuote(chart.id, chart.symbol);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [charts.length]);

  const loadChartData = async (chartId: string, symbol: string, interval: string) => {
    try {
      const [quote, historical] = await Promise.all([
        getRealtimeQuote(symbol),
        getHistoricalData(symbol, interval),
      ]);

      setCharts((prev) =>
        prev.map((c) =>
          c.id === chartId
            ? { ...c, quote, chartData: historical }
            : c
        )
      );
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const updateQuote = async (chartId: string, symbol: string) => {
    try {
      const quote = await getRealtimeQuote(symbol);
      setCharts((prev) =>
        prev.map((c) => (c.id === chartId ? { ...c, quote } : c))
      );
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  const updateSymbol = (chartId: string, newSymbol: string) => {
    setCharts((prev) =>
      prev.map((c) =>
        c.id === chartId ? { ...c, symbol: newSymbol.toUpperCase() } : c
      )
    );
    const chart = charts.find((c) => c.id === chartId);
    if (chart) {
      loadChartData(chartId, newSymbol, chart.interval);
    }
  };

  const updateInterval = (chartId: string, newInterval: string) => {
    setCharts((prev) =>
      prev.map((c) =>
        c.id === chartId ? { ...c, interval: newInterval } : c
      )
    );
    const chart = charts.find((c) => c.id === chartId);
    if (chart) {
      loadChartData(chartId, chart.symbol, newInterval);
    }
  };

  const renderChart = (chart: ChartData) => {
    const maxPrice = Math.max(...chart.chartData.map((d) => d.high));
    const minPrice = Math.min(...chart.chartData.map((d) => d.low));
    const priceRange = maxPrice - minPrice;

    return (
      <div key={chart.id} className="bg-slate-700 rounded-lg p-4 flex flex-col h-full">
        <div className="mb-3">
          <input
            type="text"
            value={chart.symbol}
            onChange={(e) => updateSymbol(chart.id, e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-800 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none font-semibold"
          />
        </div>

        {chart.quote && (
          <div className="mb-3">
            <div className="text-2xl font-bold text-white">
              ${chart.quote.price.toFixed(2)}
            </div>
            <div className={`flex items-center gap-2 text-sm ${
              chart.quote.change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>
                {chart.quote.change >= 0 ? '+' : ''}
                {chart.quote.change.toFixed(2)}
              </span>
              <span>
                ({chart.quote.changePercent >= 0 ? '+' : ''}
                {chart.quote.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-3">
          {['1D', '1W', '1M'].map((int) => (
            <button
              key={int}
              onClick={() => updateInterval(chart.id, int)}
              className={`px-2 py-1 rounded text-xs transition ${
                chart.interval === int
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {int}
            </button>
          ))}
        </div>

        <div className="flex-1 relative min-h-0">
          {chart.chartData.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
              {chart.chartData.map((candle, i) => {
                const x = (i / chart.chartData.length) * 300;
                const bodyTop = ((maxPrice - Math.max(candle.open, candle.close)) / priceRange) * 150;
                const bodyBottom = ((maxPrice - Math.min(candle.open, candle.close)) / priceRange) * 150;
                const wickTop = ((maxPrice - candle.high) / priceRange) * 150;
                const wickBottom = ((maxPrice - candle.low) / priceRange) * 150;
                const isGreen = candle.close >= candle.open;
                const color = isGreen ? '#10b981' : '#ef4444';
                const candleWidth = Math.max(300 / chart.chartData.length - 1, 1);

                return (
                  <g key={i}>
                    <line
                      x1={x + candleWidth / 2}
                      y1={wickTop}
                      x2={x + candleWidth / 2}
                      y2={wickBottom}
                      stroke={color}
                      strokeWidth="1"
                    />
                    <rect
                      x={x}
                      y={bodyTop}
                      width={candleWidth}
                      height={Math.max(bodyBottom - bodyTop, 1)}
                      fill={color}
                    />
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              Loading...
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Grid className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Multi-Chart Layout</h2>
            <p className="text-slate-400 text-sm">Monitor multiple instruments simultaneously</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLayout(2)}
            className={`px-4 py-2 rounded-lg transition ${
              layout === 2
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            2 Charts
          </button>
          <button
            onClick={() => setLayout(4)}
            className={`px-4 py-2 rounded-lg transition ${
              layout === 4
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            4 Charts
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${
        layout === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
      }`} style={{ height: layout === 2 ? '600px' : '800px' }}>
        {charts.slice(0, layout).map(renderChart)}
      </div>
    </div>
  );
}
