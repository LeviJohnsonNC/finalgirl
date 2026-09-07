// Produces a short "look book" paragraph for one game — film stock, palette,
// light quality, lens character — generated once when the game starts.
//
// Both the opening still and the closing poster are given this same text, which
// is what makes a session's two images read as frames from one film rather than
// two unrelated pictures. Cheap: one short text call per game.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { requireUser } from "../_shared/guard.ts";
import { VisualBibleRequestSchema, validateRequest } from "../_shared/validation.ts";
import { generateText, statusFor, userFacingMessage } from "../_shared/aiGateway.ts";
import { buildVisualBiblePrompt, VISUAL_BIBLE_SYSTEM } from "../_shared/prompts.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const guard = await requireUser(req, cors, {
      functionName: "generate-visual-bible",
      hourlyLimit: 30,
    });
    if (!guard.ok) return guard.response;

    const validation = validateRequest(VisualBibleRequestSchema, await req.json());
    if (!validation.success) return validation.error;

    const { text, model } = await generateText({
      system: VISUAL_BIBLE_SYSTEM,
      user: buildVisualBiblePrompt(validation.data),
      maxTokens: 200,
      temperature: 1,
    });

    guard.logUsage({ model, kind: "visual-bible" });
    return json({ visualBible: text, model });
  } catch (error) {
    console.error("Error in generate-visual-bible:", error);
    return json({ error: userFacingMessage(error) }, statusFor(error));
  }
});
