import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Newspaper, TrendingUp, TrendingDown, AlertCircle, Calendar, Globe, Filter, RefreshCw, Clock } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  source_url: string;
  category: string;
  sentiment: string;
  impact_level: string;
  published_at: string;
  related_instruments: string[];
}

interface EconomicEvent {
  id: string;
  event_name: string;
  country: string;
  impact: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  event_date: string;
  created_at: string;
}

const generateRealisticNews = (): Omit<NewsItem, 'id'>[] => {
  const now = Date.now();
  const headlines = [
    {
      title: 'Federal Reserve Officials Signal Cautious Approach to Rate Cuts',
      summary: 'Fed members emphasize data-dependent approach as inflation remains above target, markets adjust rate cut expectations.',
      source: 'Reuters',
      source_url: 'https://reuters.com',
      category: 'central_banks',
      sentiment: 'neutral',
      impact_level: 'high',
      related_instruments: ['ES', 'NQ', 'ZB', 'ZN']
    },
    {
      title: 'Crude Oil Surges 4% on Middle East Supply Concerns',
      summary: 'WTI and Brent crude prices jump amid geopolitical tensions affecting major shipping routes through the region.',
      source: 'Bloomberg',
      source_url: 'https://bloomberg.com',
      category: 'futures',
      sentiment: 'bullish',
      impact_level: 'high',
      related_instruments: ['CL', 'NG']
    },
    {
      title: 'Tech Giants Rally on Strong Cloud Revenue Growth',
      summary: 'Major technology companies beat earnings expectations driven by enterprise cloud adoption and AI investments.',
      source: 'CNBC',
      source_url: 'https://cnbc.com',
      category: 'stocks',
      sentiment: 'bullish',
      impact_level: 'medium',
      related_instruments: ['NQ', 'AAPL', 'MSFT', 'GOOGL']
    },
    {
      title: 'Gold Hits Fresh Multi-Month High on Dollar Weakness',
      summary: 'Precious metals gain as U.S. dollar retreats, safe-haven demand increases amid global economic uncertainty.',
      source: 'MarketWatch',
      source_url: 'https://marketwatch.com',
      category: 'futures',
      sentiment: 'bullish',
      impact_level: 'medium',
      related_instruments: ['GC', 'SI']
    },
    {
      title: 'S&P 500 Companies Report 12% Earnings Growth',
      summary: 'Corporate America continues strong performance with 78% of companies beating analyst estimates this quarter.',
      source: 'Wall Street Journal',
      source_url: 'https://wsj.com',
      category: 'earnings',
      sentiment: 'bullish',
      impact_level: 'high',
      related_instruments: ['ES', 'SPY', 'YM']
    },
    {
      title: 'European Central Bank Holds Rates Steady',
      summary: 'ECB maintains current policy stance, citing balanced risks between inflation and growth concerns.',
      source: 'Financial Times',
      source_url: 'https://ft.com',
      category: 'central_banks',
      sentiment: 'neutral',
      impact_level: 'medium',
      related_instruments: ['6E', 'ES']
    },
    {
      title: 'Natural Gas Futures Decline on Mild Weather Forecast',
      summary: 'NYMEX natural gas falls 6% as warmer-than-expected temperatures reduce heating demand across key regions.',
      source: 'Bloomberg',
      source_url: 'https://bloomberg.com',
      category: 'futures',
      sentiment: 'bearish',
      impact_level: 'medium',
      related_instruments: ['NG']
    },
    {
      title: 'Nasdaq Futures Jump 1.5% on Tech Earnings Optimism',
      summary: 'Technology sector leads pre-market gains as semiconductor companies report strong demand for AI chips.',
      source: 'Reuters',
      source_url: 'https://reuters.com',
      category: 'stocks',
      sentiment: 'bullish',
      impact_level: 'high',
      related_instruments: ['NQ', 'NVDA', 'AMD']
    },
    {
      title: 'Treasury Yields Rise After Strong Jobs Data',
      summary: 'Bond yields climb as robust employment numbers reduce expectations for aggressive Fed rate cuts.',
      source: 'MarketWatch',
      source_url: 'https://marketwatch.com',
      category: 'economy',
      sentiment: 'bearish',
      impact_level: 'high',
      related_instruments: ['ZB', 'ZN', 'TLT']
    },
    {
      title: 'Chinese Manufacturing PMI Beats Expectations',
      summary: 'China\'s factory activity shows signs of recovery, boosting global growth optimism and commodity prices.',
      source: 'Bloomberg',
      source_url: 'https://bloomberg.com',
      category: 'economy',
      sentiment: 'bullish',
      impact_level: 'medium',
      related_instruments: ['ES', 'NQ', 'CL']
    },
    {
      title: 'Cryptocurrency Market Rallies on Institutional Adoption',
      summary: 'Digital assets surge as major financial institutions announce expanded crypto trading services.',
      source: 'CoinDesk',
      source_url: 'https://coindesk.com',
      category: 'crypto',
      sentiment: 'bullish',
      impact_level: 'medium',
      related_instruments: ['BTC', 'ETH']
    },
    {
      title: 'Retail Sales Data Shows Consumer Resilience',
      summary: 'U.S. retail sales exceed forecasts, indicating strong consumer spending despite higher interest rates.',
      source: 'CNBC',
      source_url: 'https://cnbc.com',
      category: 'economy',
      sentiment: 'bullish',
      impact_level: 'high',
      related_instruments: ['ES', 'SPY', 'DIA']
    },
    {
      title: 'Energy Sector Outperforms Amid Supply Constraints',
      summary: 'Oil and gas stocks lead market gains as production cuts and strong demand support higher prices.',
      source: 'Reuters',
      source_url: 'https://reuters.com',
      category: 'stocks',
      sentiment: 'bullish',
      impact_level: 'medium',
      related_instruments: ['XLE', 'CL', 'XOM', 'CVX']
    },
    {
      title: 'Bank of Japan Adjusts Yield Curve Control Policy',
      summary: 'BOJ modifies its monetary framework, allowing more flexibility in long-term interest rates.',
      source: 'Financial Times',
      source_url: 'https://ft.com',
      category: 'central_banks',
      sentiment: 'neutral',
      impact_level: 'high',
      related_instruments: ['6J', 'NQ']
    },
    {
      title: 'Agricultural Commodities Rally on Weather Concerns',
      summary: 'Grain and soybean futures surge as drought conditions threaten crop yields in major producing regions.',
      source: 'Wall Street Journal',
      source_url: 'https://wsj.com',
      category: 'futures',
      sentiment: 'bullish',
      impact_level: 'low',
      related_instruments: ['ZC', 'ZS']
    }
  ];

  return headlines.map((headline, i) => ({
    ...headline,
    content: headline.summary + ' Industry analysts expect continued volatility as market participants assess the implications.',
    published_at: new Date(now - (i * 1800000)).toISOString()
  }));
};

