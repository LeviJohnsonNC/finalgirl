import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/auth.ts";
import { removeDiscardedImages } from "../_shared/discardedGame.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization)
      return json({ error: "Sign in to discard this game." }, 401);
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authorization } },
      },
    );
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();
    if (authError || !user)
      return json({ error: "Sign in to discard this game." }, 401);
    const body = await req.json();
    if (
      !body ||
      typeof body.gameId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        body.gameId,
      )
    )
      return json({ error: "Choose a valid game." }, 400);
    body.gameId = body.gameId.toLowerCase();
    // Authenticated, ownership-checked transaction. Deletion never reserves AI usage.
    const { data, error } = await client.rpc("discard_game_session", {
      p_game_id: body.gameId,
    });
    if (error || data?.discarded !== true)
      return json(
        { error: "Discard could not be confirmed. Reconnect and try again." },
        error?.code === "42501" ? 403 : 503,
      );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    let cleanupPending = true;
    try {
      const { data: marker, error: markerError } = await admin
        .from("discarded_games")
        .select("cleanup_revision")
        .eq("user_id", user.id)
        .eq("game_id", body.gameId)
        .single();
      if (markerError || !marker) throw new Error("Cleanup state unavailable.");
      await removeDiscardedImages(admin, user.id, body.gameId);
      const { data: acknowledged, error: cleanupError } = await admin
        .from("discarded_games")
        .update({ cleanup_pending: false })
        .eq("user_id", user.id)
        .eq("game_id", body.gameId)
        .eq("cleanup_revision", marker.cleanup_revision)
        .select("game_id")
        .maybeSingle();
      cleanupPending = Boolean(cleanupError || !acknowledged);
    } catch (error) {
      console.warn("Discarded image cleanup will retry:", error);
    }
    // Records are already gone atomically; an image-service outage must not resurrect them.
    // The durable marker retains cleanup_pending so the app can retry after reconnect/reload.
    return json({ ...data, cleanupPending });
  } catch (error) {
    console.error("Game discard failed:", error);
    return json(
      { error: "Discard could not be confirmed. Reconnect and try again." },
      503,
    );
  }
});
