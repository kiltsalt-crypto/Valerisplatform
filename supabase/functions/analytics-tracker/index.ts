import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyticsEvent {
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
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

    const event: AnalyticsEvent = await req.json();
    const clientInfo = req.headers.get("user-agent") || "";
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";

    await supabase.from("user_activity_logs").insert({
      user_id: user.id,
      action: event.action,
      resource_type: event.resourceType,
      resource_id: event.resourceId,
      metadata: event.metadata || {},
      ip_address: ipAddress,
      user_agent: clientInfo,
    });

    const today = new Date().toISOString().split('T')[0];
    await supabase.from("feature_usage_analytics")
      .upsert({
        user_id: user.id,
        feature_name: event.action,
        date: today,
        usage_count: 1,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,feature_name,date',
        ignoreDuplicates: false
      });

    const { data: experience } = await supabase
      .from("user_experience")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (experience) {
      const newXP = experience.total_xp + 1;
      const newLevel = Math.floor(newXP / 100) + 1;

      await supabase
        .from("user_experience")
        .update({
          total_xp: newXP,
          level: newLevel,
          last_activity_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
    } else {
      await supabase.from("user_experience").insert({
        user_id: user.id,
        total_xp: 1,
        level: 1,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: new Date().toISOString().split('T')[0]
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Event tracked successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to track analytics event",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});