export default function MarketNews() {
  const { profile } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextRefresh, setNextRefresh] = useState(60);

  useEffect(() => {
    initializeNewsData();
    fetchLiveNews();

    const refreshInterval = setInterval(() => {
      fetchLiveNews();
    }, 60000);

    const countdownInterval = setInterval(() => {
      setNextRefresh(prev => prev > 0 ? prev - 1 : 60);
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  useEffect(() => {
    loadNews();
  }, [filterCategory, filterImpact]);

  const initializeNewsData = async () => {
    await loadNews();
    await loadEvents();
    await seedSampleData();
  };

  const fetchLiveNews = async () => {
    try {
      console.log('Fetching live news from edge function...');
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-market-news`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('News API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('News API result:', result);

        if (result.success && result.data && result.data.length > 0) {
          console.log(`Inserting ${result.data.length} news items into database...`);
          const { error: insertError } = await supabase.from('market_news').insert(result.data);

          if (insertError) {
            console.error('Error inserting news:', insertError);
          } else {
            console.log('News items inserted successfully');
          }

          await loadNews();
        } else {
          console.warn('No news data received from API');
        }
      } else {
        console.error('News API returned error status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching live news:', error);
    }
  };

  const seedSampleData = async () => {
    const { count: newsCount } = await supabase
      .from('market_news')
      .select('*', { count: 'exact', head: true });

    if (newsCount === 0) {
      const newsItems = generateRealisticNews();
      await supabase.from('market_news').insert(newsItems);
    }

    const { count: eventsCount } = await supabase
      .from('economic_events')
      .select('*', { count: 'exact', head: true });

    if (eventsCount === 0) {
      const sampleEvents = [
        {
          event_name: 'US Non-Farm Payrolls',
          country: 'United States',
          impact: 'high',
          actual: null,
          forecast: '200K',
          previous: '185K',
          event_date: new Date(Date.now() + 86400000).toISOString()
        },
        {
          event_name: 'FOMC Meeting Decision',
          country: 'United States',
          impact: 'high',
          actual: null,
          forecast: '5.50%',
          previous: '5.50%',
          event_date: new Date(Date.now() + 172800000).toISOString()
        },
        {
          event_name: 'US CPI (Consumer Price Index)',
          country: 'United States',
          impact: 'high',
          actual: null,
          forecast: '3.2% YoY',
          previous: '3.4% YoY',
          event_date: new Date(Date.now() + 259200000).toISOString()
        },
        {
          event_name: 'EIA Crude Oil Inventories',
          country: 'United States',
          impact: 'medium',
          actual: null,
          forecast: '-2.5M barrels',
          previous: '-3.2M barrels',
          event_date: new Date(Date.now() + 3600000).toISOString()
        },
        {
          event_name: 'ECB Interest Rate Decision',
          country: 'Eurozone',
          impact: 'high',
          actual: null,
          forecast: '4.00%',
          previous: '4.00%',
          event_date: new Date(Date.now() + 432000000).toISOString()
        },
        {
          event_name: 'Bank of Japan Policy Decision',
          country: 'Japan',
          impact: 'high',
          actual: null,
          forecast: '-0.10%',
          previous: '-0.10%',
          event_date: new Date(Date.now() + 518400000).toISOString()
        },
        {
          event_name: 'US GDP Growth Rate',
          country: 'United States',
          impact: 'high',
          actual: null,
          forecast: '2.8% QoQ',
          previous: '3.2% QoQ',
          event_date: new Date(Date.now() + 604800000).toISOString()
        },
        {
          event_name: 'China Manufacturing PMI',
          country: 'China',
          impact: 'medium',
          actual: null,
          forecast: '50.5',
          previous: '50.2',
          event_date: new Date(Date.now() + 691200000).toISOString()
        }
      ];

      await supabase.from('economic_events').insert(sampleEvents);
    }
  };

  const refreshNews = async () => {
    setIsRefreshing(true);
    await fetchLiveNews();
    setLastUpdate(new Date());
    setNextRefresh(60);
    setIsRefreshing(false);
  };

  const loadNews = async () => {
    let query = supabase
      .from('market_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50);

    if (filterCategory !== 'all') {
      query = query.eq('category', filterCategory);
    }

    if (filterImpact !== 'all') {
      query = query.eq('impact_level', filterImpact);
    }

    const { data } = await query;
    if (data) setNews(data);
  };

  const loadEvents = async () => {
    const { data } = await supabase
      .from('economic_events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(20);

    if (data) setEvents(data);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatNextRefresh = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Globe className="w-7 h-7 text-blue-400" />
            Global Market News
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-semibold">LIVE</span>
            </div>
          </h1>
          <p className="text-slate-400 text-sm">Auto-updates every minute from Reuters, Bloomberg, CNBC, MarketWatch & more</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <p className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Next update in: <span className="text-white font-mono">{formatNextRefresh(nextRefresh)}</span>
            </p>
            <p className="text-slate-500 text-xs">Last: {lastUpdate.toLocaleTimeString()}</p>
          </div>
          <button
            onClick={refreshNews}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'news'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span className="text-sm font-semibold">Breaking News</span>
          <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{news.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-semibold">Economic Calendar</span>
          <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{events.length}</span>
        </button>
      </div>

      {activeTab === 'news' && (
        <>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <Filter className="w-4 h-4 text-blue-400" />
              <span className="text-white font-semibold text-sm">Filters</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="futures">Futures & Commodities</option>
                <option value="stocks">Stocks & Equities</option>
                <option value="economy">Economic Data</option>
                <option value="central_banks">Central Banks</option>
                <option value="earnings">Corporate Earnings</option>
                <option value="crypto">Cryptocurrency</option>
              </select>
              <select
                value={filterImpact}
                onChange={(e) => setFilterImpact(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Impact Levels</option>
                <option value="critical">Critical Impact</option>
                <option value="high">High Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="low">Low Impact</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {news.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Loading latest market news...</p>
              </div>
            ) : (
              news.map((item) => (
                <div key={item.id} className="glass-card p-4 hover:bg-slate-800/50 transition border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSentimentIcon(item.sentiment)}
                        <h3 className="text-white font-semibold text-lg hover:text-blue-400 transition cursor-pointer">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-slate-300 text-sm mb-3 leading-relaxed">{item.summary}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-blue-400 text-xs font-semibold">{item.source}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500 text-xs">
                          {formatTimeAgo(item.published_at)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs border font-semibold ${getImpactColor(item.impact_level)}`}>
                          {item.impact_level.toUpperCase()}
                        </span>
                        {item.related_instruments.length > 0 && (
                          <>
                            <span className="text-slate-600">•</span>
                            <div className="flex items-center gap-1">
                              {item.related_instruments.slice(0, 4).map(inst => (
                                <span key={inst} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono font-semibold">
                                  {inst}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'events' && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No upcoming economic events</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="glass-card p-4 border-l-4 border-l-orange-500">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <h3 className="text-white font-semibold text-lg">{event.event_name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        event.impact === 'high'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                          : event.impact === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/50'
                      }`}>
                        {event.impact.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Forecast</p>
                        <p className="text-blue-400 font-bold text-sm font-mono">{event.forecast || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Previous</p>
                        <p className="text-slate-300 font-bold text-sm font-mono">{event.previous || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Actual</p>
                        <p className="text-green-400 font-bold text-sm font-mono">{event.actual || 'TBA'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-orange-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.event_date).toLocaleString()}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{event.country}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
