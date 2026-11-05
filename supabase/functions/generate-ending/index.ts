import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { validateRequest, EndingRequestSchema } from "../_shared/validation.ts";
import { requireUser } from "../_shared/guard.ts";
import { ENDING_SYSTEM, buildEndingUser } from "../_shared/storyPrompts.ts";
import { statusFor, userFacingMessage } from "../_shared/aiGateway.ts";

import { generateEvaluatedStory } from "../_shared/storyEvaluation.ts";
import { generateEndingWithRecovery } from "../_shared/endingRecovery.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get("origin"));

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    // Auth + rate limit
    const guard = await requireUser(req, cors, {
      functionName: "generate-ending",
      hourlyLimit: 30,
    });
    if (!guard.ok) return guard.response;

    const body = await req.json();

    // Validate request
    const validation = validateRequest(EndingRequestSchema, body, cors);
    if (!validation.success) {
      return validation.error;
    }

    const systemPrompt = ENDING_SYSTEM;
    const {endingStreamVersion, ...context} = validation.data;
    const userPrompt = buildEndingUser(context);

    const options = {
      guard,
      kind: "ending" as const,
      request: body,
      context,
      system: systemPrompt,
      user: userPrompt,
    };
    let stream: ReadableStream<Uint8Array>;
    if (endingStreamVersion === 1) stream = generateEndingWithRecovery(options,context,req.signal);
    else {
      const result = await generateEvaluatedStory(options);
      stream = result.body;
      await guard.logUsage({model:result.model,kind:'ending'});
    }

    return new Response(stream, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in generate-ending:", error);
    return new Response(JSON.stringify({ error: userFacingMessage(error) }), {
      status: statusFor(error),
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
