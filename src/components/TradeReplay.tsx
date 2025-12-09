import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, PlayCircle, Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface ReplayCandle {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function TradeReplay() {
  const [selectedDate, setSelectedDate] = useState('2024-01-15');
  const [selectedInstrument, setSelectedInstrument] = useState('ES');
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replayData, setReplayData] = useState<ReplayCandle[]>([]);
  const [virtualPosition, setVirtualPosition] = useState<{type: 'long' | 'short', entry: number, size: number} | null>(null);
  const [virtualBalance, setVirtualBalance] = useState(100000);
  const [tradeLog, setTradeLog] = useState<Array<{time: Date, type: string, price: number, pnl?: number}>>([]);

  useEffect(() => {
    generateReplayData();
  }, [selectedDate, selectedInstrument]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= replayData.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, replayData.length]);

  const generateReplayData = () => {
    const candles: ReplayCandle[] = [];
    const startTime = new Date(`${selectedDate}T09:30:00`);
    let price = 4850;

    for (let i = 0; i < 390; i++) {
      const time = new Date(startTime.getTime() + i * 60000);
      const open = price;
      const change = (Math.random() - 0.5) * 5;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;

      candles.push({
        time,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 5000) + 2000
      });

      price = close;
    }

    setReplayData(candles);
    setCurrentIndex(0);
  };

  const enterLong = () => {
    if (virtualPosition || currentIndex >= replayData.length) return;
    const currentCandle = replayData[currentIndex];
    setVirtualPosition({ type: 'long', entry: currentCandle.close, size: 1 });
    setTradeLog([...tradeLog, { time: currentCandle.time, type: 'BUY', price: currentCandle.close }]);
  };

  const enterShort = () => {
    if (virtualPosition || currentIndex >= replayData.length) return;
    const currentCandle = replayData[currentIndex];
    setVirtualPosition({ type: 'short', entry: currentCandle.close, size: 1 });
    setTradeLog([...tradeLog, { time: currentCandle.time, type: 'SELL', price: currentCandle.close }]);
  };

  const closePosition = () => {
    if (!virtualPosition || currentIndex >= replayData.length) return;
    const currentCandle = replayData[currentIndex];
    const pnl = virtualPosition.type === 'long'
      ? (currentCandle.close - virtualPosition.entry) * 50 * virtualPosition.size
      : (virtualPosition.entry - currentCandle.close) * 50 * virtualPosition.size;

    setVirtualBalance(prev => prev + pnl);
    setTradeLog([...tradeLog, {
      time: currentCandle.time,
      type: 'CLOSE',
      price: currentCandle.close,
      pnl
    }]);
    setVirtualPosition(null);
  };

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    setVirtualPosition(null);
    setVirtualBalance(100000);
    setTradeLog([]);
  };

  const visibleCandles = replayData.slice(Math.max(0, currentIndex - 50), currentIndex + 1);
  const currentCandle = replayData[currentIndex];
  const currentPnL = virtualPosition && currentCandle
    ? (virtualPosition.type === 'long'
      ? (currentCandle.close - virtualPosition.entry) * 50 * virtualPosition.size
      : (virtualPosition.entry - currentCandle.close) * 50 * virtualPosition.size)
    : 0;

  const maxPrice = Math.max(...visibleCandles.map(c => c.high));
  const minPrice = Math.min(...visibleCandles.map(c => c.low));
  const priceRange = maxPrice - minPrice || 1;

  const getPriceY = (price: number) => {
    return ((maxPrice - price) / priceRange) * 300;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <PlayCircle className="w-7 h-7 text-purple-400" />
          Trade Replay
        </h1>
      </div>

      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-1 block">Instrument</label>
            <select
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="ES">E-mini S&P 500</option>
              <option value="NQ">E-mini Nasdaq</option>
              <option value="YM">E-mini Dow</option>
              <option value="RTY">E-mini Russell</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-1 block">Speed</label>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
              <option value={10}>10x</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-1 block">Virtual Balance</label>
            <div className={`text-lg font-bold ${virtualBalance >= 100000 ? 'text-green-400' : 'text-red-400'}`}>
              ${virtualBalance.toLocaleString()}
            </div>
          </div>
        </div>

        {currentCandle && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Time</p>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" />
                <p className="text-white font-semibold text-sm">{currentCandle.time.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Price</p>
              <p className="text-white font-bold">{currentCandle.close.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Volume</p>
              <p className="text-white font-semibold">{currentCandle.volume.toLocaleString()}</p>
            </div>
            {virtualPosition && (
              <>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Position</p>
                  <p className={`font-bold ${virtualPosition.type === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                    {virtualPosition.type.toUpperCase()} @ {virtualPosition.entry.toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Unrealized P&L</p>
                  <p className={`font-bold ${currentPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${currentPnL.toFixed(2)}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 mb-4">
          <svg width="100%" height="300">
            {visibleCandles.map((candle, i) => {
              const x = (i / visibleCandles.length) * 100;
              const candleWidth = 100 / visibleCandles.length * 0.6;
              const isGreen = candle.close >= candle.open;

              return (
                <g key={i}>
                  <line
                    x1={`${x}%`}
                    y1={getPriceY(candle.high)}
                    x2={`${x}%`}
                    y2={getPriceY(candle.low)}
                    stroke={isGreen ? '#10b981' : '#ef4444'}
                    strokeWidth="1"
                  />
                  <rect
                    x={`${x - candleWidth / 2}%`}
                    y={Math.min(getPriceY(candle.open), getPriceY(candle.close))}
                    width={`${candleWidth}%`}
                    height={Math.abs(getPriceY(candle.close) - getPriceY(candle.open)) || 1}
                    fill={isGreen ? '#10b981' : '#ef4444'}
                  />
                </g>
              );
            })}
            {virtualPosition && (
              <line
                x1="0"
                y1={getPriceY(virtualPosition.entry)}
                x2="100%"
                y2={getPriceY(virtualPosition.entry)}
                stroke={virtualPosition.type === 'long' ? '#10b981' : '#ef4444'}
                strokeWidth="2"
                strokeDasharray="4"
              />
            )}
          </svg>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={reset}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 10))}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(replayData.length - 1, currentIndex + 10))}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={enterLong}
            disabled={!!virtualPosition}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
          >
            <TrendingUp className="w-5 h-5" />
            Buy Long
          </button>
          <button
            onClick={enterShort}
            disabled={!!virtualPosition}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
          >
            <TrendingDown className="w-5 h-5" />
            Sell Short
          </button>
          {virtualPosition && (
            <button
              onClick={closePosition}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition font-semibold"
            >
              Close Position
            </button>
          )}
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-white font-semibold mb-3">Trade Log</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tradeLog.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No trades yet. Practice trading during replay!</p>
          ) : (
            tradeLog.map((trade, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' :
                    trade.type === 'SELL' ? 'bg-red-500/20 text-red-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {trade.type}
                  </span>
                  <span className="text-white text-sm">{trade.time.toLocaleTimeString()}</span>
                  <span className="text-slate-400 text-sm">@ ${trade.price.toFixed(2)}</span>
                </div>
                {trade.pnl !== undefined && (
                  <span className={`font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
