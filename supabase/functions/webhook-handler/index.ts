import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Webhook-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const signature = req.headers.get("X-Webhook-Signature");
    const payload = await req.json();

    const { data: webhooks } = await supabase
      .from("webhook_endpoints")
      .select("*")
      .eq("enabled", true);

    if (!webhooks || webhooks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No webhooks configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const deliveryPromises = webhooks
      .filter(webhook => webhook.events.includes(payload.event || 'all'))
      .map(async (webhook) => {
        try {
          const hmac = createHmac('sha256', webhook.secret);
          hmac.update(JSON.stringify(payload));
          const expectedSignature = hmac.digest('hex');

          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': expectedSignature,
            },
            body: JSON.stringify(payload),
          });

          return {
            webhookId: webhook.id,
            success: response.ok,
            status: response.status
          };
        } catch (error) {
          return {
            webhookId: webhook.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

    const results = await Promise.all(deliveryPromises);

    return new Response(
      JSON.stringify({
        success: true,
        delivered: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});