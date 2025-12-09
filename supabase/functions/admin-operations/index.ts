import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!adminData) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { operation, userId, email, data: requestData } = await req.json();

    let result;

    switch (operation) {
      case 'reset_password': {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          password: requestData.newPassword || generateRandomPassword(),
          email_confirm: true,
        });
        if (error) throw error;
        result = { success: true, message: 'Password reset successfully' };
        break;
      }

      case 'ban_user': {
        const banUntil = new Date();
        banUntil.setFullYear(banUntil.getFullYear() + 10);
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          ban_duration: requestData.duration || '876000h',
        });
        if (error) throw error;
        result = { success: true, message: 'User banned successfully' };
        break;
      }

      case 'unban_user': {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          ban_duration: 'none',
        });
        if (error) throw error;
        result = { success: true, message: 'User unbanned successfully' };
        break;
      }

      case 'delete_user': {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) throw error;
        await supabase.from('profiles').delete().eq('id', userId);
        result = { success: true, message: 'User deleted successfully' };
        break;
      }

      case 'verify_email': {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          email_confirm: true,
        });
        if (error) throw error;
        result = { success: true, message: 'Email verified successfully' };
        break;
      }

      case 'list_users': {
        const { data: users, error } = await supabase.auth.admin.listUsers(
          requestData?.page || 1,
          requestData?.perPage || 1000
        );
        if (error) throw error;
        result = { users };
        break;
      }

      case 'update_user_metadata': {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: requestData.metadata,
        });
        if (error) throw error;
        result = { success: true, message: 'User metadata updated' };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Admin operation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateRandomPassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}