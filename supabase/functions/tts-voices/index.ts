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

  // The exact response shape is not documented here, so report the ids we can
  // find plus the raw payload for eyeballing.
  const voices = (parsed as { voices?: Array<Record<string, unknown>> }).voices ?? [];
  const ids = voices
    .map((v) => String(v.voiceId ?? v.name ?? v.id ?? ""))
    .filter(Boolean);

  const castingCandidates = Object.entries(PERSONAS).map(([name, persona]) => ({
    persona: name,
    candidates: persona.candidates,
    available: persona.candidates.filter((c) => ids.includes(c)),
  }));

  return json({
    totalVoices: ids.length,
    allVoiceIds: ids,
    castingCandidates,
    rawFirstEntry: voices[0] ?? null,
  });
});
