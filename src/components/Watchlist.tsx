import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Eye, Plus, X, TrendingUp, TrendingDown, Star, Search, Filter } from 'lucide-react';
import { ALL_INSTRUMENTS, searchInstruments, getInstrumentsByType, Instrument } from '../lib/instruments';
import { MarketQuote } from '../lib/marketData';
import { realtimeMarketData } from '../lib/realtimeMarketData';

interface Watchlist {
  id: string;
  name: string;
  instruments: string[];
}

export default function Watchlist() {
  const { profile } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlist, setActiveWatchlist] = useState<string | null>(null);
  const [showAddInstrument, setShowAddInstrument] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | Instrument['type']>('all');
  const [searchResults, setSearchResults] = useState<Instrument[]>([]);
  const [liveQuotes, setLiveQuotes] = useState<Map<string, MarketQuote>>(new Map());

  useEffect(() => {
    loadWatchlists();
  }, [profile]);

  useEffect(() => {
    if (activeWatchlist) {
      const watchlist = watchlists.find(w => w.id === activeWatchlist);
      if (watchlist && watchlist.instruments.length > 0) {
        const unsubscribers = watchlist.instruments.map(symbol =>
          realtimeMarketData.subscribe(symbol, (quote) => {
            setLiveQuotes(prev => new Map(prev).set(symbol, quote));
          })
        );

        return () => unsubscribers.forEach(unsub => unsub());
      }
    }
  }, [activeWatchlist, watchlists]);

  useEffect(() => {
    if (searchQuery) {
      const results = searchInstruments(searchQuery);
      const filtered = filterType === 'all' ? results : results.filter(i => i.type === filterType);
      setSearchResults(filtered.slice(0, 50));
    } else if (filterType !== 'all') {
      setSearchResults(getInstrumentsByType(filterType).slice(0, 50));
    } else {
      setSearchResults(ALL_INSTRUMENTS.slice(0, 50));
    }
  }, [searchQuery, filterType]);

  const loadWatchlists = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', profile.id)
      .order('sort_order');

    if (data && data.length > 0) {
      setWatchlists(data);
      setActiveWatchlist(data[0].id);
    } else {
      createDefaultWatchlist();
    }
  };

  const createDefaultWatchlist = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('watchlists')
      .insert({
        user_id: profile.id,
        name: 'My Watchlist',
        instruments: ['ES', 'NQ', 'CL', 'GC']
      })
      .select()
      .single();

    if (data) {
      setWatchlists([data]);
      setActiveWatchlist(data.id);
    }
  };

  const addInstrument = async (symbol: string) => {
    if (!activeWatchlist) return;

    const watchlist = watchlists.find(w => w.id === activeWatchlist);
    if (!watchlist || watchlist.instruments.includes(symbol)) return;

    const updatedInstruments = [...watchlist.instruments, symbol];

    await supabase
      .from('watchlists')
      .update({ instruments: updatedInstruments })
      .eq('id', activeWatchlist);

    setWatchlists(watchlists.map(w =>
      w.id === activeWatchlist ? { ...w, instruments: updatedInstruments } : w
    ));

    setShowAddInstrument(false);
  };

  const removeInstrument = async (symbol: string) => {
    if (!activeWatchlist) return;

    const watchlist = watchlists.find(w => w.id === activeWatchlist);
    if (!watchlist) return;

    const updatedInstruments = watchlist.instruments.filter(i => i !== symbol);

    await supabase
      .from('watchlists')
      .update({ instruments: updatedInstruments })
      .eq('id', activeWatchlist);

    setWatchlists(watchlists.map(w =>
      w.id === activeWatchlist ? { ...w, instruments: updatedInstruments } : w
    ));
  };

  const createWatchlist = async () => {
    if (!profile || !newWatchlistName.trim()) return;

    const { data } = await supabase
      .from('watchlists')
      .insert({
        user_id: profile.id,
        name: newWatchlistName,
        instruments: [],
        sort_order: watchlists.length
      })
      .select()
      .single();

    if (data) {
      setWatchlists([...watchlists, data]);
      setActiveWatchlist(data.id);
      setNewWatchlistName('');
    }
  };

  const currentWatchlist = watchlists.find(w => w.id === activeWatchlist);
  const watchedInstruments = ALL_INSTRUMENTS.filter(i =>
    currentWatchlist?.instruments.includes(i.symbol)
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Eye className="w-7 h-7 text-purple-400" />
          Watchlists
        </h1>
        <p className="text-slate-400 text-sm">Track your favorite instruments</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {watchlists.map(watchlist => (
          <button
            key={watchlist.id}
            onClick={() => setActiveWatchlist(watchlist.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              activeWatchlist === watchlist.id
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {watchlist.name}
          </button>
        ))}

        {watchlists.length < 5 && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              placeholder="New list..."
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none w-32"
            />
            <button
              onClick={createWatchlist}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-white font-semibold">Instruments</h2>
          <button
            onClick={() => setShowAddInstrument(!showAddInstrument)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {showAddInstrument && (
          <div className="p-4 border-b border-slate-700 bg-slate-800/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks, ETFs, futures, crypto..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white text-sm"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="all">All Types</option>
                <option value="stock">Stocks</option>
                <option value="etf">ETFs</option>
                <option value="future">Futures</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-1">
              {searchResults
                .filter(i => !currentWatchlist?.instruments.includes(i.symbol))
                .map(instrument => (
                  <button
                    key={instrument.symbol}
                    onClick={() => {
                      addInstrument(instrument.symbol);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-left"
                  >
                    <div>
                      <p className="text-white font-semibold text-sm">{instrument.symbol}</p>
                      <p className="text-slate-400 text-xs">{instrument.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-mono">${instrument.price.toFixed(2)}</p>
                      <p className={`text-xs ${instrument.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {instrument.change >= 0 ? '+' : ''}{instrument.change.toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-700">
          {watchedInstruments.map(instrument => {
            const liveQuote = liveQuotes.get(instrument.symbol);
            const price = liveQuote?.price || instrument.price;
            const change = liveQuote?.change || instrument.change;
            const changePercent = liveQuote?.changePercent || 0;

            return (
              <div
                key={instrument.symbol}
                className="p-4 hover:bg-slate-800/30 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{instrument.symbol}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {liveQuote && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">LIVE</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{instrument.name}</p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-white font-bold text-lg">${price.toFixed(2)}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {change >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{Math.abs(change).toFixed(2)}</span>
                      <span>({Math.abs(changePercent).toFixed(2)}%)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeInstrument(instrument.symbol)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-700 rounded-lg transition"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}

          {watchedInstruments.length === 0 && (
            <div className="p-8 text-center">
              <Eye className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No instruments in this watchlist</p>
              <p className="text-slate-500 text-sm mt-1">Click "Add" to start tracking</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
