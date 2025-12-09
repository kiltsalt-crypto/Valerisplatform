import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Activity } from 'lucide-react';

export default function TradingHeatMap() {
  const { user } = useAuth();
  const [heatMapData, setHeatMapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    if (user) {
      generateHeatMap();
    }
  }, [user]);

  const generateHeatMap = async () => {
    if (!user) return;

    const { data: trades } = await supabase
      .from('trades')
      .select('entry_date, profit_loss')
      .eq('user_id', user.id)
      .eq('status', 'closed');

    if (!trades) {
      setLoading(false);
      return;
    }

    const heatMap = new Map();

    trades.forEach(trade => {
      const date = new Date(trade.entry_date);
      const day = date.getDay();
      const hour = date.getHours();
      const key = `${day}-${hour}`;

      if (!heatMap.has(key)) {
        heatMap.set(key, {
          day,
          hour,
          count: 0,
          totalPnL: 0,
          wins: 0,
        });
      }

      const cell = heatMap.get(key);
      cell.count++;
      cell.totalPnL += trade.profit_loss;
      if (trade.profit_loss > 0) cell.wins++;
    });

    const dataArray = Array.from(heatMap.values());
    setHeatMapData(dataArray);
    setLoading(false);
  };

  const getCellData = (day: number, hour: number) => {
    return heatMapData.find(d => d.day === day && d.hour === hour);
  };

  const getColor = (cell: any) => {
    if (!cell || cell.count === 0) return 'bg-slate-700/30';

    const avgPnL = cell.totalPnL / cell.count;
    const winRate = cell.wins / cell.count;

    if (avgPnL > 50 && winRate > 0.6) return 'bg-emerald-500/80';
    if (avgPnL > 20 && winRate > 0.5) return 'bg-emerald-500/50';
    if (avgPnL > 0) return 'bg-emerald-500/30';
    if (avgPnL > -20) return 'bg-red-500/30';
    if (avgPnL > -50) return 'bg-red-500/50';
    return 'bg-red-500/80';
  };

  if (loading) {
    return <div className="text-slate-400 text-center py-8">Loading heat map...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8" />
          Trading Heat Map
        </h1>
        <p className="text-slate-400">Identify your best and worst trading times</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 overflow-x-auto">
        <div className="mb-6 flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-sm text-slate-400">Profitable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-slate-400">Unprofitable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-700 rounded"></div>
            <span className="text-sm text-slate-400">No trades</span>
          </div>
        </div>

        <div className="inline-block min-w-full">
          <div className="flex gap-1">
            <div className="w-12"></div>
            {hours.map(hour => (
              <div key={hour} className="w-8 text-xs text-slate-400 text-center">
                {hour}
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div key={day} className="flex gap-1 mt-1">
              <div className="w-12 text-sm text-slate-400 flex items-center">{day}</div>
              {hours.map(hour => {
                const cell = getCellData(dayIndex, hour);
                return (
                  <div
                    key={hour}
                    className={`w-8 h-8 rounded ${getColor(cell)} cursor-pointer hover:ring-2 hover:ring-white/50 transition-all group relative`}
                    title={cell ? `${cell.count} trades, $${cell.totalPnL.toFixed(2)}` : 'No trades'}
                  >
                    {cell && cell.count > 0 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs whitespace-nowrap shadow-xl">
                          <div className="text-white font-semibold mb-1">{day} at {hour}:00</div>
                          <div className="text-slate-300">Trades: {cell.count}</div>
                          <div className={cell.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            P/L: ${cell.totalPnL.toFixed(2)}
                          </div>
                          <div className="text-slate-400">
                            Win Rate: {((cell.wins / cell.count) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Insights</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• Darker colors indicate higher trade frequency</li>
            <li>• Green = profitable time slots</li>
            <li>• Red = unprofitable time slots</li>
            <li>• Hover over cells for detailed stats</li>
          </ul>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-emerald-400 mb-2">Best Times</h3>
          <p className="text-slate-300 text-sm">
            Focus on trading during your most profitable hours to maximize returns.
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-400 mb-2">Avoid These Times</h3>
          <p className="text-slate-300 text-sm">
            Consider avoiding time slots where you consistently lose money.
          </p>
        </div>
      </div>
    </div>
  );
}
