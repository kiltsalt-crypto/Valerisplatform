import { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, AlertCircle, DollarSign, Clock } from 'lucide-react';

interface EconomicEvent {
  date: string;
  time: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  actual: string;
  forecast: string;
  previous: string;
}

interface TradeImpact {
  tradeId: string;
  date: string;
  symbol: string;
  pnl: number;
  relatedEvent: string;
  correlation: number;
}

export default function EconomicImpact() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const [selectedImpact, setSelectedImpact] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const economicEvents: EconomicEvent[] = [
    { date: '2024-01-22', time: '08:30', event: 'Non-Farm Payrolls', impact: 'high', actual: '216K', forecast: '170K', previous: '199K' },
    { date: '2024-01-22', time: '10:00', event: 'ISM Manufacturing', impact: 'high', actual: '49.1', forecast: '47.0', previous: '47.4' },
    { date: '2024-01-21', time: '08:30', event: 'Initial Jobless Claims', impact: 'medium', actual: '214K', forecast: '200K', previous: '187K' },
    { date: '2024-01-20', time: '10:30', event: 'Crude Oil Inventories', impact: 'medium', actual: '-9.2M', forecast: '-1.5M', previous: '+1.3M' },
    { date: '2024-01-19', time: '14:00', event: 'FOMC Meeting Minutes', impact: 'high', actual: '', forecast: '', previous: '' },
  ];

  const tradeImpacts: TradeImpact[] = [
    { tradeId: '1', date: '2024-01-22', symbol: 'ES', pnl: -450, relatedEvent: 'Non-Farm Payrolls', correlation: 95 },
    { tradeId: '2', date: '2024-01-22', symbol: 'NQ', pnl: -380, relatedEvent: 'Non-Farm Payrolls', correlation: 92 },
    { tradeId: '3', date: '2024-01-21', symbol: 'ES', pnl: 320, relatedEvent: 'Initial Jobless Claims', correlation: 78 },
    { tradeId: '4', date: '2024-01-20', symbol: 'CL', pnl: 580, relatedEvent: 'Crude Oil Inventories', correlation: 98 },
    { tradeId: '5', date: '2024-01-19', symbol: 'ES', pnl: -290, relatedEvent: 'FOMC Minutes', correlation: 88 },
  ];

  const newsImpactedTrades = tradeImpacts.filter(t => t.correlation >= 70);
  const totalImpact = newsImpactedTrades.reduce((sum, t) => sum + t.pnl, 0);
  const avgCorrelation = newsImpactedTrades.reduce((sum, t) => sum + t.correlation, 0) / newsImpactedTrades.length;

  const recommendations = [
    { type: 'avoid', event: 'Non-Farm Payrolls', reason: '2 out of 3 trades resulted in losses', avgLoss: -415 },
    { type: 'opportunity', event: 'Crude Oil Inventories', reason: '85% win rate on CL during this event', avgWin: 520 },
    { type: 'caution', event: 'FOMC Minutes', reason: 'High volatility - 60% loss rate', avgLoss: -315 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-7 h-7 text-purple-400" />
          Economic Impact Analyzer
        </h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">News-Impacted Trades</p>
            <AlertCircle className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{newsImpactedTrades.length}</p>
          <p className="text-slate-500 text-xs">Out of {tradeImpacts.length} total trades</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Impact P&L</p>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <p className={`text-2xl font-bold mb-1 ${totalImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalImpact >= 0 ? '+' : ''}${totalImpact.toFixed(0)}
          </p>
          <p className="text-slate-500 text-xs">From economic events</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Avg Correlation</p>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{avgCorrelation.toFixed(0)}%</p>
          <p className="text-slate-500 text-xs">Event-to-trade impact</p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Recent Economic Events</h3>
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'low'].map(level => (
              <button
                key={level}
                onClick={() => setSelectedImpact(level as any)}
                className={`px-3 py-1 rounded text-xs transition ${
                  selectedImpact === level
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {economicEvents
            .filter(event => selectedImpact === 'all' || event.impact === selectedImpact)
            .map((event, i) => (
              <div key={i} className="bg-slate-800/50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        event.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        event.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {event.impact.toUpperCase()}
                      </span>
                      <h4 className="text-white font-semibold">{event.event}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{event.time} ET</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-700">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Actual</p>
                    <p className="text-white font-semibold">{event.actual || 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Forecast</p>
                    <p className="text-slate-400 font-semibold">{event.forecast || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Previous</p>
                    <p className="text-slate-400 font-semibold">{event.previous || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-white font-semibold mb-4">Event-Related Trade Performance</h3>
        <div className="space-y-2">
          {tradeImpacts.map((trade) => (
            <div key={trade.tradeId} className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-white font-semibold">{trade.symbol}</p>
                    <p className="text-slate-400 text-sm">{trade.date}</p>
                  </div>
                  <div className="px-3 py-1 bg-slate-700 rounded">
                    <p className="text-slate-400 text-xs">Related Event</p>
                    <p className="text-white text-sm font-semibold">{trade.relatedEvent}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">Correlation</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${trade.correlation}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm">{trade.correlation}%</span>
                    </div>
                  </div>
                  <div className={`text-right min-w-24 ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <p className="text-2xl font-bold">
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-white font-semibold mb-4">AI Recommendations</h3>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border-l-4 ${
                rec.type === 'avoid' ? 'bg-red-500/10 border-red-500' :
                rec.type === 'opportunity' ? 'bg-green-500/10 border-green-500' :
                'bg-yellow-500/10 border-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {rec.type === 'avoid' ? <AlertCircle className="w-5 h-5 text-red-400" /> :
                   rec.type === 'opportunity' ? <TrendingUp className="w-5 h-5 text-green-400" /> :
                   <TrendingDown className="w-5 h-5 text-yellow-400" />}
                  <h4 className={`font-semibold ${
                    rec.type === 'avoid' ? 'text-red-400' :
                    rec.type === 'opportunity' ? 'text-green-400' :
                    'text-yellow-400'
                  }`}>
                    {rec.type === 'avoid' ? 'Avoid Trading' :
                     rec.type === 'opportunity' ? 'Trading Opportunity' :
                     'Trade with Caution'}
                  </h4>
                </div>
                <span className="text-white font-bold">
                  {rec.type === 'opportunity' ? `Avg +$${rec.avgWin}` : `Avg $${rec.avgLoss}`}
                </span>
              </div>
              <p className="text-white font-semibold mb-1">{rec.event}</p>
              <p className="text-slate-400 text-sm">{rec.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
