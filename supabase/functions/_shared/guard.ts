// Shared guard for authenticated + rate-limited edge functions.
// Rejects unauthenticated callers and enforces a per-user hourly cap on the
// given function name using the public.ai_usage_events table.
import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export interface GuardResult {
  ok: true;
  user: User;
  adminClient: SupabaseClient;
}
export interface GuardFail {
  ok: false;
  response: Response;
}

const jsonResponse = (body: unknown, status: number, cors: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

export const requireUser = async (
  req: Request,
  cors: HeadersInit,
  opts: { functionName: string; hourlyLimit?: number } = { functionName: "unknown" }
): Promise<GuardResult | GuardFail> => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, response: jsonResponse({ error: "Missing authorization" }, 401, cors) };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Auth env missing");
    return { ok: false, response: jsonResponse({ error: "Auth misconfigured" }, 500, cors) };
  }

  const anonClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error } = await anonClient.auth.getUser();
  if (error || !user) {
    return { ok: false, response: jsonResponse({ error: "Unauthorized" }, 401, cors) };
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Rate limit check (default: 30/hour)
  const hourlyLimit = opts.hourlyLimit ?? 30;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await adminClient
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("function_name", opts.functionName)
    .gte("created_at", oneHourAgo);

  if (countError) {
    // Fail open: log but don't block the user for a table hiccup.
    console.error("Rate-limit lookup failed:", countError);
  } else if ((count ?? 0) >= hourlyLimit) {
    return {
      ok: false,
      response: jsonResponse(
        { error: `Hourly limit reached (${hourlyLimit} per hour). Try again shortly.` },
        429,
        cors
      ),
    };
  }

  // Record this usage (fire-and-forget best-effort).
  adminClient
    .from("ai_usage_events")
    .insert({ user_id: user.id, function_name: opts.functionName })
    .then(({ error: insertError }) => {
      if (insertError) console.error("Failed to log usage event:", insertError);
    });

  return { ok: true, user, adminClient };
};
