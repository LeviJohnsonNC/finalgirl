// Shared guard for authenticated + rate-limited edge functions.
//
// Rejects unauthenticated callers and enforces per-user caps on the given
// function name using public.ai_usage_events. Image generation is billed to the
// platform, so those functions opt into a daily cap and into failing CLOSED:
// if we cannot prove a user is under their limit, we do not spend money on them.
// Text functions keep the original fail-open behaviour — a table hiccup should
// not stop someone reading a story.
import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export interface GuardResult {
  ok: true;
  user: User;
  adminClient: SupabaseClient;
  /** Records what was actually spent. Call after a successful generation. */
  logUsage: (details: { model?: string; kind?: string }) => void;
}
export interface GuardFail {
  ok: false;
  response: Response;
}

export interface GuardOptions {
  functionName: string;
  hourlyLimit?: number;
  /** Additional rolling-24h cap. Omit for no daily cap. */
  dailyLimit?: number;
  /** Block the request when the limit lookup itself fails. Use for paid calls. */
  failClosed?: boolean;
}

const jsonResponse = (body: unknown, status: number, cors: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const countSince = async (
  adminClient: SupabaseClient,
  userId: string,
  functionName: string,
  since: Date,
) =>
  await adminClient
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("function_name", functionName)
    .gte("created_at", since.toISOString());

export const requireUser = async (
  req: Request,
  cors: HeadersInit,
  opts: GuardOptions = { functionName: "unknown" },
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
  const hourlyLimit = opts.hourlyLimit ?? 30;
  const now = Date.now();

  const limits: Array<{ limit: number; since: Date; label: string }> = [
    { limit: hourlyLimit, since: new Date(now - 60 * 60 * 1000), label: `${hourlyLimit} per hour` },
  ];
  if (opts.dailyLimit !== undefined) {
    limits.push({
      limit: opts.dailyLimit,
      since: new Date(now - 24 * 60 * 60 * 1000),
      label: `${opts.dailyLimit} per day`,
    });
  }

  for (const { limit, since, label } of limits) {
    const { count, error: countError } = await countSince(adminClient, user.id, opts.functionName, since);

    if (countError) {
      console.error("Rate-limit lookup failed:", countError);
      if (opts.failClosed) {
        return {
          ok: false,
          response: jsonResponse(
            { error: "Could not verify your usage allowance. Please try again shortly." },
            503,
            cors,
          ),
        };
      }
      continue; // Fail open for unbilled calls.
    }

    if ((count ?? 0) >= limit) {
      return {
        ok: false,
        response: jsonResponse({ error: `Limit reached (${label}). Try again later.` }, 429, cors),
      };
    }
  }

  // Reserve the slot up front so concurrent requests cannot both slip under the
  // cap. A failed generation still consumes its slot — that is deliberate, it is
  // what stops retry-spam from becoming a bill. The row is annotated with the
  // model afterwards, once we know which one actually answered.
  const reservation: Promise<number | null> = (async () => {
    const { data, error: insertError } = await adminClient
      .from("ai_usage_events")
      .insert({ user_id: user.id, function_name: opts.functionName })
      .select("id")
      .single();
    if (insertError) {
      console.error("Failed to log usage event:", insertError);
      return null;
    }
    return (data as { id: number }).id;
  })();

  const logUsage = (details: { model?: string; kind?: string }) => {
    reservation
      .then(async (id) => {
        if (id === null) return;
        const { error: updateError } = await adminClient
          .from("ai_usage_events")
          .update({ model: details.model ?? null, kind: details.kind ?? null })
          .eq("id", id);
        if (updateError) console.error("Failed to annotate usage event:", updateError);
      })
      .catch((err) => console.error("Usage annotation failed:", err));
  };

  return { ok: true, user, adminClient, logUsage };
};
