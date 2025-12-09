import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

type EconomicEvent = {
  id: string;
  event_date: string;
  event_name: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  created_at: string;
};

export default function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('economic_events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date');

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    setEvents(data || []);
    setLoading(false);
  };

  const filteredEvents = events.filter(event =>
    filter === 'all' || event.impact === filter
  );

  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = new Date(event.event_date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, EconomicEvent[]>);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-400 bg-red-500/20 border-red-500';
      case 'medium':
        return 'text-orange-400 bg-orange-500/20 border-orange-500';
      case 'low':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Economic Calendar</h1>
        <p className="text-slate-400">Know when to trade and when to stay away</p>
      </div>

      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/50 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Trading During High-Impact News</h2>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span><strong>Avoid trading 30 minutes before and after</strong> high-impact events</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Spreads widen dramatically during volatile news</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Your stop loss may not protect you during fast markets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Wait for price action to settle before entering trades</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-slate-300 font-semibold">Filter by Impact:</span>
          <div className="flex gap-2">
            {(['all', 'high', 'medium', 'low'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition ${
                  filter === level
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {Object.keys(groupedEvents).length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Events</h3>
          <p className="text-slate-400">Check back later for economic calendar updates</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                {date}
              </h2>

              <div className="space-y-4">
                {dateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getImpactColor(
                              event.impact
                            )}`}
                          >
                            {event.impact} impact
                          </span>
                          <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-semibold">
                            {event.country}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{event.event_name}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Clock className="w-4 h-4" />
                          {new Date(event.event_date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400 mb-1">Previous</div>
                        <div className="text-white font-semibold">
                          {event.previous || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Forecast</div>
                        <div className="text-white font-semibold">
                          {event.forecast || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Actual</div>
                        <div className="text-white font-semibold">
                          {event.actual || 'Pending'}
                        </div>
                      </div>
                    </div>

                    {event.impact === 'high' && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-400">
                          <strong>Warning:</strong> Avoid trading 30 minutes before and after this event
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Major Market-Moving Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-blue-400 mb-2">Monthly Events:</div>
            <ul className="space-y-1 text-slate-300">
              <li>• Non-Farm Payrolls (1st Friday)</li>
              <li>• FOMC Meeting (8 times/year)</li>
              <li>• CPI Report (mid-month)</li>
              <li>• Retail Sales (mid-month)</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-blue-400 mb-2">Weekly Events:</div>
            <ul className="space-y-1 text-slate-300">
              <li>• Jobless Claims (Thursday 8:30 AM ET)</li>
              <li>• PMI Manufacturing (Monthly)</li>
              <li>• Consumer Confidence</li>
              <li>• Fed Speeches</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
