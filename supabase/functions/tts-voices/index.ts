// Diagnostic: asks Inworld which voices this account can actually use.
//
// The voice ids in `_shared/voices.ts` are candidates, not verified facts —
// only `Blake` has been confirmed against the live API. Deploy this, call it
// once while signed in, then keep the ids that appear and delete the rest.
//
// Safe to delete once the casting in voices.ts is settled.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { requireUser } from "../_shared/guard.ts";
import { PERSONAS } from "../_shared/voices.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body, null, 2), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  const guard = await requireUser(req, cors, { functionName: "tts-voices", hourlyLimit: 10 });
  if (!guard.ok) return guard.response;

  const key = Deno.env.get("INWORLD_API_KEY");
  if (!key) return json({ error: "INWORLD_API_KEY is not configured" }, 500);

  const response = await fetch("https://api.inworld.ai/tts/v1/voices", {
    headers: { Authorization: `Basic ${key}` },
  });

  const raw = await response.text();
  if (!response.ok) {
    return json({ error: "Voice listing failed", status: response.status, body: raw.slice(0, 2000) }, 502);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "Inworld returned non-JSON", body: raw.slice(0, 2000) }, 502);
  }

  const voices = (parsed as { voices?: Array<Record<string, unknown>> }).voices ?? [];

  // Each voice carries a description and tags — that is the actual casting
  // signal. A bare id list tells you nothing about how a voice sounds, which is
  // how the first pass ended up choosing by name.
  const described = voices
    .map((v) => ({
      voiceId: String(v.voiceId ?? v.name ?? v.id ?? ""),
      description: typeof v.description === "string" ? v.description : "",
      tags: Array.isArray(v.tags) ? (v.tags as unknown[]).map(String) : [],
      languages: Array.isArray(v.languages) ? (v.languages as unknown[]).map(String) : [],
    }))
    .filter((v) => v.voiceId);

  // English only: the app narrates in English, and 282 entries is more than is
  // useful to read through.
  const english = described.filter((v) => v.languages.length === 0 || v.languages.includes("en"));

  // Surface the ones whose description or tags suggest they suit this app —
  // a starting point for auditioning, not a decision.
  const HORROR_HINTS =
    /deep|dark|sinister|menac|ominous|grave|somber|sombre|solemn|gritty|raspy|gravel|whisper|calm|soothing|narrat|documentar|trailer|dramatic|intense|villain|eerie|haunt|mysterious|authoritative|commanding|weary|tired|cold/i;

  const suggested = english.filter(
    (v) => HORROR_HINTS.test(v.description) || v.tags.some((t) => HORROR_HINTS.test(t)),
  );

  const castingCandidates = Object.entries(PERSONAS).map(([name, persona]) => ({
    persona: name,
    candidates: persona.candidates.map((id) => {
      const match = english.find((v) => v.voiceId === id);
      return match ? { voiceId: id, description: match.description, tags: match.tags } : { voiceId: id, missing: true };
    }),
  }));

  return json({
    totalVoices: described.length,
    englishVoices: english.length,
    currentCasting: castingCandidates,
    suggestedForHorror: suggested,
    allEnglishVoices: english,
  });
});
