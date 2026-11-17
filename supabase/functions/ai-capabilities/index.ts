// Authenticated model-availability probe. Listing models does not generate content.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { requireUser } from "../_shared/guard.ts";
import {
  IMAGE_PROVIDER, LOVABLE_IMAGE_MODELS, LOVABLE_TEXT_MODELS, OPENAI_MODELS, TEXT_PROVIDER,
} from "../_shared/models.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const guard = await requireUser(req, cors, { functionName: "ai-capabilities", hourlyLimit: 10 });
  if (!guard.ok) return guard.response;

  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
  const provider = new URL(req.url).searchParams.get("provider") ?? "lovable";
  if (provider !== "openai" && provider !== "lovable") return json({ error: "Unknown provider" }, 400);

  const direct = provider === "openai";
  const secret = direct ? "OPENAI_API_KEY" : "LOVABLE_API_KEY";
  const apiKey = Deno.env.get(secret);
  if (!apiKey) return json({ error: `${secret} is not configured` }, 500);

  let parsed: unknown;
  try {
    const endpoint = direct ? "https://api.openai.com/v1/models" : "https://ai.gateway.lovable.dev/v1/models";
    const upstream = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) {
      return json({ error: "Provider model listing failed", provider, status: upstream.status }, 502);
    }
    parsed = await upstream.json();
  } catch {
    return json({ error: "Provider model listing unavailable", provider }, 502);
  }

  const models = (parsed as { data?: Array<Record<string, unknown>> } | null)?.data ?? [];
  const ids = models.map((m) => String(m.id ?? ""));

  // The gateway does not necessarily flag image capability in a stable field,
  // so report both a heuristic match and the raw list for eyeballing.
  const looksLikeImageModel = (id: string) => /image|imagen|dall|banana/i.test(id);

  return new Response(
    JSON.stringify({
      provider,
      activeTextProvider: TEXT_PROVIDER,
      activeImageProvider: IMAGE_PROVIDER,
      totalModels: ids.length,
      imageCandidatesAvailable: (direct ? [OPENAI_MODELS.image] : LOVABLE_IMAGE_MODELS).filter((c) => ids.includes(c)),
      textCandidatesAvailable: (direct
        ? [...new Set([OPENAI_MODELS.prose, OPENAI_MODELS.utility, OPENAI_MODELS.death])]
        : LOVABLE_TEXT_MODELS).filter((c) => ids.includes(c)),
      idsLookingLikeImageModels: ids.filter(looksLikeImageModel),
      allModelIds: ids,
    }, null, 2),
    { headers: { ...cors, "Content-Type": "application/json" } },
  );
});
