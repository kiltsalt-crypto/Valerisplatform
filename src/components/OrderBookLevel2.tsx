import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { getRealtimeQuote } from '../lib/marketData';

interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export default function OrderBookLevel2() {
  const [symbol, setSymbol] = useState('AAPL');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [spread, setSpread] = useState(0);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [symbol]);

  const loadData = async () => {
    const quote = await getRealtimeQuote(symbol);
    if (!quote) return;

    setCurrentPrice(quote.price);

    const bidLevels: OrderBookLevel[] = [];
    const askLevels: OrderBookLevel[] = [];
    let bidTotal = 0;
    let askTotal = 0;

    for (let i = 0; i < 15; i++) {
      const bidPrice = quote.price - (i + 1) * 0.01;
      const bidSize = Math.floor(Math.random() * 5000) + 100;
      bidTotal += bidSize;
      bidLevels.push({ price: bidPrice, size: bidSize, total: bidTotal });

      const askPrice = quote.price + (i + 1) * 0.01;
      const askSize = Math.floor(Math.random() * 5000) + 100;
      askTotal += askSize;
      askLevels.push({ price: askPrice, size: askSize, total: askTotal });
    }

    setBids(bidLevels);
    setAsks(askLevels);
    setSpread(askLevels[0].price - bidLevels[0].price);
  };

  const maxBidSize = Math.max(...bids.map(b => b.size));
  const maxAskSize = Math.max(...asks.map(a => a.size));

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-emerald-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Level 2 Order Book</h2>
            <p className="text-slate-400 text-sm">Simulated market depth visualization</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Symbol"
            className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none w-32"
          />
          {currentPrice && (
            <>
              <div className="text-white font-bold text-xl">
                ${currentPrice.toFixed(2)}
              </div>
              <div className="text-slate-400 text-sm">
                Spread: ${spread.toFixed(2)}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-700 rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800 text-slate-400 text-xs font-semibold">
              <div className="text-right">Price</div>
              <div className="text-right">Size</div>
              <div className="text-right">Total</div>
            </div>

            <div className="divide-y divide-slate-600">
              {asks.slice().reverse().map((ask, index) => (
                <div
                  key={`ask-${index}`}
                  className="grid grid-cols-3 gap-2 p-2 relative group hover:bg-slate-600 transition"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-red-900/20"
                    style={{ width: `${(ask.size / maxAskSize) * 100}%` }}
                  />
                  <div className="text-red-400 text-sm font-mono text-right z-10">
                    ${ask.price.toFixed(2)}
                  </div>
                  <div className="text-slate-300 text-sm font-mono text-right z-10">
                    {ask.size.toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm font-mono text-right z-10">
                    {ask.total.toLocaleString()}
                  </div>
                </div>
              ))}

              <div className="p-3 bg-slate-800 text-center">
                {currentPrice && (
                  <div className="text-2xl font-bold text-white">
                    ${currentPrice.toFixed(2)}
                  </div>
                )}
              </div>

              {bids.map((bid, index) => (
                <div
                  key={`bid-${index}`}
                  className="grid grid-cols-3 gap-2 p-2 relative group hover:bg-slate-600 transition"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-green-900/20"
                    style={{ width: `${(bid.size / maxBidSize) * 100}%` }}
                  />
                  <div className="text-green-400 text-sm font-mono text-right z-10">
                    ${bid.price.toFixed(2)}
                  </div>
                  <div className="text-slate-300 text-sm font-mono text-right z-10">
                    {bid.size.toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm font-mono text-right z-10">
                    {bid.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Bid Depth
            </h3>
            <div style={{ height: '300px' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 300">
                {bids.map((bid, index) => {
                  const y = (index / bids.length) * 300;
                  const width = (bid.total / bids[bids.length - 1].total) * 200;
                  return (
                    <rect
                      key={index}
                      x="0"
                      y={y}
                      width={width}
                      height={300 / bids.length}
                      fill="#10b981"
                      opacity="0.6"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="mt-2 text-slate-400 text-sm">
              Total: {bids[bids.length - 1]?.total.toLocaleString()} shares
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Ask Depth
            </h3>
            <div style={{ height: '300px' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 300">
                {asks.map((ask, index) => {
                  const y = (index / asks.length) * 300;
                  const width = (ask.total / asks[asks.length - 1].total) * 200;
                  return (
                    <rect
                      key={index}
                      x="0"
                      y={y}
                      width={width}
                      height={300 / asks.length}
                      fill="#ef4444"
                      opacity="0.6"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="mt-2 text-slate-400 text-sm">
              Total: {asks[asks.length - 1]?.total.toLocaleString()} shares
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-6">
        <div className="text-blue-400 font-semibold mb-2">Simulated Data</div>
        <div className="text-slate-300 text-sm">
          This order book uses simulated data for educational purposes. Real Level 2 data requires exchange connections and specialized data feeds.
        </div>
      </div>
    </div>
  );
}
