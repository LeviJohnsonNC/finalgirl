import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { StoryRequestSchema, validateRequest } from "../_shared/validation.ts";
import { requireUser } from "../_shared/guard.ts";
import { OPENING_SYSTEM, buildOpeningUser } from "../_shared/storyPrompts.ts";
import { statusFor, streamChat, userFacingMessage } from "../_shared/aiGateway.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    // Auth + rate limit
    const guard = await requireUser(req, cors, { functionName: "generate-story", hourlyLimit: 30 });
    if (!guard.ok) return guard.response;

    const body = await req.json();
    const validation = validateRequest(StoryRequestSchema, body, cors);
    if (!validation.success) return validation.error;

    const systemPrompt = OPENING_SYSTEM;
    const userPrompt = buildOpeningUser(validation.data);

    const { body: stream, model } = await streamChat({ system: systemPrompt, user: userPrompt });
    await guard.logUsage({ model, kind: "story" });

    // Forward the SSE stream directly to the client.
    return new Response(stream, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("generate-story error:", error);
    return new Response(JSON.stringify({ error: userFacingMessage(error) }),
      { status: statusFor(error), headers: { ...cors, "Content-Type": "application/json" } });
  }
});

