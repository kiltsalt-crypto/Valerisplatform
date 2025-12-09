import { getRealtimeQuote, MarketQuote } from './marketData';

type SubscriptionCallback = (quote: MarketQuote) => void;

class RealtimeMarketDataService {
  private subscribers: Map<string, Set<SubscriptionCallback>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private latestQuotes: Map<string, MarketQuote> = new Map();
  private readonly REFRESH_INTERVAL = 60000;

  subscribe(symbol: string, callback: SubscriptionCallback): () => void {
    const upperSymbol = symbol.toUpperCase();

    if (!this.subscribers.has(upperSymbol)) {
      this.subscribers.set(upperSymbol, new Set());
    }

    this.subscribers.get(upperSymbol)!.add(callback);

    if (this.latestQuotes.has(upperSymbol)) {
      callback(this.latestQuotes.get(upperSymbol)!);
    }

    if (!this.intervals.has(upperSymbol)) {
      this.startPolling(upperSymbol);
    }

    return () => this.unsubscribe(upperSymbol, callback);
  }

  private unsubscribe(symbol: string, callback: SubscriptionCallback) {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.delete(callback);

      if (subscribers.size === 0) {
        this.stopPolling(symbol);
        this.subscribers.delete(symbol);
        this.latestQuotes.delete(symbol);
      }
    }
  }

  private async startPolling(symbol: string) {
    this.fetchAndNotify(symbol);

    const interval = setInterval(() => {
      this.fetchAndNotify(symbol);
    }, this.REFRESH_INTERVAL);

    this.intervals.set(symbol, interval);
  }

  private stopPolling(symbol: string) {
    const interval = this.intervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(symbol);
    }
  }

  private async fetchAndNotify(symbol: string) {
    try {
      const quote = await getRealtimeQuote(symbol);

      if (quote) {
        this.latestQuotes.set(symbol, quote);

        const subscribers = this.subscribers.get(symbol);
        if (subscribers) {
          subscribers.forEach(callback => {
            try {
              callback(quote);
            } catch (error) {
              console.error('Error in subscriber callback:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
    }
  }

  async getLatestQuote(symbol: string): Promise<MarketQuote | null> {
    const upperSymbol = symbol.toUpperCase();
    return this.latestQuotes.get(upperSymbol) || await getRealtimeQuote(upperSymbol);
  }

  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.subscribers.clear();
    this.latestQuotes.clear();
  }
}

export const realtimeMarketData = new RealtimeMarketDataService();
