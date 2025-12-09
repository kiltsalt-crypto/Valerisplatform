export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  timestamp: number;
}

export interface HistoricalData {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yahoo-finance-proxy`;

console.log('[marketData] EDGE_FUNCTION_URL:', EDGE_FUNCTION_URL);
console.log('[marketData] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('[marketData] VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

export async function getRealtimeQuote(symbol: string): Promise<MarketQuote | null> {
  try {
    console.log('[getRealtimeQuote] Fetching quote for:', symbol);
    console.log('[getRealtimeQuote] URL:', `${EDGE_FUNCTION_URL}?action=quote&symbol=${symbol}`);

    const response = await fetch(
      `${EDGE_FUNCTION_URL}?action=quote&symbol=${symbol}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );

    console.log('[getRealtimeQuote] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[getRealtimeQuote] API Error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[getRealtimeQuote] Received data:', data);

    if (!data || !data.price) {
      console.warn('[getRealtimeQuote] No valid quote data for', symbol);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[getRealtimeQuote] Exception:', error);
    return null;
  }
}

export async function searchSymbols(query: string): Promise<Array<{symbol: string, description: string}>> {
  try {
    const response = await fetch(
      `${EDGE_FUNCTION_URL}?action=search&symbol=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Search API Error:', response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error searching symbols:', error);
    return [];
  }
}

export async function getHistoricalData(symbol: string, days: number = 30): Promise<HistoricalData[]> {
  try {
    const response = await fetch(
      `${EDGE_FUNCTION_URL}?action=historical&symbol=${symbol}&days=${days}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Historical API Error:', response.status, errorText);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No historical data available for', symbol);
      return [];
    }

    console.log('Historical data received:', data.length, 'records for', symbol);
    console.log('Sample data:', data[0]);

    return data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
}

export async function getMarketNews(symbol?: string): Promise<Array<{
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
}>> {
  return [];
}
