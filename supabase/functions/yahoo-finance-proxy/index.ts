import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuoteResponse {
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

interface HistoricalData {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000;

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}

async function getYahooQuote(symbol: string): Promise<QuoteResponse> {
  const cacheKey = `quote_${symbol}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
    throw new Error("No data available for symbol");
  }

  const result = data.chart.result[0];
  const meta = result.meta;
  const quote = result.indicators.quote[0];

  if (!meta || !quote) {
    throw new Error("Invalid data format");
  }

  const currentPrice = meta.regularMarketPrice || meta.previousClose;
  const previousClose = meta.previousClose || meta.chartPreviousClose;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;

  const quoteData: QuoteResponse = {
    symbol: meta.symbol,
    price: currentPrice,
    change: change,
    changePercent: changePercent,
    volume: meta.regularMarketVolume || 0,
    open: quote.open?.[quote.open.length - 1] || currentPrice,
    high: quote.high?.[quote.high.length - 1] || currentPrice,
    low: quote.low?.[quote.low.length - 1] || currentPrice,
    previousClose: previousClose,
    timestamp: Math.floor(Date.now() / 1000),
  };

  setCache(cacheKey, quoteData);
  return quoteData;
}

async function getYahooHistorical(symbol: string, days: number): Promise<HistoricalData[]> {
  const cacheKey = `historical_${symbol}_${days}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - (days * 24 * 60 * 60);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
    throw new Error("No data available for symbol");
  }

  const result = data.chart.result[0];
  const timestamps = result.timestamp;
  const quote = result.indicators.quote[0];

  if (!timestamps || !quote) {
    throw new Error("Invalid data format");
  }

  const historical: HistoricalData[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    if (quote.close[i] === null) continue;

    const date = new Date(timestamps[i] * 1000);
    historical.push({
      date: date.toISOString().split('T')[0],
      timestamp: timestamps[i],
      open: quote.open[i] || quote.close[i],
      high: quote.high[i] || quote.close[i],
      low: quote.low[i] || quote.close[i],
      close: quote.close[i],
      volume: quote.volume[i] || 0,
    });
  }

  setCache(cacheKey, historical);
  return historical;
}

async function searchYahoo(query: string) {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`);
  }

  const data = await response.json();
  const quotes = data.quotes || [];

  return quotes.map((quote: any) => ({
    symbol: quote.symbol,
    description: `${quote.longname || quote.shortname || quote.symbol} ${quote.exchDisp ? `(${quote.exchDisp})` : ''}`.trim(),
  })).slice(0, 10);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const symbol = url.searchParams.get("symbol");

    if (!symbol && action !== "search") {
      return new Response(
        JSON.stringify({ error: "Symbol parameter required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "quote") {
      try {
        const quoteData = await getYahooQuote(symbol!);
        return new Response(JSON.stringify(quoteData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error fetching quote from Yahoo Finance:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Failed to fetch quote data" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    if (action === "historical") {
      try {
        const days = parseInt(url.searchParams.get("days") || "30");
        const historicalData = await getYahooHistorical(symbol!, days);
        return new Response(JSON.stringify(historicalData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error fetching historical data from Yahoo Finance:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Failed to fetch historical data" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    if (action === "search") {
      try {
        const query = url.searchParams.get("query") || symbol || "";
        if (!query) {
          return new Response(
            JSON.stringify({ error: "Query parameter required for search" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        const results = await searchYahoo(query);
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error searching Yahoo Finance:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Failed to search symbols" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: quote, historical, or search" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});