import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, X, AlertCircle } from 'lucide-react';
import { getRealtimeQuote } from '../lib/marketData';

interface Order {
  id: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopPrice?: number;
  filledPrice?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: Date;
}

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export default function TradeExecutionSimulator() {
  const [symbol, setSymbol] = useState('AAPL');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [cash, setCash] = useState(100000);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    const fetchPrice = async () => {
      const quote = await getRealtimeQuote(symbol);
      if (quote) {
        setCurrentPrice(quote.price);
        updatePositions(quote.price);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 2000);
    return () => clearInterval(interval);
  }, [symbol]);

  const updatePositions = (price: number) => {
    setPositions(prev =>
      prev.map(pos => {
        if (pos.symbol === symbol) {
          const pnl = (price - pos.avgPrice) * pos.quantity;
          const pnlPercent = ((price - pos.avgPrice) / pos.avgPrice) * 100;
          return { ...pos, currentPrice: price, pnl, pnlPercent };
        }
        return pos;
      })
    );
  };

  const placeOrder = (side: 'buy' | 'sell') => {
    if (!currentPrice) return;

    const order: Order = {
      id: Date.now().toString(),
      symbol,
      type: orderType,
      side,
      quantity,
      timestamp: new Date(),
      status: orderType === 'market' ? 'filled' : 'pending',
    };

    if (orderType === 'limit') {
      order.price = parseFloat(limitPrice);
    } else if (orderType === 'stop') {
      order.stopPrice = parseFloat(stopPrice);
    }

    if (orderType === 'market') {
      executeOrder(order, currentPrice);
    } else {
      setOrders(prev => [order, ...prev]);
    }

    setShowOrderForm(false);
    setLimitPrice('');
    setStopPrice('');
  };

  const executeOrder = (order: Order, fillPrice: number) => {
    const totalCost = fillPrice * order.quantity;

    if (order.side === 'buy') {
      if (cash < totalCost) {
        alert('Insufficient funds!');
        return;
      }
      setCash(prev => prev - totalCost);

      setPositions(prev => {
        const existing = prev.find(p => p.symbol === order.symbol);
        if (existing) {
          const newQty = existing.quantity + order.quantity;
          const newAvg = ((existing.avgPrice * existing.quantity) + (fillPrice * order.quantity)) / newQty;
          return prev.map(p =>
            p.symbol === order.symbol
              ? { ...p, quantity: newQty, avgPrice: newAvg }
              : p
          );
        }
        return [...prev, {
          symbol: order.symbol,
          quantity: order.quantity,
          avgPrice: fillPrice,
          currentPrice: fillPrice,
          pnl: 0,
          pnlPercent: 0,
        }];
      });
    } else {
      const position = positions.find(p => p.symbol === order.symbol);
      if (!position || position.quantity < order.quantity) {
        alert('Insufficient shares!');
        return;
      }

      setCash(prev => prev + totalCost);

      setPositions(prev =>
        prev.map(p => {
          if (p.symbol === order.symbol) {
            const newQty = p.quantity - order.quantity;
            return newQty > 0 ? { ...p, quantity: newQty } : null;
          }
          return p;
        }).filter(Boolean) as Position[]
      );
    }

    order.filledPrice = fillPrice;
    order.status = 'filled';
    setOrders(prev => [order, ...prev]);
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o)
    );
  };

  const totalValue = cash + positions.reduce((sum, pos) => sum + (pos.currentPrice * pos.quantity), 0);
  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Trade Execution Simulator</h2>
            <p className="text-slate-400 text-sm">Practice trading with virtual money</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Account Value</div>
          <div className="text-2xl font-bold text-white">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Cash Available</div>
          <div className="text-2xl font-bold text-white">${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Total P&L</div>
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
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
          {currentPrice && (
            <div className="text-white font-bold text-xl">
              ${currentPrice.toFixed(2)}
            </div>
          )}
        </div>

        {!showOrderForm ? (
          <div className="flex gap-4">
            <button
              onClick={() => { setOrderSide('buy'); setShowOrderForm(true); }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              <TrendingUp className="w-5 h-5" />
              Buy
            </button>
            <button
              onClick={() => { setOrderSide('sell'); setShowOrderForm(true); }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              <TrendingDown className="w-5 h-5" />
              Sell
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">
                {orderSide === 'buy' ? 'Buy' : 'Sell'} {symbol}
              </h3>
              <button
                onClick={() => setShowOrderForm(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              {(['market', 'limit', 'stop'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                    orderType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {orderType === 'limit' && (
              <div>
                <label className="block text-slate-400 text-sm mb-2">Limit Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder={currentPrice?.toFixed(2)}
                  className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {orderType === 'stop' && (
              <div>
                <label className="block text-slate-400 text-sm mb-2">Stop Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  placeholder={currentPrice?.toFixed(2)}
                  className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {currentPrice && (
              <div className="bg-slate-800 rounded-lg p-3 text-sm">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Estimated Total:</span>
                  <span className="text-white font-semibold">
                    ${(currentPrice * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => placeOrder(orderSide)}
              disabled={!currentPrice || (orderType === 'limit' && !limitPrice) || (orderType === 'stop' && !stopPrice)}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
                orderSide === 'buy'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Place {orderSide === 'buy' ? 'Buy' : 'Sell'} Order
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-white font-semibold mb-4">Positions</h3>
          <div className="space-y-2">
            {positions.length === 0 ? (
              <div className="bg-slate-700 rounded-lg p-4 text-center text-slate-400">
                No open positions
              </div>
            ) : (
              positions.map((pos) => (
                <div key={pos.symbol} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-white">{pos.symbol}</div>
                    <div className={`font-semibold ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} ({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-slate-400">Qty</div>
                      <div className="text-white">{pos.quantity}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Avg Cost</div>
                      <div className="text-white">${pos.avgPrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Current</div>
                      <div className="text-white">${pos.currentPrice.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {orders.length === 0 ? (
              <div className="bg-slate-700 rounded-lg p-4 text-center text-slate-400">
                No orders yet
              </div>
            ) : (
              orders.slice(0, 10).map((order) => (
                <div key={order.id} className="bg-slate-700 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        order.side === 'buy' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                      }`}>
                        {order.side.toUpperCase()}
                      </span>
                      <span className="text-white font-semibold">{order.symbol}</span>
                      <span className="text-slate-400">{order.quantity} shares</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        order.status === 'filled' ? 'bg-blue-600/20 text-blue-400' :
                        order.status === 'cancelled' ? 'bg-red-600/20 text-red-400' :
                        'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="text-slate-400 hover:text-red-400 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                    {order.filledPrice && ` @ $${order.filledPrice.toFixed(2)}`}
                    {order.price && ` @ $${order.price.toFixed(2)}`}
                    {order.stopPrice && ` stop @ $${order.stopPrice.toFixed(2)}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
