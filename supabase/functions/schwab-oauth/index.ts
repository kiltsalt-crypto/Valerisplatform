import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SchwabOAuthRequest {
  action: "authorize" | "token" | "refresh" | "disconnect";
  code?: string;
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

    const body: SchwabOAuthRequest = await req.json();
    const { action } = body;

    // Schwab credentials from environment
    const appKey = Deno.env.get("SCHWAB_APP_KEY");
    const appSecret = Deno.env.get("SCHWAB_APP_SECRET");
    const redirectUri = Deno.env.get("SCHWAB_REDIRECT_URI") || `${Deno.env.get("SUPABASE_URL")}/functions/v1/schwab-oauth/callback`;

    if (!appKey || !appSecret) {
      throw new Error("Schwab credentials not configured");
    }

    const baseUrl = "https://api.schwabapi.com";
    const authUrl = "https://api.schwabapi.com/v1/oauth";

    if (action === "authorize") {
      // Step 1: Generate authorization URL
      const state = crypto.randomUUID();
      const scope = "trading";
      
      const authorizationUrl = new URL(`${authUrl}/authorize`);
      authorizationUrl.searchParams.set("client_id", appKey);
      authorizationUrl.searchParams.set("redirect_uri", redirectUri);
      authorizationUrl.searchParams.set("response_type", "code");
      authorizationUrl.searchParams.set("scope", scope);
      authorizationUrl.searchParams.set("state", state);

      return new Response(
        JSON.stringify({
          success: true,
          authorizationUrl: authorizationUrl.toString(),
          state,
          message: "Redirect user to this URL to authorize Schwab access"
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "token") {
      const { code } = body;
      
      if (!code) {
        throw new Error("Missing authorization code");
      }

      // Step 2: Exchange authorization code for access token
      const tokenUrl = `${authUrl}/token`;
      const basicAuth = btoa(`${appKey}:${appSecret}`);

      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      const {
        access_token,
        refresh_token,
        expires_in,
        token_type,
        scope: grantedScope,
      } = tokenData;

      // Get account info
      const accountsResponse = await fetch(`${baseUrl}/trader/v1/accounts`, {
        headers: {
          "Authorization": `Bearer ${access_token}`,
        },
      });

      let accountId = "default";
      let accountType = "margin";

      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        if (accountsData && accountsData.length > 0) {
          accountId = accountsData[0].accountNumber;
          accountType = accountsData[0].type;
        }
      }

      // Use service role to store credentials
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Create broker connection
      const { data: connection, error: connectionError } = await serviceClient
        .from("broker_connections")
        .insert({
          user_id: user.id,
          broker_name: "schwab",
          status: "connected",
          account_id: accountId,
          account_type: accountType,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          metadata: { scope: grantedScope },
        })
        .select()
        .single();

      if (connectionError) {
        throw new Error(`Failed to create connection: ${connectionError.message}`);
      }

      // Store encrypted credentials (in production, encrypt these properly)
      const { error: credError } = await serviceClient
        .from("broker_credentials")
        .insert({
          connection_id: connection.id,
          access_token_encrypted: access_token,
          refresh_token_encrypted: refresh_token,
          token_type,
          scope: grantedScope,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        });

      if (credError) {
        throw new Error(`Failed to store credentials: ${credError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          connectionId: connection.id,
          accountId,
          message: "Schwab account connected successfully",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "refresh") {
      const { connection_id } = body;
      
      if (!connection_id) {
        throw new Error("Missing connection_id");
      }

      // Use service role to get credentials
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: credentials } = await serviceClient
        .from("broker_credentials")
        .select("*")
        .eq("connection_id", connection_id)
        .single();

      if (!credentials) {
        throw new Error("Credentials not found");
      }

      // Refresh token
      const tokenUrl = `${authUrl}/token`;
      const basicAuth = btoa(`${appKey}:${appSecret}`);

      const refreshResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: credentials.refresh_token_encrypted,
        }).toString(),
      });

      if (!refreshResponse.ok) {
        throw new Error("Token refresh failed");
      }

      const refreshData = await refreshResponse.json();

      // Update credentials
      await serviceClient
        .from("broker_credentials")
        .update({
          access_token_encrypted: refreshData.access_token,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq("connection_id", connection_id);

      await serviceClient
        .from("broker_connections")
        .update({
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq("id", connection_id);

      return new Response(
        JSON.stringify({ success: true, message: "Token refreshed" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
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
        JSON.stringify({ success: true, message: "Schwab disconnected" }),
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