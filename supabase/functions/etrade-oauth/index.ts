import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ETradeOAuthRequest {
  action: "request_token" | "access_token" | "disconnect";
  oauth_verifier?: string;
  oauth_token?: string;
  connection_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const body: ETradeOAuthRequest = await req.json();
    const { action } = body;

    // E*TRADE credentials from environment
    const consumerKey = Deno.env.get("ETRADE_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("ETRADE_CONSUMER_SECRET");
    const sandbox = Deno.env.get("ETRADE_SANDBOX") === "true";

    if (!consumerKey || !consumerSecret) {
      throw new Error("E*TRADE credentials not configured");
    }

    const baseUrl = sandbox
      ? "https://etwssandbox.etrade.com"
      : "https://api.etrade.com";

    if (action === "request_token") {
      // Step 1: Get request token
      const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/etrade-oauth/callback`;
      
      // Note: E*TRADE uses OAuth 1.0a which requires signature generation
      // For production, you'd need to implement proper OAuth 1.0a signing
      // This is a simplified example
      
      const response = {
        success: true,
        message: "E*TRADE OAuth requires OAuth 1.0a implementation",
        authUrl: `${baseUrl}/oauth/request_token`,
        instructions: [
          "1. Implement OAuth 1.0a signature generation",
          "2. Request token from E*TRADE",
          "3. Redirect user to authorization URL",
          "4. Handle callback with oauth_verifier",
          "5. Exchange for access token"
        ],
        sandbox,
      };

      return new Response(JSON.stringify(response), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    if (action === "access_token") {
      const { oauth_token, oauth_verifier } = body;
      
      if (!oauth_token || !oauth_verifier) {
        throw new Error("Missing oauth_token or oauth_verifier");
      }

      // Step 3: Exchange request token for access token
      // In production, implement OAuth 1.0a signature and token exchange
      
      // For now, return a mock response
      const response = {
        success: true,
        message: "Access token exchange requires OAuth 1.0a implementation",
        nextSteps: [
          "Implement OAuth signature",
          "Exchange tokens",
          "Store encrypted credentials in broker_credentials",
          "Create broker_connections record"
        ]
      };

      return new Response(JSON.stringify(response), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    if (action === "disconnect") {
      const { connection_id } = body;
      
      if (!connection_id) {
        throw new Error("Missing connection_id");
      }

      // Use service role to delete credentials
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Update connection status
      await serviceClient
        .from("broker_connections")
        .update({ status: "disconnected" })
        .eq("id", connection_id)
        .eq("user_id", user.id);

      // Delete credentials
      await serviceClient
        .from("broker_credentials")
        .delete()
        .eq("connection_id", connection_id);

      return new Response(
        JSON.stringify({ success: true, message: "E*TRADE disconnected" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "E*TRADE OAuth 1.0a requires additional implementation for production use"
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});