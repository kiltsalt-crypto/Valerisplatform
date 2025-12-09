import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, string>;
}

const emailTemplates = {
  welcome: {
    subject: "Welcome to Valeris Trading Platform",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Valeris!</h1>
          </div>
          <div class="content">
            <p>Hi {{name}},</p>
            <p>Welcome to Valeris Trading Platform! We're excited to have you join our community of traders.</p>
            <p>Your account has been successfully created. You can now:</p>
            <ul>
              <li>Track your trades with our advanced journal</li>
              <li>Analyze your performance with detailed analytics</li>
              <li>Learn from our comprehensive education center</li>
              <li>Connect with other traders in our community</li>
            </ul>
            <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
            <p>If you have any questions, our support team is here to help!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Valeris. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  passwordReset: {
    subject: "Reset Your Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi {{name}},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="{{resetUrl}}" class="button">Reset Password</a>
            <div class="warning">
              <strong>Security Notice:</strong> This link expires in 1 hour. If you didn't request this, please ignore this email.
            </div>
            <p>For security reasons, we cannot send you your current password.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Valeris. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  supportResponse: {
    subject: "Support Ticket Update - #{{ticketId}}",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-info { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .response { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Support Ticket Update</h1>
          </div>
          <div class="content">
            <p>Hi {{name}},</p>
            <p>Your support ticket has been updated:</p>
            <div class="ticket-info">
              <strong>Ticket #{{ticketId}}</strong><br>
              Subject: {{subject}}<br>
              Status: {{status}}
            </div>
            <div class="response">
              <strong>Response from Support:</strong><br><br>
              {{message}}
            </div>
            <a href="{{ticketUrl}}" class="button">View Ticket</a>
          </div>
          <div class="footer">
            <p>&copy; 2024 Valeris. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  subscriptionConfirmation: {
    subject: "Subscription Confirmed - Welcome to {{planName}}!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
          .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Subscription Active!</h1>
          </div>
          <div class="content">
            <p>Hi {{name}},</p>
            <p><span class="success-badge">{{planName}}</span></p>
            <p>Your subscription has been activated! You now have full access to all premium features.</p>
            <div class="features">
              <strong>Your Benefits:</strong>
              <ul>
                <li>Advanced trading analytics</li>
                <li>Real-time market data</li>
                <li>AI-powered insights</li>
                <li>Priority support</li>
                <li>Exclusive community access</li>
              </ul>
            </div>
            <p><strong>Next Billing Date:</strong> {{nextBillingDate}}</p>
            <a href="{{dashboardUrl}}" class="button">Start Trading</a>
          </div>
          <div class="footer">
            <p>&copy; 2024 Valeris. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  trialExpiring: {
    subject: "Your Trial Expires in {{daysLeft}} Days",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .countdown { background: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; font-size: 24px; font-weight: bold; color: #f59e0b; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Trial Ending Soon</h1>
          </div>
          <div class="content">
            <p>Hi {{name}},</p>
            <p>Your free trial is ending soon:</p>
            <div class="countdown">{{daysLeft}} Days Remaining</div>
            <p>Don't lose access to:</p>
            <ul>
              <li>Your trading journal and analytics</li>
              <li>Advanced performance metrics</li>
              <li>Community features</li>
              <li>Educational resources</li>
            </ul>
            <p><strong>Upgrade now to continue your trading journey!</strong></p>
            <a href="{{upgradeUrl}}" class="button">View Plans</a>
          </div>
          <div class="footer">
            <p>&copy; 2024 Valeris. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return rendered;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, subject, template, variables }: EmailRequest = await req.json();

    if (!to || !template) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, template" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailTemplate = emailTemplates[template as keyof typeof emailTemplates];
    if (!emailTemplate) {
      return new Response(
        JSON.stringify({ error: `Unknown template: ${template}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const renderedSubject = subject || renderTemplate(emailTemplate.subject, variables);
    const renderedHtml = renderTemplate(emailTemplate.html, variables);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Valeris <noreply@valeris.io>",
        to: [to],
        subject: renderedSubject,
        html: renderedHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});