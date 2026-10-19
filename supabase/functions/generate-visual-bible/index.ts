// Establish stable cast identity, location architecture and palette once per game.
// Preserve the existing string checkpoint format so older sessions still resume.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { requireUser } from "../_shared/guard.ts";
import { VisualBibleRequestSchema, validateRequest } from "../_shared/validation.ts";
import { generateText, statusFor, userFacingMessage } from "../_shared/aiGateway.ts";
import { buildVisualBiblePrompt, VISUAL_BIBLE_SYSTEM, parseVisualBible } from "../_shared/prompts.ts";

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

    const validation = validateRequest(VisualBibleRequestSchema, await req.json(), cors);
    if (!validation.success) return validation.error;

    const { text, model } = await generateText({
      system: VISUAL_BIBLE_SYSTEM,
      user: buildVisualBiblePrompt(validation.data),
      maxTokens: 4000,
      temperature: 0.5,
      reasoningEffort: "low",
      requireComplete: true,
    });

    await guard.logUsage({ model, kind: "visual-bible" });
    const visualBible = parseVisualBible(text);
    if (!visualBible) throw new Error("The continuity record was incomplete.");
    return json({ visualBible, model });
  } catch (error) {
    console.error("Error in generate-visual-bible:", error);
    return json({ error: userFacingMessage(error) }, statusFor(error));
  }
});

