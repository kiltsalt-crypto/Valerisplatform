import { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity, AlertCircle, Search, X, TrendingUpIcon } from 'lucide-react';
import { getRealtimeQuote, getHistoricalData, searchSymbols, MarketQuote, HistoricalData } from '../lib/marketData';
import { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands, SMAData, RSIData, MACDData, BollingerBandsData } from '../lib/technicalIndicators';
import { realtimeMarketData } from '../lib/realtimeMarketData';

interface Candle extends HistoricalData {
  time: string;
}

export default function TradingViewChart() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [interval, setInterval] = useState('1D');
  const [chartData, setChartData] = useState<Candle[]>([]);
  const [currentQuote, setCurrentQuote] = useState<MarketQuote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{symbol: string, description: string}>>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState(0);
  const [indicators, setIndicators] = useState({
    sma20: false,
    sma50: false,
    sma200: false,
    rsi: false,
    macd: false,
    bollinger: false,
    volume: false,
  });
  const [sma20Data, setSma20Data] = useState<SMAData[]>([]);
  const [sma50Data, setSma50Data] = useState<SMAData[]>([]);
  const [sma200Data, setSma200Data] = useState<SMAData[]>([]);
  const [rsiData, setRsiData] = useState<RSIData[]>([]);
  const [macdData, setMacdData] = useState<MACDData[]>([]);
  const [bollingerData, setBollingerData] = useState<BollingerBandsData[]>([]);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeAgoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();

    const unsubscribe = realtimeMarketData.subscribe(selectedSymbol, (quote) => {
      setCurrentQuote(quote);
      setLastUpdate(new Date());
    });

    return () => {
      unsubscribe();
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      if (timeAgoTimerRef.current) {
        clearInterval(timeAgoTimerRef.current);
      }
    };
  }, [selectedSymbol, interval]);

  useEffect(() => {
    if (timeAgoTimerRef.current) {
      clearInterval(timeAgoTimerRef.current);
    }

    timeAgoTimerRef.current = setInterval(() => {
      setTimeAgo(Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000));
    }, 1000);

    return () => {
      if (timeAgoTimerRef.current) {
        clearInterval(timeAgoTimerRef.current);
      }
    };
  }, [lastUpdate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const days = interval === '1D' ? 180 : interval === '1W' ? 30 : 7;

      console.log('[TradingViewChart] Loading data for', selectedSymbol, 'days:', days);

      const [historical, quote] = await Promise.all([
        getHistoricalData(selectedSymbol, days),
        getRealtimeQuote(selectedSymbol)
      ]);

      console.log('[TradingViewChart] Received historical:', historical?.length, 'records');
      console.log('[TradingViewChart] Received quote:', quote);

      if (historical && historical.length > 0) {
        const validHistorical = historical.filter(h => h.timestamp && h.close);
        console.log('[TradingViewChart] Valid historical:', validHistorical.length, 'records');

        if (validHistorical.length === 0) {
          setError(`No valid data available for ${selectedSymbol}`);
          return;
        }

        const formatted = validHistorical.map(h => ({
          ...h,
          time: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
        setChartData(formatted);

        setSma20Data(calculateSMA(validHistorical, 20));
        setSma50Data(calculateSMA(validHistorical, 50));
        setSma200Data(calculateSMA(validHistorical, 200));
        setRsiData(calculateRSI(validHistorical, 14));
        setMacdData(calculateMACD(validHistorical));
        setBollingerData(calculateBollingerBands(validHistorical, 20, 2));
      } else {
        console.log('[TradingViewChart] No historical data received');
        setError(`No data available for ${selectedSymbol}`);
      }

      if (quote) {
        setCurrentQuote(quote);
        setLastUpdate(new Date());
      } else {
        console.log('[TradingViewChart] No quote received');
        setError(`Unable to fetch quote for ${selectedSymbol}`);
      }
    } catch (err) {
      console.error('[TradingViewChart] Error loading data:', err);
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (searchQuery.length === 0) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await searchSymbols(searchQuery);
      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map(c => c.high)) : 0;
  const minPrice = chartData.length > 0 ? Math.min(...chartData.map(c => c.low)) : 0;
  const priceRange = maxPrice - minPrice || 1;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-slate-800 rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Live Market Chart
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-400 font-normal">Live</span>
                </span>
              </h2>
              <p className="text-slate-400 text-sm">
                Real-time data - Updates every 60 seconds
                {currentQuote && timeAgo < 120 && (
                  <span className="ml-2 text-slate-500">
                    • Updated {timeAgo}s ago
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              <Search className="w-4 h-4" />
              <span className="font-medium">{selectedSymbol}</span>
            </button>

            {showSearch && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-slate-700 rounded-lg shadow-xl z-50 border border-slate-600">
                <div className="p-3 border-b border-slate-600">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search symbols..."
                      className="w-full pl-10 pr-8 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <button
                        key={result.symbol}
                        onClick={() => handleSymbolSelect(result.symbol)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-600 transition flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-white">{result.symbol}</div>
                          <div className="text-xs text-slate-400 truncate">{result.description}</div>
                        </div>
                      </button>
                    ))
                  ) : searchQuery.length > 0 ? (
                    <div className="px-4 py-8 text-center text-slate-400 text-sm">
                      No results found
                    </div>
                  ) : (
                    <div className="px-4 py-6 max-h-96 overflow-y-auto">
                      <div className="text-center mb-4">
                        <div className="text-slate-400 text-sm mb-2">Search ANY publicly traded stock, ETF, crypto, forex, or commodity</div>
                        <div className="text-xs text-slate-500">Examples: BTC-USD, EUR=X, GC=F, AAPL, QQQ, SPY</div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-slate-400 text-xs font-semibold mb-2 px-2">POPULAR STOCKS</div>
                          <div className="flex flex-wrap gap-2">
                            {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'].map((sym) => (
                              <button
                                key={sym}
                                onClick={() => handleSymbolSelect(sym)}
                                className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-sm transition"
                              >
                                {sym}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 text-xs font-semibold mb-2 px-2">INDICES</div>
                          <div className="flex flex-wrap gap-2">
                            {['SPY', 'QQQ', 'DIA', 'IWM', '^GSPC', '^DJI', '^IXIC', '^VIX'].map((sym) => (
                              <button
                                key={sym}
                                onClick={() => handleSymbolSelect(sym)}
                                className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-sm transition"
                              >
                                {sym}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 text-xs font-semibold mb-2 px-2">CRYPTO</div>
                          <div className="flex flex-wrap gap-2">
                            {['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD', 'DOGE-USD', 'AVAX-USD'].map((sym) => (
                              <button
                                key={sym}
                                onClick={() => handleSymbolSelect(sym)}
                                className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-sm transition"
                              >
                                {sym}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 text-xs font-semibold mb-2 px-2">FOREX</div>
                          <div className="flex flex-wrap gap-2">
                            {['EUR=X', 'GBP=X', 'JPY=X', 'AUD=X', 'CAD=X', 'CHF=X'].map((sym) => (
                              <button
                                key={sym}
                                onClick={() => handleSymbolSelect(sym)}
                                className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-sm transition"
                              >
                                {sym}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 text-xs font-semibold mb-2 px-2">COMMODITIES</div>
                          <div className="flex flex-wrap gap-2">
                            {['GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F', 'ZC=F'].map((sym) => (
                              <button
                                key={sym}
                                onClick={() => handleSymbolSelect(sym)}
                                className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-sm transition"
                              >
                                {sym === 'GC=F' ? 'Gold' : sym === 'SI=F' ? 'Silver' : sym === 'CL=F' ? 'Oil' : sym === 'NG=F' ? 'Nat Gas' : sym === 'HG=F' ? 'Copper' : 'Corn'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 text-xs font-semibold mb-2 px-2">SECTOR ETFS</div>
                          <div className="flex flex-wrap gap-2">
                            {['XLF', 'XLE', 'XLK', 'XLV', 'XLI', 'XLY', 'XLP', 'XLRE'].map((sym) => (
                              <button
                                key={sym}
                                onClick={() => handleSymbolSelect(sym)}
                                className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-sm transition"
                              >
                                {sym}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-4">
          <div className="flex gap-2">
            {['1D', '1W', '1M'].map((int) => (
              <button
                key={int}
                onClick={() => setInterval(int)}
                className={`px-4 py-2 rounded-lg transition ${
                  interval === int
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {int}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIndicators(prev => ({ ...prev, sma20: !prev.sma20 }))}
              className={`px-3 py-1 rounded text-sm transition ${
                indicators.sma20
                  ? 'bg-yellow-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, sma50: !prev.sma50 }))}
              className={`px-3 py-1 rounded text-sm transition ${
                indicators.sma50
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              SMA 50
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, sma200: !prev.sma200 }))}
              className={`px-3 py-1 rounded text-sm transition ${
                indicators.sma200
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              SMA 200
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, bollinger: !prev.bollinger }))}
              className={`px-3 py-1 rounded text-sm transition ${
                indicators.bollinger
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Bollinger Bands
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, rsi: !prev.rsi }))}
              className={`px-3 py-1 rounded text-sm transition ${
                indicators.rsi
                  ? 'bg-pink-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              RSI
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, macd: !prev.macd }))}
              className={`px-3 py-1 rounded text-sm transition ${
                indicators.macd
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              MACD
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, volume: !prev.volume }))}
              className={`px-3 py-1 rounded text-sm transition ${
                indicators.volume
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Volume
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-slate-900 rounded-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-blue-500 mb-4"></div>
            <div className="text-slate-400">Loading {selectedSymbol} data...</div>
          </div>
        ) : error ? (
          <div className="bg-slate-900 rounded-lg p-12 text-center">
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <div className="text-slate-300 mb-2">{error}</div>
            <p className="text-slate-500 text-sm mb-4">Try a different symbol</p>
            <div className="flex gap-2 justify-center">
              {['AAPL', 'MSFT', 'GOOGL', 'TSLA'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => setSelectedSymbol(sym)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        ) : currentQuote && chartData.length > 0 ? (
          <>
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    ${currentQuote.price.toFixed(2)}
                  </div>
                  <div className={`flex items-center gap-2 ${currentQuote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {currentQuote.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span className="font-medium">
                      {currentQuote.change >= 0 ? '+' : ''}{currentQuote.change.toFixed(2)} ({currentQuote.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-4 mb-4" style={{ height: '400px' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 360">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {chartData.map((candle, index) => {
                  const x = (index / (chartData.length - 1)) * 750 + 25;
                  const bodyTop = 40 + ((maxPrice - Math.max(candle.open, candle.close)) / priceRange) * 320;
                  const bodyBottom = 40 + ((maxPrice - Math.min(candle.open, candle.close)) / priceRange) * 320;
                  const wickTop = 40 + ((maxPrice - candle.high) / priceRange) * 320;
                  const wickBottom = 40 + ((maxPrice - candle.low) / priceRange) * 320;
                  const isGreen = candle.close >= candle.open;

                  return (
                    <g key={index}>
                      <line
                        x1={x}
                        y1={wickTop}
                        x2={x}
                        y2={wickBottom}
                        stroke={isGreen ? '#10b981' : '#ef4444'}
                        strokeWidth="1"
                      />
                      <rect
                        x={x - 3}
                        y={bodyTop}
                        width="6"
                        height={Math.max(bodyBottom - bodyTop, 1)}
                        fill={isGreen ? '#10b981' : '#ef4444'}
                      />
                    </g>
                  );
                })}

                {indicators.bollinger && bollingerData.length > 0 && (
                  <>
                    <polyline
                      points={bollingerData.map((d, i) => {
                        const dataIndex = chartData.findIndex(c => c.timestamp === d.timestamp);
                        if (dataIndex === -1) return '';
                        const x = (dataIndex / (chartData.length - 1)) * 750 + 25;
                        const y = 40 + ((maxPrice - d.upper) / priceRange) * 320;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      opacity="0.5"
                      strokeDasharray="3"
                    />
                    <polyline
                      points={bollingerData.map((d, i) => {
                        const dataIndex = chartData.findIndex(c => c.timestamp === d.timestamp);
                        if (dataIndex === -1) return '';
                        const x = (dataIndex / (chartData.length - 1)) * 750 + 25;
                        const y = 40 + ((maxPrice - d.middle) / priceRange) * 320;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      opacity="0.7"
                    />
                    <polyline
                      points={bollingerData.map((d, i) => {
                        const dataIndex = chartData.findIndex(c => c.timestamp === d.timestamp);
                        if (dataIndex === -1) return '';
                        const x = (dataIndex / (chartData.length - 1)) * 750 + 25;
                        const y = 40 + ((maxPrice - d.lower) / priceRange) * 320;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      opacity="0.5"
                      strokeDasharray="3"
                    />
                  </>
                )}

                {indicators.sma20 && sma20Data.length > 0 && (
                  <polyline
                    points={sma20Data.map((d, i) => {
                      const dataIndex = chartData.findIndex(c => c.timestamp === d.timestamp);
                      if (dataIndex === -1) return '';
                      const x = (dataIndex / (chartData.length - 1)) * 750 + 25;
                      const y = 40 + ((maxPrice - d.value) / priceRange) * 320;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="2"
                  />
                )}

                {indicators.sma50 && sma50Data.length > 0 && (
                  <polyline
                    points={sma50Data.map((d, i) => {
                      const dataIndex = chartData.findIndex(c => c.timestamp === d.timestamp);
                      if (dataIndex === -1) return '';
                      const x = (dataIndex / (chartData.length - 1)) * 750 + 25;
                      const y = 40 + ((maxPrice - d.value) / priceRange) * 320;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                  />
                )}

                {indicators.sma200 && sma200Data.length > 0 && (
                  <polyline
                    points={sma200Data.map((d, i) => {
                      const dataIndex = chartData.findIndex(c => c.timestamp === d.timestamp);
                      if (dataIndex === -1) return '';
                      const x = (dataIndex / (chartData.length - 1)) * 750 + 25;
                      const y = 40 + ((maxPrice - d.value) / priceRange) * 320;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                  />
                )}

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

                {chartData.filter((_, i) => i % Math.ceil(chartData.length / 6) === 0).map((candle, idx, arr) => {
                  const actualIndex = chartData.indexOf(candle);
                  const x = (actualIndex / (chartData.length - 1)) * 750 + 25;
                  return (
                    <text key={actualIndex} x={x} y="375" fill="#9ca3af" fontSize="11" textAnchor="middle">
                      {candle.time}
                    </text>
                  );
                })}
              </svg>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Open</div>
                <div className="text-white font-semibold">${currentQuote.open.toFixed(2)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">High</div>
                <div className="text-green-400 font-semibold">${currentQuote.high.toFixed(2)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Low</div>
                <div className="text-red-400 font-semibold">${currentQuote.low.toFixed(2)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Volume</div>
                <div className="text-white font-semibold">{(currentQuote.volume / 1000000).toFixed(2)}M</div>
              </div>
            </div>

            {indicators.rsi && rsiData.length > 0 && (
              <div className="bg-slate-900 rounded-lg p-4 mb-4">
                <div className="text-white font-semibold mb-2 flex items-center justify-between">
                  <span>RSI (14)</span>
                  <span className={`${
                    rsiData[rsiData.length - 1].value > 70 ? 'text-red-400' :
                    rsiData[rsiData.length - 1].value < 30 ? 'text-green-400' :
                    'text-slate-400'
                  }`}>
                    {rsiData[rsiData.length - 1].value.toFixed(2)}
                  </span>
                </div>
                <svg width="100%" height="100" viewBox="0 0 800 100">
                  <line x1="25" y1="70" x2="775" y2="70" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
                  <line x1="25" y1="30" x2="775" y2="30" stroke="#10b981" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
                  <line x1="25" y1="50" x2="775" y2="50" stroke="#374151" strokeWidth="1" strokeDasharray="4" />
                  <polyline
                    points={rsiData.map((d, i) => {
                      const dataIndex = chartData.findIndex(c => c.timestamp === d.timestamp);
                      if (dataIndex === -1) return '';
                      const x = (dataIndex / (chartData.length - 1)) * 750 + 25;
                      const y = 100 - d.value;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}

            {indicators.macd && macdData.length > 0 && (
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="text-white font-semibold mb-2">MACD</div>
                <svg width="100%" height="100" viewBox="0 0 800 100">
                  <line x1="25" y1="50" x2="775" y2="50" stroke="#374151" strokeWidth="1" strokeDasharray="4" />
                  {macdData.map((d, i) => {
                    const dataIndex = chartData.findIndex(c => c.timestamp === d.timestamp);
                    if (dataIndex === -1) return null;
                    const x = (dataIndex / (chartData.length - 1)) * 750 + 25;
                    const histHeight = Math.abs(d.histogram) * 50;
                    const y = d.histogram >= 0 ? 50 - histHeight : 50;
                    return (
                      <rect
                        key={i}
                        x={x - 2}
                        y={y}
                        width="4"
                        height={histHeight}
                        fill={d.histogram >= 0 ? '#10b981' : '#ef4444'}
                        opacity="0.6"
                      />
                    );
                  })}
                  <polyline
                    points={macdData.map((d, i) => {
                      const dataIndex = chartData.findIndex(c => c.timestamp === d.timestamp);
                      if (dataIndex === -1) return '';
                      const x = (dataIndex / (chartData.length - 1)) * 750 + 25;
                      const y = 50 - (d.macd * 50);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <polyline
                    points={macdData.map((d, i) => {
                      const dataIndex = chartData.findIndex(c => c.timestamp === d.timestamp);
                      if (dataIndex === -1) return '';
                      const x = (dataIndex / (chartData.length - 1)) * 750 + 25;
                      const y = 50 - (d.signal * 50);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-900 rounded-lg p-12 text-center">
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <div className="text-slate-400">No data available</div>
          </div>
        )}
      </div>
    </div>
  );
}
