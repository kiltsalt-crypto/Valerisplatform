import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BrokerAPIRequest {
  connection_id: string;
  action: "sync_positions" | "sync_orders" | "sync_balances" | "place_order" | "cancel_order";
  order_data?: any;
  order_id?: string;
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

    const body: BrokerAPIRequest = await req.json();
    const { connection_id, action } = body;

    if (!connection_id) {
      throw new Error("Missing connection_id");
    }

    // Use service role to access credentials
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get connection
    const { data: connection, error: connError } = await serviceClient
      .from("broker_connections")
      .select("*")
      .eq("id", connection_id)
      .eq("user_id", user.id)
      .single();

    if (connError || !connection) {
      throw new Error("Connection not found");
    }

    // Get credentials
    const { data: credentials } = await serviceClient
      .from("broker_credentials")
      .select("*")
      .eq("connection_id", connection_id)
      .single();

    if (!credentials) {
      throw new Error("Credentials not found");
    }

    const broker = connection.broker_name;
    const accessToken = credentials.access_token_encrypted;

    // Handle different actions
    if (action === "sync_positions") {
      let positions = [];
      let syncStatus = "success";
      let errorMessage = null;

      try {
        if (broker === "schwab") {
          const baseUrl = "https://api.schwabapi.com";
          const response = await fetch(
            `${baseUrl}/trader/v1/accounts/${connection.account_id}/positions`,
            {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Schwab API error: ${response.statusText}`);
          }

          const data = await response.json();
          positions = data.positions || [];

          // Store positions in database
          for (const pos of positions) {
            await serviceClient
              .from("broker_positions")
              .upsert({
                connection_id,
                symbol: pos.instrument.symbol,
                quantity: pos.longQuantity || 0,
                average_price: pos.averagePrice || 0,
                current_price: pos.marketValue / pos.longQuantity || 0,
                market_value: pos.marketValue || 0,
                unrealized_pnl: pos.currentDayProfitLoss || 0,
                position_type: pos.longQuantity > 0 ? "long" : "short",
              });
          }
        } else if (broker === "etrade") {
          // E*TRADE implementation would go here
          syncStatus = "failed";
          errorMessage = "E*TRADE sync not fully implemented";
        }
      } catch (error) {
        syncStatus = "failed";
        errorMessage = error.message;
      }

      // Log sync
      await serviceClient
        .from("broker_sync_log")
        .insert({
          connection_id,
          sync_type: "positions",
          status: syncStatus,
          records_synced: positions.length,
          error_message: errorMessage,
        });

      // Update last synced time
      await serviceClient
        .from("broker_connections")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", connection_id);

      return new Response(
        JSON.stringify({
          success: syncStatus === "success",
          positions,
          synced: positions.length,
          error: errorMessage,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "sync_orders") {
      let orders = [];
      let syncStatus = "success";
      let errorMessage = null;

      try {
        if (broker === "schwab") {
          const baseUrl = "https://api.schwabapi.com";
          const response = await fetch(
            `${baseUrl}/trader/v1/accounts/${connection.account_id}/orders`,
            {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Schwab API error: ${response.statusText}`);
          }

          const data = await response.json();
          orders = data || [];

          // Store orders in database
          for (const order of orders) {
            await serviceClient
              .from("broker_orders")
              .upsert({
                connection_id,
                broker_order_id: order.orderId.toString(),
                symbol: order.orderLegCollection[0]?.instrument?.symbol || "UNKNOWN",
                order_type: order.orderType,
                side: order.orderLegCollection[0]?.instruction || "BUY",
                quantity: order.quantity || 0,
                price: order.price || 0,
                status: order.status,
                filled_quantity: order.filledQuantity || 0,
                average_fill_price: order.averageFillPrice || 0,
                placed_at: order.enteredTime,
                filled_at: order.closeTime,
              });
          }
        } else if (broker === "etrade") {
          syncStatus = "failed";
          errorMessage = "E*TRADE sync not fully implemented";
        }
      } catch (error) {
        syncStatus = "failed";
        errorMessage = error.message;
      }

      // Log sync
      await serviceClient
        .from("broker_sync_log")
        .insert({
          connection_id,
          sync_type: "orders",
          status: syncStatus,
          records_synced: orders.length,
          error_message: errorMessage,
        });

      await serviceClient
        .from("broker_connections")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", connection_id);

      return new Response(
        JSON.stringify({
          success: syncStatus === "success",
          orders,
          synced: orders.length,
          error: errorMessage,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "sync_balances") {
      let balance = {};
      let syncStatus = "success";
      let errorMessage = null;

      try {
        if (broker === "schwab") {
          const baseUrl = "https://api.schwabapi.com";
          const response = await fetch(
            `${baseUrl}/trader/v1/accounts/${connection.account_id}`,
            {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Schwab API error: ${response.statusText}`);
          }

          const data = await response.json();
          balance = data.securitiesAccount?.currentBalances || {};
        } else if (broker === "etrade") {
          syncStatus = "failed";
          errorMessage = "E*TRADE sync not fully implemented";
        }
      } catch (error) {
        syncStatus = "failed";
        errorMessage = error.message;
      }

      // Log sync
      await serviceClient
        .from("broker_sync_log")
        .insert({
          connection_id,
          sync_type: "balances",
          status: syncStatus,
          records_synced: 1,
          error_message: errorMessage,
        });

      return new Response(
        JSON.stringify({
          success: syncStatus === "success",
          balance,
          error: errorMessage,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "place_order") {
      const { order_data } = body;
      
      if (!order_data) {
        throw new Error("Missing order_data");
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: "Order placement requires additional implementation and testing",
          note: "This feature should be carefully implemented with proper risk controls"
        }),
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