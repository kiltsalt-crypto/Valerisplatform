import { useState, useEffect } from 'react';
import { Bell, Plus, X, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { getRealtimeQuote } from '../lib/marketData';

interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice?: number;
  triggered: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    const checkAlerts = async () => {
      for (const alert of alerts) {
        if (alert.triggered) continue;

        const quote = await getRealtimeQuote(alert.symbol);
        if (!quote) continue;

        const shouldTrigger =
          (alert.condition === 'above' && quote.price >= alert.targetPrice) ||
          (alert.condition === 'below' && quote.price <= alert.targetPrice);

        if (shouldTrigger) {
          setAlerts(prev =>
            prev.map(a =>
              a.id === alert.id
                ? { ...a, triggered: true, triggeredAt: new Date(), currentPrice: quote.price }
                : a
            )
          );

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Price Alert: ${alert.symbol}`, {
              body: `${alert.symbol} is now ${alert.condition} $${alert.targetPrice} at $${quote.price.toFixed(2)}`,
              icon: '/favicon.svg',
            });
          }

          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuFzvLTgjMGFm7A7+OZQQ0Ybrzu2LJcEgxEn+DyvmwhBSuFzvLTgjMGFm7A7+OZQQ0Ybrzu2LJcEg==');
          audio.play().catch(() => {});
        }
      }
    };

    const interval = setInterval(checkAlerts, 3000);
    return () => clearInterval(interval);
  }, [alerts]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (symbol) {
      const fetchPrice = async () => {
        const quote = await getRealtimeQuote(symbol);
        if (quote) setCurrentPrice(quote.price);
      };
      fetchPrice();
    }
  }, [symbol]);

  const addAlert = () => {
    if (!symbol || !targetPrice) return;

    const newAlert: Alert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      targetPrice: parseFloat(targetPrice),
      condition,
      triggered: false,
      createdAt: new Date(),
    };

    setAlerts(prev => [newAlert, ...prev]);
    setShowForm(false);
    setSymbol('');
    setTargetPrice('');
    setCurrentPrice(null);
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Price Alerts</h2>
            <p className="text-slate-400 text-sm">Get notified when prices hit your targets</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Alert'}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-700 rounded-lg p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Create Price Alert</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
                className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {currentPrice && (
                <div className="text-slate-400 text-sm mt-1">
                  Current price: ${currentPrice.toFixed(2)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Condition</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCondition('above')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                    condition === 'above'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Above
                </button>
                <button
                  onClick={() => setCondition('below')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                    condition === 'below'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  Below
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Target Price</label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={addAlert}
              disabled={!symbol || !targetPrice}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Alert
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-white font-semibold mb-4">
            Active Alerts ({activeAlerts.length})
          </h3>
          {activeAlerts.length === 0 ? (
            <div className="bg-slate-700 rounded-lg p-8 text-center text-slate-400">
              No active alerts. Create one to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      alert.condition === 'above' ? 'bg-green-600/20' : 'bg-red-600/20'
                    }`}>
                      {alert.condition === 'above' ? (
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{alert.symbol}</div>
                      <div className="text-slate-400 text-sm">
                        Alert when {alert.condition} ${alert.targetPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-slate-400 hover:text-red-400 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {triggeredAlerts.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-4">
              Triggered Alerts ({triggeredAlerts.length})
            </h3>
            <div className="space-y-2">
              {triggeredAlerts.map((alert) => (
                <div key={alert.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between border border-green-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-green-600/20">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{alert.symbol}</div>
                      <div className="text-slate-400 text-sm">
                        Hit ${alert.targetPrice.toFixed(2)} at ${alert.currentPrice?.toFixed(2)}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {alert.triggeredAt?.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-slate-400 hover:text-red-400 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
