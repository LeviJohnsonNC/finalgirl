// Diagnostic: asks the Lovable AI Gateway what models it actually offers.
//
// This exists because model availability on the gateway changes over time and
// the image model we depend on must be confirmed rather than assumed. Deploy,
// call it once while signed in, and use the reported ids to set
// LOVABLE_IMAGE_MODEL / LOVABLE_TEXT_MODEL (see _shared/models.ts).
//
// Safe to delete once the model ids are pinned.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { requireUser } from "../_shared/guard.ts";
import { IMAGE_MODEL_CANDIDATES, TEXT_MODEL_CANDIDATES } from "../_shared/models.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const guard = await requireUser(req, cors, { functionName: "ai-capabilities", hourlyLimit: 10 });
  if (!guard.ok) return guard.response;

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const raw = await upstream.text();
  if (!upstream.ok) {
    return new Response(
      JSON.stringify({ error: "Gateway model listing failed", status: upstream.status, body: raw.slice(0, 2000) }),
      { status: 502, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new Response(JSON.stringify({ error: "Gateway returned non-JSON", body: raw.slice(0, 2000) }), {
      status: 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const models = (parsed as { data?: Array<Record<string, unknown>> }).data ?? [];
  const ids = models.map((m) => String(m.id ?? ""));

  // The gateway does not necessarily flag image capability in a stable field,
  // so report both a heuristic match and the raw list for eyeballing.
  const looksLikeImageModel = (id: string) => /image|imagen|dall|banana/i.test(id);

  return new Response(
    JSON.stringify({
      totalModels: ids.length,
      imageCandidatesAvailable: IMAGE_MODEL_CANDIDATES.filter((c) => ids.includes(c)),
      textCandidatesAvailable: TEXT_MODEL_CANDIDATES.filter((c) => ids.includes(c)),
      idsLookingLikeImageModels: ids.filter(looksLikeImageModel),
      allModelIds: ids,
    }, null, 2),
    { headers: { ...cors, "Content-Type": "application/json" } },
  );
});
