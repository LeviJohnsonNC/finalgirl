// Shared guard for authenticated + rate-limited edge functions.
//
// Rejects unauthenticated callers and enforces per-user caps on the given
// function name using public.ai_usage_events. Image generation is billed to the
// platform, so those functions opt into a daily cap and into failing CLOSED:
// if we cannot prove a user is under their limit, we do not spend money on them.
// All generations fail closed when a reservation cannot be recorded.
import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export interface GuardResult {
  ok: true;
  user: User;
  adminClient: SupabaseClient;
  /**
   * Records what was actually spent. Call — and await — after a successful
   * generation, before returning the response.
   */
  logUsage: (details: { model?: string; kind?: string }) => Promise<void>;
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
  /** Compatibility option; all reservations now fail closed. */
  failClosed?: boolean;
}

const jsonResponse = (body: unknown, status: number, cors: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

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
  const { data: reservation, error: reservationError } = await adminClient.rpc('reserve_ai_usage', {
    p_user_id: user.id,
    p_function_name: opts.functionName,
    p_hourly_limit: opts.hourlyLimit ?? 30,
    p_daily_limit: opts.dailyLimit ?? null,
  });
  // Every generation needs an acknowledged reservation. Lookup/insert failures
  // never authorize paid work, including text and narration.
  const slot = Array.isArray(reservation) ? reservation[0] : null;
  if (reservationError || !slot || typeof slot.allowed !== 'boolean' || (slot.allowed && (!Number.isSafeInteger(slot.event_id) || slot.event_id <= 0))) {
    console.error('Usage reservation failed:', reservationError);
    return { ok: false, response: jsonResponse({ error: 'Could not verify your usage allowance. Please try again shortly.' }, 503, cors) };
  }
  if (!slot.allowed) {
    return { ok: false, response: jsonResponse({ error: slot.reason || 'Limit reached. Try again later.' }, 429, cors) };
  }
  const eventId = slot.event_id;

  // Must be awaited by the caller. An edge isolate stops executing pending work
  // the moment its response is returned, so a fire-and-forget update here is
  // issued microseconds before shutdown and never lands — which is exactly how
  // this column silently stayed null while looking like it was being written.
  // The reservation itself has already committed before generation begins.
  const logUsage = async (details: { model?: string; kind?: string }): Promise<void> => {
    try {
      const { error: updateError } = await adminClient
        .from("ai_usage_events")
        .update({ model: details.model ?? null, kind: details.kind ?? null })
        .eq("id", eventId).eq("user_id", user.id);
      if (updateError) console.error("Failed to annotate usage event:", updateError);
    } catch (err) {
      // Telemetry must never take down a generation the user already paid for.
      console.error("Usage annotation failed:", err);
    }
  };

  return { ok: true, user, adminClient, logUsage };
};

