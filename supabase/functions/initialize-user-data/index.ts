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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    if (!profile) {
      const { data: user } = await supabase.auth.admin.getUserById(userId);

      await supabase.from("profiles").insert({
        id: userId,
        email: user.user?.email || "",
        starting_capital: 100000,
        current_capital: 100000,
        subscription_tier: "free",
      });
    }

    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!subscription) {
      await supabase.from("user_subscriptions").insert({
        user_id: userId,
        tier: "free",
        status: "trial",
      });
    }

    const { data: onboarding } = await supabase
      .from("onboarding_status")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!onboarding) {
      await supabase.from("onboarding_status").insert({
        user_id: userId,
      });
    }

    const { data: watchlists } = await supabase
      .from("watchlists")
      .select("*")
      .eq("user_id", userId);

    if (!watchlists || watchlists.length === 0) {
      await supabase.from("watchlists").insert({
        user_id: userId,
        name: "My Watchlist",
        instruments: ["ES", "NQ", "CL", "GC"],
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "User data initialized" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error initializing user data:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
