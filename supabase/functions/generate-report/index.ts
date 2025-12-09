import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReportRequest {
  reportType: 'trading_performance' | 'tax_report' | 'monthly_summary' | 'custom';
  startDate: string;
  endDate: string;
  parameters?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
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

    const reportRequest: ReportRequest = await req.json();

    const { data: reportRecord, error: insertError } = await supabase
      .from("generated_reports")
      .insert({
        user_id: user.id,
        report_type: reportRequest.reportType,
        parameters: reportRequest.parameters || {},
        status: "processing"
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const { data: trades } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", reportRequest.startDate)
      .lte("created_at", reportRequest.endDate);

    const reportData = generateReportData(reportRequest.reportType, trades || [], reportRequest);

    const reportText = formatReportAsText(reportData, reportRequest.reportType);
    const reportBlob = new Blob([reportText], { type: 'text/plain' });
    const reportSize = reportBlob.size;

    await supabase
      .from("generated_reports")
      .update({
        status: "completed",
        file_size: reportSize,
        completed_at: new Date().toISOString()
      })
      .eq("id", reportRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        reportId: reportRecord.id,
        data: reportData,
        downloadUrl: `/reports/${reportRecord.id}/download`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Report generation error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateReportData(reportType: string, trades: any[], request: ReportRequest) {
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const losingTrades = trades.filter(t => t.pnl < 0).length;
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const avgWin = winningTrades > 0 ? trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / losingTrades) : 0;

  const baseData = {
    period: {
      start: request.startDate,
      end: request.endDate
    },
    summary: {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: winRate.toFixed(2),
      totalPnL: totalPnL.toFixed(2),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      profitFactor: avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A'
    },
    trades: trades.map(t => ({
      date: t.created_at,
      symbol: t.symbol,
      direction: t.direction,
      pnl: t.pnl,
      notes: t.notes
    }))
  };

  if (reportType === 'tax_report') {
    return {
      ...baseData,
      taxInfo: {
        totalGains: trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0).toFixed(2),
        totalLosses: Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0)).toFixed(2),
        netPnL: totalPnL.toFixed(2)
      }
    };
  }

  return baseData;
}

function formatReportAsText(data: any, reportType: string): string {
  let text = `Trading Report - ${reportType.replace('_', ' ').toUpperCase()}\n`;
  text += `Generated: ${new Date().toISOString()}\n\n`;
  text += `Period: ${data.period.start} to ${data.period.end}\n\n`;
  text += `=== SUMMARY ===\n`;
  text += `Total Trades: ${data.summary.totalTrades}\n`;
  text += `Winning Trades: ${data.summary.winningTrades}\n`;
  text += `Losing Trades: ${data.summary.losingTrades}\n`;
  text += `Win Rate: ${data.summary.winRate}%\n`;
  text += `Total P&L: $${data.summary.totalPnL}\n`;
  text += `Average Win: $${data.summary.avgWin}\n`;
  text += `Average Loss: $${data.summary.avgLoss}\n`;
  text += `Profit Factor: ${data.summary.profitFactor}\n\n`;

  if (data.taxInfo) {
    text += `=== TAX INFORMATION ===\n`;
    text += `Total Gains: $${data.taxInfo.totalGains}\n`;
    text += `Total Losses: $${data.taxInfo.totalLosses}\n`;
    text += `Net P&L: $${data.taxInfo.netPnL}\n\n`;
  }

  text += `=== TRADES ===\n`;
  data.trades.forEach((trade: any, idx: number) => {
    text += `${idx + 1}. ${trade.date} - ${trade.symbol} ${trade.direction} - P&L: $${trade.pnl}\n`;
  });

  return text;
}
