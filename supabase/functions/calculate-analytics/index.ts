import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const { userId, period = 'all' } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: trades } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!trades || trades.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          analytics: {
            totalTrades: 0,
            winRate: 0,
            profitFactor: 0,
            totalPnL: 0,
            averageWin: 0,
            averageLoss: 0,
            largestWin: 0,
            largestLoss: 0,
            consecutiveWins: 0,
            consecutiveLosses: 0,
            tradesByInstrument: {},
            tradesByDay: {},
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const closedTrades = trades.filter(t => t.status === 'closed');
    const winningTrades = closedTrades.filter(t => t.profit_loss > 0);
    const losingTrades = closedTrades.filter(t => t.profit_loss < 0);

    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const totalWins = winningTrades.reduce((sum, t) => sum + t.profit_loss, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit_loss, 0));

    const winRate = closedTrades.length > 0
      ? (winningTrades.length / closedTrades.length) * 100
      : 0;

    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

    const averageWin = winningTrades.length > 0
      ? totalWins / winningTrades.length
      : 0;

    const averageLoss = losingTrades.length > 0
      ? totalLosses / losingTrades.length
      : 0;

    const largestWin = winningTrades.length > 0
      ? Math.max(...winningTrades.map(t => t.profit_loss))
      : 0;

    const largestLoss = losingTrades.length > 0
      ? Math.min(...losingTrades.map(t => t.profit_loss))
      : 0;

    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    closedTrades.forEach(trade => {
      if (trade.profit_loss > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
      } else if (trade.profit_loss < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
      }
    });

    const tradesByInstrument: Record<string, any> = {};
    closedTrades.forEach(trade => {
      if (!tradesByInstrument[trade.symbol]) {
        tradesByInstrument[trade.symbol] = {
          count: 0,
          wins: 0,
          losses: 0,
          totalPnL: 0,
        };
      }
      tradesByInstrument[trade.symbol].count++;
      tradesByInstrument[trade.symbol].totalPnL += trade.profit_loss || 0;
      if (trade.profit_loss > 0) tradesByInstrument[trade.symbol].wins++;
      if (trade.profit_loss < 0) tradesByInstrument[trade.symbol].losses++;
    });

    const tradesByDay: Record<string, number> = {};
    closedTrades.forEach(trade => {
      const date = new Date(trade.created_at).toISOString().split('T')[0];
      tradesByDay[date] = (tradesByDay[date] || 0) + 1;
    });

    const analytics = {
      totalTrades: closedTrades.length,
      openTrades: trades.filter(t => t.status === 'open').length,
      winRate: Number(winRate.toFixed(2)),
      profitFactor: Number(profitFactor.toFixed(2)),
      totalPnL: Number(totalPnL.toFixed(2)),
      averageWin: Number(averageWin.toFixed(2)),
      averageLoss: Number(averageLoss.toFixed(2)),
      largestWin: Number(largestWin.toFixed(2)),
      largestLoss: Number(largestLoss.toFixed(2)),
      consecutiveWins: maxConsecutiveWins,
      consecutiveLosses: maxConsecutiveLosses,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      tradesByInstrument,
      tradesByDay,
    };

    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from("dashboard_stats")
      .upsert({
        user_id: userId,
        date: today,
        total_trades: closedTrades.length,
        winning_trades: winningTrades.length,
        losing_trades: losingTrades.length,
        total_pnl: totalPnL,
        win_rate: winRate,
        best_trade: largestWin,
        worst_trade: largestLoss,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date'
      });

    return new Response(
      JSON.stringify({
        success: true,
        analytics,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error calculating analytics:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
