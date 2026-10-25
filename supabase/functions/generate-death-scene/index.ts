import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/auth.ts";
import { requireUser } from "../_shared/guard.ts";
import { DeathRequestSchema, validateRequest } from "../_shared/validation.ts";
import {
  generateText,
  statusFor,
  userFacingMessage,
  GatewayError,
} from "../_shared/aiGateway.ts";
import { DEATH_MODEL_CANDIDATES } from "../_shared/models.ts";
import { deathPrompt } from "../_shared/deathPrompt.ts";
import {
  deathFacts,
  deathSignature,
  isCompleteDeathText,
  DEATH_GENERATION_TIMEOUT_MS,
} from "../_shared/play/death.ts";
import { validPlayLog } from "../_shared/play/events.ts";

type ClaimSlot =
  | { action: "cached"; id: string; text: string; model?: string }
  | { action: "busy"; id: string }
  | { action: "generate"; id: string; lease: string };
function isClaimSlot(value: unknown): value is ClaimSlot {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string" || !v.id.length) return false;
  if (v.action === "cached")
    return (
      typeof v.text === "string" &&
      v.text.length >= 10 &&
      v.text.length <= 1600 &&
      (v.model === undefined || v.model === null || typeof v.model === "string")
    );
  if (v.action === "busy") return true;
  return (
    v.action === "generate" && typeof v.lease === "string" && v.lease.length > 0
  );
}

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...cors,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let admin: ReturnType<typeof createClient> | undefined;
  let claim: { id: string; lease: string } | undefined;
  try {
    const parsed = validateRequest(DeathRequestSchema, await req.json(), cors);
    if (!parsed.success) return parsed.error;
    const { sessionId, eventId, take, narrativeProfile } = parsed.data;
    const auth = req.headers.get("Authorization");
    if (!auth)
      return json({ error: "Sign in to generate a death scene." }, 401);
    const url = Deno.env.get("SUPABASE_URL"),
      anonKey = Deno.env.get("SUPABASE_ANON_KEY"),
      serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey)
      return json({ error: "Scene service unavailable." }, 503);
    const client = createClient(url, anonKey, {
      global: { headers: { Authorization: auth } },
    });
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();
    if (authError || !user)
      return json({ error: "Sign in to generate a death scene." }, 401);
    const { data: session, error: sessionError } = await client
      .from("play_sessions")
      .select("state")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (sessionError)
      return json(
        { error: "Cloud game unavailable. Your recorded death is safe." },
        503,
      );
    const state = session?.state;
    if (
      !state ||
      !validPlayLog(state.playEvents) ||
      !state.selection ||
      ![
        state.selection.killer,
        state.selection.location,
        state.selection.finalGirl,
      ].every((x) => typeof x === "string" && x.length <= 100)
    )
      return json({ error: "Sync this game before generating a scene." }, 409);
    const facts = deathFacts(state.selection, state.playEvents, eventId);
    if (!facts)
      return json({ error: "That death is not active in this game." }, 409);
    // Old open tabs still expect the pre-profile hash during backend-first rollout.
    const signature = await deathSignature(facts, narrativeProfile ? "current" : "legacy");
    admin = createClient(url, serviceKey);
    const claimScene = () =>
      admin!.rpc("claim_death_scene", {
        p_user_id: user.id,
        p_session_id: sessionId,
        p_event_id: eventId,
        p_signature: signature,
        p_take: take,
      });
    const { data: rawSlot, error: claimError } = await claimScene();
    if (claimError || !isClaimSlot(rawSlot))
      return json(
        { error: "Could not reserve this scene. Your recorded death is safe." },
        503,
      );
    let slot = rawSlot;
    if (slot.action === "cached" && !isCompleteDeathText(slot.text)) {
      // Only invalidate the exact fragment we read. A concurrent completed repair
      // must never be overwritten. The existing RPC then grants one repair lease.
      const { error: repairError } = await admin
        .from("play_death_scenes")
        .update({ status: "failed" })
        .eq("id", slot.id)
        .eq("user_id", user.id)
        .eq("status", "ready")
        .eq("scene_text", slot.text);
      if (repairError)
        return json(
          {
            error:
              "The unfinished scene could not be reopened. Please try again.",
          },
          503,
        );
      const repaired = await claimScene();
      if (repaired.error || !isClaimSlot(repaired.data))
        return json(
          {
            error:
              "The unfinished scene could not be reserved. Please try again.",
          },
          503,
        );
      slot = repaired.data;
      if (slot.action === "cached" && !isCompleteDeathText(slot.text))
        return json(
          { error: "The saved scene is unfinished. Please try again." },
          503,
        );
    }
    const scene = (id: string, text: string, model?: string) => ({
      id,
      session_id: sessionId,
      event_id: eventId,
      signature,
      take,
      scene_text: text,
      model,
      status: "ready",
    });
    if (slot.action === "cached")
      return json({
        scene: scene(slot.id, slot.text, slot.model),
        cached: true,
      });
    if (slot.action === "busy")
      return json(
        {
          error:
            "This death is already being written. Close and reopen the details in a moment to load it.",
          busy: true,
        },
        409,
      );
    if (
      slot.action !== "generate" ||
      typeof slot.id !== "string" ||
      typeof slot.lease !== "string"
    )
      return json({ error: "Scene service unavailable." }, 503);
    claim = { id: slot.id, lease: slot.lease };
    // Cache and concurrency claim precede the allowance; a replay never reserves paid work.
    const guard = await requireUser(req, cors, {
      functionName: "generate-death-scene",
      hourlyLimit: 60,
      dailyLimit: 200,
    });
    if (!guard.ok) {
      await admin
        .from("play_death_scenes")
        .update({ status: "failed" })
        .eq("id", claim.id)
        .eq("lease", claim.lease);
      return guard.response;
    }
    if (guard.user.id !== user.id) throw new Error("Account changed");
    const { data: earlier } = await client
      .from("play_death_scenes")
      .select("scene_text")
      .eq("session_id", sessionId)
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(3);
    const prompt = deathPrompt(
      facts,
      (earlier ?? []).map((r) => r.scene_text).filter(isCompleteDeathText),
    );
    const { text, model } = await generateText({
      ...prompt,
      candidates: DEATH_MODEL_CANDIDATES,
      // Gemini shares this allowance between reasoning and visible prose.
      // Keep prose at 100–150 words through the prompt, not a tiny combined cap.
      maxTokens: 4096,
      reasoningEffort: "low",
      requireComplete: true,
      temperature: 0.95,
      signal: AbortSignal.timeout(DEATH_GENERATION_TIMEOUT_MS),
      singleAttempt: true,
    });
    await guard.logUsage({ model, kind: "death" });
    if (!isCompleteDeathText(text))
      throw new GatewayError(
        "incomplete_response",
        "Death scene was not a complete paragraph",
      );
    const { data: saved, error: saveError } = await admin
      .from("play_death_scenes")
      .update({ status: "ready", scene_text: text, model })
      .eq("id", claim.id)
      .eq("lease", claim.lease)
      .select("id")
      .maybeSingle();
    if (saveError || !saved) throw new Error("Scene could not be saved");
    return json({ scene: scene(claim.id, text, model), cached: false });
  } catch (error) {
    if (admin && claim)
      await admin
        .from("play_death_scenes")
        .update({ status: "failed" })
        .eq("id", claim.id)
        .eq("lease", claim.lease)
        .eq("status", "pending");
    console.error("Death scene failed:", error);
    if (error instanceof Error && error.name === "TimeoutError")
      return json({
        code: "generation_timeout",
        error: "The writer took too long. Your death and its details are saved. Try Gruesome Death again when you’re ready.",
      }, 504);
    return json(
      {
        error: `${userFacingMessage(error)} The death is still recorded. Retry is optional and may use another AI call.`,
      },
      statusFor(error),
    );
  }
});
