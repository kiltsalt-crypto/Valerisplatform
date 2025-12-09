import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BacktestRequest {
  symbol: string;
  startDate: string;
  endDate: string;
  strategy: {
    name: string;
    entryRules: string[];
    exitRules: string[];
    stopLoss?: number;
    takeProfit?: number;
    positionSize: number;
  };
  initialCapital: number;
}

interface BacktestResult {
  trades: Array<{
    entryDate: string;
    exitDate: string;
    entryPrice: number;
    exitPrice: number;
    pnl: number;
    pnlPercent: number;
    direction: 'long' | 'short';
  }>;
  summary: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalPnL: number;
    totalPnLPercent: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const backtestRequest: BacktestRequest = await req.json();
    const { symbol, startDate, endDate, strategy, initialCapital } = backtestRequest;

    console.log(`Running backtest for ${symbol} from ${startDate} to ${endDate}`);

    const result = await runBacktest(symbol, startDate, endDate, strategy, initialCapital);

    await supabase.from("backtest_results").insert({
      user_id: user.id,
      symbol,
      start_date: startDate,
      end_date: endDate,
      strategy_name: strategy.name,
      strategy_config: strategy,
      initial_capital: initialCapital,
      result_data: result,
      total_pnl: result.summary.totalPnL,
      win_rate: result.summary.winRate,
      total_trades: result.summary.totalTrades,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Backtest Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to run backtest",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function runBacktest(
  symbol: string,
  startDate: string,
  endDate: string,
  strategy: BacktestRequest["strategy"],
  initialCapital: number
): Promise<BacktestResult> {
  const historicalData = generateMockHistoricalData(startDate, endDate);

  const trades: BacktestResult["trades"] = [];
  let capital = initialCapital;
  let position: { entryPrice: number; entryDate: string; direction: 'long' | 'short' } | null = null;
  let equity = initialCapital;
  let maxEquity = initialCapital;
  let maxDrawdown = 0;

  for (let i = 0; i < historicalData.length; i++) {
    const candle = historicalData[i];

    if (!position) {
      const shouldEnter = evaluateEntryRules(strategy.entryRules, candle, historicalData.slice(Math.max(0, i - 20), i));
      
      if (shouldEnter) {
        position = {
          entryPrice: candle.close,
          entryDate: candle.date,
          direction: 'long'
        };
      }
    } else {
      const shouldExit = evaluateExitRules(strategy.exitRules, candle, position, strategy);

      if (shouldExit || i === historicalData.length - 1) {
        const exitPrice = candle.close;
        const pnl = position.direction === 'long'
          ? (exitPrice - position.entryPrice) * strategy.positionSize
          : (position.entryPrice - exitPrice) * strategy.positionSize;
        const pnlPercent = (pnl / capital) * 100;

        capital += pnl;
        equity = capital;

        if (equity > maxEquity) {
          maxEquity = equity;
        }

        const drawdown = ((maxEquity - equity) / maxEquity) * 100;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }

        trades.push({
          entryDate: position.entryDate,
          exitDate: candle.date,
          entryPrice: position.entryPrice,
          exitPrice,
          pnl,
          pnlPercent,
          direction: position.direction
        });

        position = null;
      }
    }
  }

  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  const returns = trades.map(t => t.pnlPercent);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  return {
    trades,
    summary: {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      totalPnL,
      totalPnLPercent: (totalPnL / initialCapital) * 100,
      averageWin: avgWin,
      averageLoss: avgLoss,
      profitFactor,
      maxDrawdown,
      sharpeRatio
    }
  };
}

function generateMockHistoricalData(startDate: string, endDate: string) {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let price = 100;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const change = (Math.random() - 0.5) * 2;
    price += change;
    const open = price + (Math.random() - 0.5) * 0.5;
    const high = Math.max(open, price) + Math.random() * 0.5;
    const low = Math.min(open, price) - Math.random() * 0.5;

    data.push({
      date: d.toISOString().split('T')[0],
      open,
      high,
      low,
      close: price,
      volume: Math.floor(Math.random() * 1000000) + 500000
    });
  }

  return data;
}

function evaluateEntryRules(rules: string[], candle: any, history: any[]): boolean {
  if (history.length < 2) return false;

  for (const rule of rules) {
    if (rule.includes('price_above_sma')) {
      const sma = history.slice(-20).reduce((sum, c) => sum + c.close, 0) / Math.min(20, history.length);
      if (candle.close <= sma) return false;
    }
    
    if (rule.includes('rsi_oversold')) {
      if (Math.random() > 0.3) return false;
    }
    
    if (rule.includes('volume_spike')) {
      const avgVolume = history.slice(-10).reduce((sum, c) => sum + c.volume, 0) / Math.min(10, history.length);
      if (candle.volume <= avgVolume * 1.5) return false;
    }
  }

  return true;
}

function evaluateExitRules(rules: string[], candle: any, position: any, strategy: any): boolean {
  const pnl = (candle.close - position.entryPrice) * strategy.positionSize;
  const pnlPercent = ((candle.close - position.entryPrice) / position.entryPrice) * 100;

  if (strategy.stopLoss && pnlPercent <= -strategy.stopLoss) {
    return true;
  }

  if (strategy.takeProfit && pnlPercent >= strategy.takeProfit) {
    return true;
  }

  for (const rule of rules) {
    if (rule.includes('price_below_sma')) {
      return Math.random() > 0.7;
    }
    
    if (rule.includes('time_exit')) {
      return Math.random() > 0.9;
    }
  }

  return false;
}
