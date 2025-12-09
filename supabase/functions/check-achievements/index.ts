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

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const { data: trades } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId);

    const { data: journalEntries } = await supabase
      .from("trade_journal_entries")
      .select("*")
      .eq("user_id", userId);

    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId);

    const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

    const { data: allAchievements } = await supabase
      .from("achievements")
      .select("*");

    const newAchievements = [];

    const totalTrades = trades?.length || 0;
    const closedTrades = trades?.filter(t => t.status === 'closed') || [];
    const profitableTrades = closedTrades.filter(t => t.profit_loss > 0);
    const totalProfits = closedTrades.reduce((sum, t) => sum + (t.profit_loss > 0 ? t.profit_loss : 0), 0);
    const journalCount = journalEntries?.length || 0;

    for (const achievement of allAchievements || []) {
      if (earnedIds.has(achievement.id)) continue;

      let earned = false;

      if (achievement.name === 'First Trade' && totalTrades >= 1) earned = true;
      else if (achievement.name === 'Getting Started' && totalTrades >= 10) earned = true;
      else if (achievement.name === 'Active Trader' && totalTrades >= 50) earned = true;
      else if (achievement.name === 'Veteran Trader' && totalTrades >= 100) earned = true;
      else if (achievement.name === 'Master Trader' && totalTrades >= 500) earned = true;
      else if (achievement.name === 'First Winner' && profitableTrades.length >= 1) earned = true;
      else if (achievement.name === 'Journal Keeper' && journalCount >= 10) earned = true;
      else if (achievement.name === 'Reflection Master' && journalCount >= 50) earned = true;
      else if (achievement.name === 'Small Gains' && totalProfits >= 5000) earned = true;
      else if (achievement.name === 'Building Wealth' && totalProfits >= 10000) earned = true;
      else if (achievement.name === 'Profit Pro' && totalProfits >= 25000) earned = true;
      else if (achievement.name === 'High Roller' && totalProfits >= 50000) earned = true;

      if (earned) {
        const { error } = await supabase.from("user_achievements").insert({
          user_id: userId,
          achievement_id: achievement.id,
          earned_at: new Date().toISOString(),
        });

        if (!error) {
          newAchievements.push(achievement);

          await supabase.from("notifications").insert({
            user_id: userId,
            title: "Achievement Unlocked!",
            message: `You've earned the \"${achievement.name}\" achievement! (+${achievement.points} points)`,
            type: "success",
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        newAchievements,
        totalChecked: allAchievements?.length || 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error checking achievements:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
