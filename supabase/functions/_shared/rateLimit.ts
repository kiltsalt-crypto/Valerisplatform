import { createClient } from 'jsr:@supabase/supabase-js@2';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000,
};

export async function checkRateLimit(
  req: Request,
  endpoint: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const { maxRequests, windowMs } = { ...defaultConfig, ...config };

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const clientIp = req.headers.get('x-forwarded-for') ||
                   req.headers.get('x-real-ip') ||
                   'unknown';

  const identifier = clientIp.split(',')[0].trim();

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const { data: existing, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .maybeSingle();

  if (fetchError) {
    console.error('Rate limit fetch error:', fetchError);
    return { allowed: true, remaining: maxRequests, resetAt: new Date(now.getTime() + windowMs) };
  }

  if (!existing || new Date(existing.window_start) < windowStart) {
    const { error: upsertError } = await supabase
      .from('rate_limits')
      .upsert({
        identifier,
        endpoint,
        request_count: 1,
        window_start: now,
        updated_at: now,
      }, {
        onConflict: 'identifier,endpoint'
      });

    if (upsertError) {
      console.error('Rate limit upsert error:', upsertError);
    }

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now.getTime() + windowMs)
    };
  }

  if (existing.request_count >= maxRequests) {
    const resetAt = new Date(new Date(existing.window_start).getTime() + windowMs);
    return {
      allowed: false,
      remaining: 0,
      resetAt
    };
  }

  const { error: updateError } = await supabase
    .from('rate_limits')
    .update({
      request_count: existing.request_count + 1,
      updated_at: now,
    })
    .eq('identifier', identifier)
    .eq('endpoint', endpoint);

  if (updateError) {
    console.error('Rate limit update error:', updateError);
  }

  const resetAt = new Date(new Date(existing.window_start).getTime() + windowMs);

  return {
    allowed: true,
    remaining: maxRequests - existing.request_count - 1,
    resetAt
  };
}

export function rateLimitHeaders(result: { remaining: number; resetAt: Date }): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}
